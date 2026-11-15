import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export type FoamMood = 'write' | 'record' | 'archive' | 'share' | 'sharePage' | 'welcome' | 'home' | 'cloud' | 'install' | 'overview' | 'finale';
type Props = { mood: FoamMood; progress?: number; pointer?: RefObject<{ x: number; y: number } | null>; reducedMotion?: boolean; className?: string };
type Bubble = { x: number; y: number; size: number; phase: number; speed: number; tone: number; drift: number };

const profiles: Record<FoamMood, { colors: string[]; lobes: [number, number, number, number][]; count: number }> = {
  write: { colors: ['#b9dce1', '#86c4bd', '#dfc4c9', '#f3dfaf'], lobes: [[.63,.46,.20,.34],[.81,.68,.13,.17],[.52,.73,.12,.14]], count: 260 },
  record: { colors: ['#efb5b6', '#edc28f', '#e7d7a8', '#bdcfd1', '#d6b7ca'], lobes: [[.57,.50,.28,.26],[.73,.35,.18,.19],[.76,.70,.18,.17]], count: 360 },
  archive: { colors: ['#9ac7c8', '#8eb4bd', '#a9b7d1', '#d5d1b8'], lobes: [[.62,.49,.22,.33],[.43,.65,.15,.18],[.81,.51,.13,.24]], count: 275 },
  share: { colors: ['#efc6a4', '#e9b8c5', '#cfc5dd', '#d6d7ad'], lobes: [[.58,.47,.26,.24],[.78,.60,.16,.17],[.38,.64,.13,.14]], count: 225 },
  sharePage: { colors: ['#e7b9bd', '#efce9f', '#b7d2d0', '#cec0df'], lobes: [[.52,.18,.24,.12],[.59,.84,.22,.10]], count: 220 },
  welcome: { colors: ['#b1d4d1', '#c4dae1', '#ecc7ae', '#e7d9b9'], lobes: [[.73,.49,.23,.30],[.53,.66,.16,.17]], count: 195 },
  home: { colors: ['#d7bed7', '#aacbd0', '#e9cfaa', '#b6c6a6'], lobes: [[.69,.35,.15,.17],[.81,.60,.13,.21],[.51,.69,.16,.12]], count: 235 },
  cloud: { colors: ['#adc2ce', '#c2b7d1', '#dfc4cf', '#c1d6c7'], lobes: [[.68,.52,.28,.22],[.48,.37,.14,.15]], count: 190 },
  install: { colors: ['#d8b9a9', '#edcd9e', '#a8cfc0', '#d6c5d5'], lobes: [[.69,.45,.20,.29],[.46,.71,.18,.16]], count: 205 },
  overview: { colors: ['#a7c9d6', '#c9b8d4', '#d8c5c8', '#a9d2be'], lobes: [[.64,.42,.18,.20],[.78,.67,.14,.18]], count: 215 },
  finale: { colors: ['#e9bdad', '#e4d3a8', '#a7c8c4', '#c4bdd9'], lobes: [[.56,.50,.23,.25],[.77,.61,.16,.17]], count: 230 },
};

const random = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function createBubbles(mood: FoamMood): Bubble[] {
  const profile = profiles[mood];
  const bubbles: Bubble[] = [];
  for (let i = 0; i < profile.count; i++) {
    const lobe = profile.lobes[Math.floor(random(i * 11 + 3) * profile.lobes.length)];
    const angle = random(i * 19 + 7) * Math.PI * 2;
    const radius = Math.sqrt(random(i * 23 + 13));
    let x = lobe[0] + Math.cos(angle) * radius * lobe[2];
    let y = lobe[1] + Math.sin(angle) * radius * lobe[3];
    const along = random(i * 47 + 37);
    const across = random(i * 53 + 41) - .5;
    if (mood === 'archive') {
      x = .36 + along * .55;
      y = .50 + Math.sin(along * 4.6 + .3) * .075 + across * (.20 + .08 * Math.sin(along * 8));
    } else if (mood === 'share') {
      const theta = along * Math.PI * 2;
      const irregular = .85 + across * .34 + Math.sin(theta * 3 + .5) * .08;
      x = .62 + Math.cos(theta) * .25 * irregular;
      y = .51 + Math.sin(theta) * .24 * irregular;
      if (i % 9 === 0) { x = lobe[0] + Math.cos(angle) * radius * lobe[2]; y = lobe[1] + Math.sin(angle) * radius * lobe[3]; }
    } else if (mood === 'sharePage') {
      x = .32 + along * .54 + Math.sin(along * 8) * .025;
      y = (i % 2 === 0 ? .82 : .94) + across * .16;
    } else if (mood === 'cloud') {
      x = .37 + along * .54;
      y = .47 + Math.sin(along * 7.2) * .11 + across * .20;
    } else if (mood === 'home') {
      const side = i % 3 === 0 ? .33 : .91;
      x = side + across * .23 + Math.sin(along * 7) * .025;
      y = .43 + along * .29 + Math.sin(along * 6) * .04;
    } else if (mood === 'install') {
      const theta = (-.72 + along * 1.48) * Math.PI;
      x = .70 + Math.cos(theta) * (.21 + across * .10);
      y = .51 + Math.sin(theta) * (.30 + across * .07);
    } else if (mood === 'overview') {
      x = .43 + along * .49 + across * .10;
      y = .31 + along * .43 + Math.sin(along * 8.5) * .055 + across * .14;
    } else if (mood === 'finale') {
      const theta = along * Math.PI * 2;
      const spread = .13 + .17 * random(i * 61 + 11);
      x = .64 + Math.cos(theta) * spread * 1.25;
      y = .54 + Math.sin(theta) * spread * .78;
    }
    bubbles.push({
      x, y,
      size: 2.1 + Math.pow(random(i * 29 + 17), 2.7) * 14,
      phase: random(i * 31 + 19) * Math.PI * 2,
      speed: .3 + random(i * 37 + 23) * .8,
      tone: Math.floor(random(i * 41 + 29) * profile.colors.length),
      drift: .004 + random(i * 43 + 31) * .014,
    });
  }
  return bubbles.sort((a, b) => b.size - a.size);
}

const TAU = Math.PI * 2;
const tintCache = new Map<string, string>();
const tint = (hex: string, alpha: number) => {
  const key = `${hex}${alpha}`;
  let value = tintCache.get(key);
  if (!value) {
    const n = parseInt(hex.slice(1), 16);
    value = `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${alpha})`;
    tintCache.set(key, value);
  }
  return value;
};

// Pigment foam, after the watercolour bubble references (ref-20, ref-22 to ref-25):
// colour pools between bubbles and settles on the walls, while each bubble's
// centre stays pale like paper showing through. Tiny ones are pigment granules.
// Push the pastel palette towards pigment: more saturated, optionally darker.
const pigmentCache = new Map<string, string>();
const pigment = (hex: string, saturate: number, darken: number) => {
  const key = `${hex}${saturate}${darken}`;
  let value = pigmentCache.get(key);
  if (!value) {
    const n = parseInt(hex.slice(1), 16);
    const rgb = [n >> 16, (n >> 8) & 255, n & 255];
    const grey = (rgb[0] + rgb[1] + rgb[2]) / 3;
    value = `#${rgb.map(c => Math.round(Math.min(255, Math.max(0, (grey + (c - grey) * saturate) * darken)))
      .toString(16).padStart(2, '0')).join('')}`;
    pigmentCache.set(key, value);
  }
  return value;
};
const vivid = (hex: string) => pigment(hex, 2.1, .95);
const deep = (hex: string) => pigment(hex, 2.3, .74);

function drawWash(context: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  const reach = r * 4.4;
  const ink = vivid(color);
  const wash = context.createRadialGradient(x, y, 0, x, y, reach);
  wash.addColorStop(0, tint(ink, .34));
  wash.addColorStop(.45, tint(ink, .18));
  wash.addColorStop(1, tint(ink, 0));
  context.globalAlpha = alpha;
  context.fillStyle = wash;
  context.beginPath(); context.arc(x, y, reach, 0, TAU); context.fill();
}

function drawBubble(context: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  const wall = deep(color);
  if (r < 3) {
    context.globalAlpha = alpha * .85;
    context.fillStyle = wall;
    context.beginPath(); context.arc(x, y, r * .8, 0, TAU); context.fill();
    return;
  }
  const cell = context.createRadialGradient(x, y, r * .15, x, y, r);
  cell.addColorStop(0, 'rgba(255,253,246,.78)');
  cell.addColorStop(.7, 'rgba(255,253,246,.5)');
  cell.addColorStop(1, tint(vivid(color), .85));
  context.globalAlpha = alpha;
  context.fillStyle = cell;
  context.beginPath(); context.arc(x, y, r, 0, TAU); context.fill();
  context.globalAlpha = alpha * .9;
  context.strokeStyle = wall; context.lineWidth = Math.max(1, r * .1);
  context.stroke();
}

const bubblesByMood = Object.fromEntries(
  (Object.keys(profiles) as FoamMood[]).map(key => [key, createBubbles(key)]),
) as Record<FoamMood, Bubble[]>;

export function LivingFoam({ mood, progress, pointer, reducedMotion = false, className = '' }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef({ mood, progress, pointer, reducedMotion });
  state.current = { mood, progress, pointer, reducedMotion };

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const names: FoamMood[] = ['write', 'record', 'archive', 'share'];
    let frame = 0;
    let timer = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let localPointer: { x: number; y: number } | null = null;
    const onPointerMove = (event: PointerEvent) => {
      if (state.current.pointer) return;
      const rect = element.getBoundingClientRect();
      localPointer = event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom
        ? { x: event.clientX - rect.left, y: event.clientY - rect.top } : null;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    const resize = () => {
      const rect = element.getBoundingClientRect();
      width = rect.width; height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = Math.max(1, Math.round(width * dpr));
      element.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (state.current.reducedMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        element.dispatchEvent(new Event('foam-redraw'));
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const render = (now: number) => {
      const { mood: currentMood, progress: currentProgress, pointer: pointerRef, reducedMotion: still } = state.current;
      const bounds = element.getBoundingClientRect();
      const visible = bounds.right > -120 && bounds.left < window.innerWidth + 120 &&
        bounds.bottom > -120 && bounds.top < window.innerHeight + 120;
      if (!visible) {
        timer = window.setTimeout(() => { frame = requestAnimationFrame(render); }, 250);
        return;
      }
      context.clearRect(0, 0, width, height);
      const motionOff = still || motionPreference?.matches;
      const t = motionOff ? 0 : now * .001;
      const p = currentProgress ?? -1;
      const first = p < 0 ? currentMood : names[Math.max(0, Math.min(3, Math.floor(p)))];
      const second = p < 0 ? currentMood : names[Math.max(0, Math.min(3, Math.ceil(p)))];
      const blend = p < 0 ? 0 : p - Math.floor(p);
      const draw = (key: FoamMood, opacity: number) => {
        if (opacity <= .005) return;
        const profile = profiles[key];
        const bubbles = bubblesByMood[key];
        const mobile = width < 600;
        const baseScale = mobile ? Math.min(width / 390, height / 700) : Math.min(width / 900, height / 650);
        const scale = baseScale * (currentProgress === undefined ? 1.75 : 1);
        type Placed = { x: number; y: number; radius: number; color: string; tone: number; life: number; i: number; phase: number; gathering: number; changing: boolean; big: boolean };
        const placed: Placed[] = [];
        for (let i = 0; i < bubbles.length; i++) {
          const b = bubbles[i];
          const breathing = motionOff ? 1 : 1 + Math.sin(t * b.speed + b.phase) * .14;
          let x = (b.x - (mobile ? .17 : 0)) * width + Math.sin(t * b.speed * .6 + b.phase) * b.drift * width;
          let y = b.y * height + Math.cos(t * b.speed * .5 + b.phase) * b.drift * height;
          const point = pointerRef?.current ?? localPointer;
          if (point && !motionOff) {
            const dx = x - point.x, dy = y - point.y;
            const distance = Math.hypot(dx, dy);
            const reach = Math.max(90, width * .12);
            if (distance < reach && distance > 1) {
              const push = (1 - distance / reach) * 26;
              x += dx / distance * push; y += dy / distance * push;
            }
          }
          const cycle = (t * (.065 + b.speed * .018) + b.phase / (Math.PI * 2)) % 1;
          const changing = !motionOff && i % 13 === 0;
          // A few points repeatedly gather into one chamber, then separate and fade.
          const gathering = changing ? (1 - Math.cos(cycle * Math.PI * 2)) * .5 : 0;
          const life = changing ? .36 + gathering * .64 : 1;
          const radius = Math.max(1.2, b.size * scale * breathing * (changing ? .72 + gathering * .42 : 1));
          placed.push({ x, y, radius, color: profile.colors[b.tone], tone: b.tone, life, i, phase: b.phase,
            gathering, changing: changing && b.size > 6, big: b.size > 5 });
        }
        // 1. Pigment wash pooled around the larger bubbles.
        for (const q of placed) if (q.big) drawWash(context, q.x, q.y, q.radius, q.color, opacity * q.life * .75);
        // 2. Pale cells with pigment walls; big ones pack small neighbours against one side.
        const granules: number[][] = profile.colors.map(() => []);
        for (const q of placed) {
          const { x, y, radius, color, life, i } = q;
          if (q.changing) {
            const separation = radius * (2.3 - q.gathering * 1.8);
            const satelliteRadius = radius * (.35 - q.gathering * .21);
            for (const side of [-1, 1]) {
              drawBubble(context, x + side * separation, y + side * separation * .28,
                Math.max(1, satelliteRadius), color, opacity * (1 - q.gathering) * life);
            }
          }
          drawBubble(context, x, y, radius, color, opacity * life);
          if (radius > 8) {
            const start = q.phase;
            const span = Math.PI * (.75 + random(i * 5 + 1) * .7);
            const neighbours = 3 + Math.floor(random(i * 3 + 2) * 4);
            for (let k = 0; k < neighbours; k++) {
              const angle = start + random(i * 59 + k) * span;
              const nr = radius * (.14 + random(i * 61 + k) * .32);
              const reach = radius + nr * .62;
              drawBubble(context, x + Math.cos(angle) * reach, y + Math.sin(angle) * reach, nr, color, opacity * life);
            }
            const count = Math.min(34, Math.floor(radius * 1.5));
            for (let k = 0; k < count; k++) {
              const u = random(i * 7 + k);
              const angle = start + u * u * span;
              const reach = radius * (.96 + random(i * 13 + k) * .3);
              granules[q.tone].push(x + Math.cos(angle) * reach, y + Math.sin(angle) * reach,
                .35 + Math.pow(random(i * 17 + k * 3), 2) * Math.min(1.4, radius * .07));
            }
          }
        }
        // 3. Pigment granules settled along the walls.
        context.globalAlpha = opacity * .8;
        granules.forEach((list, tone) => {
          if (!list.length) return;
          context.fillStyle = deep(profile.colors[tone]);
          context.beginPath();
          for (let k = 0; k < list.length; k += 3) {
            context.moveTo(list[k] + list[k + 2], list[k + 1]);
            context.arc(list[k], list[k + 1], list[k + 2], 0, TAU);
          }
          context.fill();
        });
      };
      draw(first, first === second ? 1 : 1 - blend);
      if (first !== second) draw(second, blend);
      context.globalAlpha = 1;
      if (!motionOff) timer = window.setTimeout(() => { frame = requestAnimationFrame(render); }, 32);
    };
    const redraw = () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      frame = requestAnimationFrame(render);
    };
    element.addEventListener('foam-redraw', redraw);
    motionPreference?.addEventListener('change', redraw);
    redraw();
    return () => {
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('foam-redraw', redraw);
      motionPreference?.removeEventListener('change', redraw);
      cancelAnimationFrame(frame); clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      canvas.current?.dispatchEvent(new Event('foam-redraw'));
    }
  }, [mood, progress, reducedMotion]);

  return <canvas ref={canvas} className={`living-foam ${className}`} aria-hidden="true" />;
}
