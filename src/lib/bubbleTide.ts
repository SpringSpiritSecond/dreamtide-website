// A tide of pigment bubbles over the home page wash.
//
// The bubbles are laid along a curve that each chapter computes from its own layout: it hugs the copy,
// runs through the gap before the phones, or curls round the download print. Bubbles are biggest in the
// middle of the curve and taper at both ends; any that would land on text, screens or controls are hidden.
// When the chapter changes the same bubbles flow along to the new curve, so the page reads as one tide.
import { TAU, deep, drawBubble, drawWash } from './pigmentBubbles';

export type Point = [number, number];
/** Areas bubbles must stay out of: rectangles [x, y, w, h] or circles [x, y, r]. */
export type Keepout = { rect?: [number, number, number, number]; circle?: [number, number, number] };
export type TideShape = { path: Point[]; width: number; avoid: Keepout[]; palette: readonly (readonly number[])[]; seed: number };

type Bubble = {
  x: number; y: number; r: number; tx: number; ty: number; tr: number;
  tone: number; phase: number; speed: number; drift: number; ease: number;
};

const COUNT = 96;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// Catmull-Rom through the anchor points, sampled by arc length so bubbles spread evenly.
function sampler(points: Point[]) {
  const pts = [points[0], ...points, points[points.length - 1]];
  const seg = (i: number, t: number): Point => {
    const [p0, p1, p2, p3] = [pts[i], pts[i + 1], pts[i + 2], pts[i + 3]];
    const t2 = t * t, t3 = t2 * t;
    const f = (a: number, b: number, c: number, d: number) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
  };
  const dense: Point[] = [];
  for (let i = 0; i < points.length - 1; i++) for (let k = 0; k < 24; k++) dense.push(seg(i, k / 24));
  dense.push(points[points.length - 1]);
  const lengths = [0];
  for (let i = 1; i < dense.length; i++) lengths.push(lengths[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const total = lengths[lengths.length - 1] || 1;
  return (u: number): { p: Point; n: Point } => {
    const target = clamp(u, 0, 1) * total;
    let i = 1;
    while (i < lengths.length - 1 && lengths[i] < target) i++;
    const a = dense[i - 1], b = dense[i];
    const k = (target - lengths[i - 1]) / Math.max(1e-6, lengths[i] - lengths[i - 1]);
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    return { p: [a[0] + dx * k, a[1] + dy * k], n: [-dy / len, dx / len] };
  };
}

const blocked = (x: number, y: number, r: number, avoid: Keepout[]) => avoid.some(({ rect, circle }) => {
  if (rect) return x + r > rect[0] && x - r < rect[0] + rect[2] && y + r > rect[1] && y - r < rect[1] + rect[3];
  if (circle) return Math.hypot(x - circle[0], y - circle[1]) < circle[2] + r;
  return false;
});

/** Targets for every bubble on a chapter's curve. Bubbles that cannot be placed get radius 0 and fade out. */
function layout(shape: TideShape, S: number) {
  const along = sampler(shape.path);
  const out: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < COUNT; i++) {
    const h = (k: number) => hash(i * 13.1 + k * 7.7 + shape.seed * 3.3);
    const u = (i + h(1) * .8) / COUNT;
    // Swell in the middle of the curve, taper to fine bubbles at both ends.
    const swell = Math.pow(Math.sin(Math.PI * u), .9);
    const big = h(2) > .86 ? 1.5 : 1;
    let r = S * (3 + 25 * swell * Math.pow(h(3), 1.5) * big);
    if (i % 4 === 3) r = S * (1.8 + h(4) * 2.4);              // a few specks between the cells
    let placed = false, x = 0, y = 0;
    for (let tries = 0; tries < 7 && !placed; tries++) {
      const { p, n } = along(clamp(u + (tries ? (h(5 + tries) - .5) * .05 : 0), 0, 1));
      const spread = shape.width * 1.3 * (.3 + swell * .7) * (h(9 + tries) - .5) * 2;
      x = p[0] + n[0] * spread; y = p[1] + n[1] * spread;
      placed = !blocked(x, y, r + 6 * S, shape.avoid);
      if (!placed) r *= .85;
    }
    out.push({ x, y, r: placed ? r : 0 });
  }
  return out;
}

export type BubbleTide = { set: (shape: TideShape, instant?: boolean) => void; resize: () => void; dispose: () => void };

export function createBubbleTide(canvas: HTMLCanvasElement, reduce: boolean): BubbleTide {
  const ctx = canvas.getContext('2d');
  let W = 1, H = 1, DPR = 1, raf = 0, shape: TideShape | null = null;
  const bubbles: Bubble[] = Array.from({ length: COUNT }, (_, i) => ({
    x: 0, y: 0, r: 0, tx: 0, ty: 0, tr: 0, tone: i % 4,
    phase: hash(i * 5.3) * TAU, speed: .3 + hash(i * 9.1) * .7, drift: 2 + hash(i * 3.7) * 6,
    // Some bubbles travel quicker than others, so a change of chapter flows instead of jumping.
    ease: .028 + hash(i * 2.9) * .05,
  }));
  const live = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
  let target = live.map((c) => [...c]);
  const pointer = { x: -1e4, y: -1e4 };
  const onMove = (e: PointerEvent) => { const b = canvas.getBoundingClientRect(); pointer.x = e.clientX - b.left; pointer.y = e.clientY - b.top; };
  window.addEventListener('pointermove', onMove, { passive: true });

  const resize = () => {
    W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  };
  // Bubble colours are the chapter's pigments, softened toward paper like the drawn foam.
  const hex = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const soften = (c: readonly number[]) => c.map((v) => v + (246 - v) * .45);

  const set = (next: TideShape, instant = false) => {
    shape = next;
    const S = H / 800;
    const spots = layout(next, S);
    bubbles.forEach((b, i) => {
      const s = spots[i];
      b.tx = s.x; b.ty = s.y; b.tr = s.r;
      if (instant || reduce || b.r === 0) { b.x = s.x; b.y = s.y; if (instant || reduce) b.r = s.r; }
    });
    target = [1, 2, 3, 4].map((k) => soften(next.palette[k % next.palette.length]));
    if (instant || reduce || live[0][0] === 0) target.forEach((c, i) => { live[i] = [...c]; });
  };

  let last = performance.now();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!ctx || !shape) return;
    const f = Math.min(3, (now - last) / 16.7);
    last = now;
    const t = reduce ? 0 : now / 1000;
    live.forEach((c, i) => c.forEach((v, j) => { c[j] = v + (target[i][j] - v) * (1 - Math.pow(.96, f)); }));
    const colors = live.map(hex);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const placed: { x: number; y: number; r: number; color: string; i: number }[] = [];
    bubbles.forEach((b, i) => {
      const k = reduce ? 1 : 1 - Math.pow(1 - b.ease, f);
      b.x += (b.tx - b.x) * k; b.y += (b.ty - b.y) * k; b.r += (b.tr - b.r) * k;
      if (b.r < .6) return;
      let x = b.x + Math.sin(t * b.speed + b.phase) * b.drift;
      let y = b.y + Math.cos(t * b.speed * .8 + b.phase) * b.drift * .7;
      const dx = x - pointer.x, dy = y - pointer.y, d = Math.hypot(dx, dy);
      if (!reduce && d < 110 && d > 1) { const push = (1 - d / 110) * 22; x += dx / d * push; y += dy / d * push; }
      const r = b.r * (reduce ? 1 : 1 + Math.sin(t * b.speed * 1.3 + b.phase) * .06);
      placed.push({ x, y, r, color: colors[b.tone], i });
    });
    // Pigment pooled under the larger bubbles, then the cells, small on top of large.
    for (const q of placed) if (q.r > 9) drawWash(ctx, q.x, q.y, q.r * .9, q.color, .7);
    placed.sort((a, b) => b.r - a.r);
    for (const q of placed) {
      drawBubble(ctx, q.x, q.y, q.r, q.color, .92);
      // Big cells pack a few small neighbours against one side, like foam drying on paper.
      if (q.r > 9) {
        const start = hash(q.i * 3.1) * TAU, span = Math.PI * (.7 + hash(q.i * 4.3) * .6);
        const n = 3 + Math.floor(hash(q.i * 5.7) * 3);
        for (let k = 0; k < n; k++) {
          const a = start + hash(q.i * 59 + k) * span, nr = q.r * (.16 + hash(q.i * 61 + k) * .3);
          drawBubble(ctx, q.x + Math.cos(a) * (q.r + nr * .62), q.y + Math.sin(a) * (q.r + nr * .62), nr, q.color, .9);
        }
      }
    }
    // A few granules settled on the walls of the big ones.
    for (const q of placed) {
      if (q.r < 10) continue;
      ctx.globalAlpha = .7; ctx.fillStyle = deep(q.color); ctx.beginPath();
      for (let k = 0; k < 9; k++) {
        const a = q.i + hash(q.i * 17 + k) * Math.PI * 1.2, rr = q.r * (1 + hash(q.i * 31 + k) * .18);
        const gx = q.x + Math.cos(a) * rr, gy = q.y + Math.sin(a) * rr, gr = .5 + hash(q.i * 7 + k) * 1.1;
        ctx.moveTo(gx + gr, gy); ctx.arc(gx, gy, gr, 0, TAU);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  resize();
  raf = requestAnimationFrame(frame);
  return {
    set, resize,
    dispose: () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove); },
  };
}
