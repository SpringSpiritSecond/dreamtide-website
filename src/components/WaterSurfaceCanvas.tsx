import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export type WaterSurfaceHandle = { disturb: (x: number, y: number, strength?: number) => void };

type Surface = {
  columns: number;
  rows: number;
  current: Float32Array;
  previous: Float32Array;
  next: Float32Array;
  pixels: ImageData;
  texture: HTMLCanvasElement;
  textureContext: CanvasRenderingContext2D;
  width: number;
  height: number;
  scale: number;
};

type Ripple = { x: number; y: number; born: number; strength: number };

function traceRipple(context: CanvasRenderingContext2D, ripple: Ripple,
  radius: number, now: number, lift = 0) {
  context.beginPath();
  for (let index = 0; index <= 48; index++) {
    const angle = index / 48 * Math.PI * 2;
    const wobble = Math.sin(angle * 3 + ripple.born * .002 + now * .00045) * .023 +
      Math.sin(angle * 7 - ripple.born * .0013) * .011;
    const x = ripple.x + Math.cos(angle) * radius * (1 + wobble);
    const y = ripple.y + lift + Math.sin(angle) * radius * .78 * (1 + wobble);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
}

export const WaterSurfaceCanvas = forwardRef<WaterSurfaceHandle, { reducedMotion: boolean }>(
  function WaterSurfaceCanvas({ reducedMotion }, ref) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const surface = useRef<Surface | null>(null);
    const ripples = useRef<Ripple[]>([]);
    const frame = useRef(0);
    const reduce = useRef(reducedMotion);
    reduce.current = reducedMotion;

    const paint = () => {
      const element = canvas.current;
      const state = surface.current;
      const context = element?.getContext('2d');
      if (!element || !state || !context) return;
      const { columns, rows, current, previous, next, pixels } = state;
      const rgba = pixels.data;
      let energy = 0;
      for (let row = 1; row < rows - 1; row++) {
        for (let column = 1; column < columns - 1; column++) {
          const index = row * columns + column;
          const height = ((current[index - 1] + current[index + 1]
            + current[index - columns] + current[index + columns]) * .5 - previous[index]) * .972;
          next[index] = height;
          energy += Math.abs(height);
          const slopeX = current[index - 1] - current[index + 1];
          const slopeY = current[index - columns] - current[index + columns];
          const light = Math.max(-1, Math.min(1, (slopeX * .74 + slopeY * .5) / 18));
          const offset = index * 4;
          if (light >= 0) {
            rgba[offset] = 255;
            rgba[offset + 1] = 253;
            rgba[offset + 2] = 245;
            rgba[offset + 3] = Math.min(116, light * 108);
          } else {
            rgba[offset] = 34;
            rgba[offset + 1] = 106;
            rgba[offset + 2] = 132;
            rgba[offset + 3] = Math.min(76, -light * 72);
          }
        }
      }
      state.previous = current;
      state.current = next;
      state.next = previous;
      state.textureContext.putImageData(pixels, 0, 0);
      context.setTransform(state.scale, 0, 0, state.scale, 0, 0);
      context.clearRect(0, 0, state.width, state.height);
      context.imageSmoothingEnabled = true;
      const now = performance.now();
      ripples.current = ripples.current.filter(ripple => now - ripple.born < 1400);
      if ((energy > 8 || ripples.current.length) && !reduce.current) {
        context.drawImage(state.texture, 0, 0, state.width, state.height);
        for (const ripple of ripples.current) {
          const count = ripple.strength > .75 ? 2 : 1;
          for (let ring = 0; ring < count; ring++) {
            const age = now - ripple.born - ring * 170;
            if (age < 0) continue;
            const progress = Math.min(1, age / 1200);
            const radius = (10 + progress * 180) * (.72 + ripple.strength * .28);
            const opacity = (1 - progress) ** 1.6 * ripple.strength;
            traceRipple(context, ripple, radius, now);
            context.lineWidth = 3.4 - progress * 1.7;
            context.strokeStyle = `rgba(24,102,122,${opacity * .32})`;
            context.stroke();
            traceRipple(context, ripple, radius - 2, now, -2);
            context.lineWidth = 2.8 - progress * 1.2;
            context.strokeStyle = `rgba(255,255,248,${opacity * .66})`;
            context.stroke();
          }
        }
        frame.current = requestAnimationFrame(paint);
      } else {
        frame.current = 0;
      }
    };

    useImperativeHandle(ref, () => ({
      disturb(x, y, strength = 1) {
        const state = surface.current;
        if (!state || reduce.current) return;
        const now = performance.now();
        const previousRipple = ripples.current.at(-1);
        if (strength > .75 || !previousRipple ||
          Math.hypot(x - previousRipple.x, y - previousRipple.y) > 95 ||
          now - previousRipple.born > 480) {
          ripples.current.push({ x, y, born: now, strength: strength > .75 ? strength : strength * .85 });
          if (ripples.current.length > 24) ripples.current.shift();
        }
        const centerX = Math.round(x / state.width * state.columns);
        const centerY = Math.round(y / state.height * state.rows);
        for (let dy = -4; dy <= 4; dy++) {
          for (let dx = -4; dx <= 4; dx++) {
            const px = centerX + dx;
            const py = centerY + dy;
            if (px <= 0 || py <= 0 || px >= state.columns - 1 || py >= state.rows - 1) continue;
            const distance = dx * dx + dy * dy;
            state.current[py * state.columns + px] += Math.exp(-distance / 5) * strength * 80;
          }
        }
        if (!frame.current) frame.current = requestAnimationFrame(paint);
      },
    }), []);

    useEffect(() => {
      const element = canvas.current;
      if (!element) return;
      const resize = () => {
        const { width, height } = element.getBoundingClientRect();
        if (!width || !height) return;
        const scale = Math.min(window.devicePixelRatio || 1, 2);
        element.width = Math.round(width * scale);
        element.height = Math.round(height * scale);
        const columns = Math.max(40, Math.min(180, Math.ceil(width / 7)));
        const rows = Math.max(50, Math.min(130, Math.ceil(height / 7)));
        const texture = document.createElement('canvas');
        texture.width = columns;
        texture.height = rows;
        const textureContext = texture.getContext('2d');
        if (!textureContext) return;
        const size = columns * rows;
        surface.current = {
          columns, rows,
          current: new Float32Array(size),
          previous: new Float32Array(size),
          next: new Float32Array(size),
          pixels: textureContext.createImageData(columns, rows),
          texture, textureContext, width, height, scale,
        };
      };
      const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
      observer?.observe(element);
      if (!observer) window.addEventListener('resize', resize);
      resize();
      return () => {
        observer?.disconnect();
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(frame.current);
        frame.current = 0;
      };
    }, []);

    useEffect(() => {
      if (!reducedMotion) return;
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      ripples.current = [];
      const context = canvas.current?.getContext('2d');
      if (context && canvas.current) context.clearRect(0, 0, canvas.current.width, canvas.current.height);
    }, [reducedMotion]);

    return <canvas className="tide-water-canvas" ref={canvas} aria-hidden="true" />;
  },
);
