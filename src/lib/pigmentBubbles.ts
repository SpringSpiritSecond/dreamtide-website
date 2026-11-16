// Pigment bubbles shared by the bubble decorations: a pale paper-coloured cell with pigment settled on its wall,
// and a soft wash of the same pigment pooled around larger bubbles.

export const TAU = Math.PI * 2;
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
export const deep = (hex: string) => pigment(hex, 2.3, .74);

export function drawWash(context: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
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

export function drawBubble(context: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
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

