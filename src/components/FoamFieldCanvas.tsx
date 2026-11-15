import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

type Point = { x: number; y: number; rx: number; ry: number };
type Particle = { targets: Point[]; scatterX: number; scatterY: number; phase: number; color: number };

// Large chamber positions come from the four approved 1440 × 900 studies.
const chambers: Point[][] = [
  [[702,197,80,71],[883,211,104,95],[1058,270,67,64],[560,442,55,63],[995,560,95,103],[1109,625,37,40],[683,694,72,61],[870,682,59,52],[1011,356,40,43]].map(([x,y,rx,ry]) => ({x,y,rx,ry})),
  [[631,302,167,198],[868,296,203,214],[1039,441,205,207],[739,615,228,164],[1022,670,86,69],[509,544,73,96]].map(([x,y,rx,ry]) => ({x,y,rx,ry})),
  [[431,484,103,100],[555,553,83,88],[784,230,111,106],[992,292,133,128],[1129,594,109,97],[762,667,117,99],[1199,402,68,62]].map(([x,y,rx,ry]) => ({x,y,rx,ry})),
  [[560,304,85,78],[1163,255,80,67],[1184,664,87,77],[536,669,95,75]].map(([x,y,rx,ry]) => ({x,y,rx,ry})),
];
const centers = [[850,440,420,300],[826,448,442,320],[857,460,454,310],[840,463,442,294]];
const palettes = [
  ['#78b7af','#b7d9c7','#72a9bd','#d6c8ad'],
  ['#d9a7b1','#e8c698','#acb6d7','#d4a1c3'],
  ['#81b5b6','#b8d1a8','#7eabc0','#d4afb8'],
  ['#daa8a8','#e4ca8e','#b8b2ce','#a7c7b9'],
];
const moteInk = [
  ['#397b84','#608e8d','#628299','#a58772'],
  ['#9b617b','#ab8271','#777da2','#a47791'],
  ['#3b7f83','#778e77','#567d9a','#a5788d'],
  ['#a36b72','#ad9365','#837d9b','#6e938d'],
];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const random = (seed: number) => {
  let value = seed >>> 0;
  return () => ((value = (Math.imul(value, 1664525) + 1013904223) >>> 0) / 4294967296);
};

function makeParticles(): Particle[] {
  const rng = random(5317);
  return Array.from({ length: 76 }, (_, index) => {
    const targets = centers.map(([cx, cy, rx, ry], scene) => {
      if (index < chambers[scene].length) return chambers[scene][index];
      const angle = rng() * Math.PI * 2;
      const distance = .56 + rng() * .43;
      const radius = index < 42 ? 18 + rng() * 30 : 6 + rng() * 13;
      return { x: cx + Math.cos(angle) * rx * distance, y: cy + Math.sin(angle) * ry * distance,
        rx: radius, ry: radius * (.78 + rng() * .44) };
    });
    const angle = rng() * Math.PI * 2;
    return { targets, scatterX: Math.cos(angle) * (115 + rng() * 280),
      scatterY: Math.sin(angle) * (95 + rng() * 220), phase: rng() * Math.PI * 2, color: index % 4 };
  });
}

const particles = makeParticles();
const motes: Particle[] = (() => {
  const rng = random(82043);
  return Array.from({ length: 280 }, (_, index) => {
    const targets = centers.map(([cx,cy,rx,ry]) => {
      const angle=rng()*Math.PI*2;
      const distance=Math.sqrt(rng())*.94;
      const radius=.7+rng()*2.4;
      return { x:cx+Math.cos(angle)*rx*distance,
        y:cy+Math.sin(angle)*ry*distance, rx:radius, ry:radius };
    });
    const angle=rng()*Math.PI*2;
    return { targets, scatterX:Math.cos(angle)*(65+rng()*350),
      scatterY:Math.sin(angle)*(55+rng()*235),phase:rng()*Math.PI*2,color:index%4 };
  });
})();

// The five overlapping chambers in each approved study are moving bubbles,
// rather than a raster background. Their union is the visible foam field.
const forms: Point[][] = [
  [[538,119,477,613],[813,170,369,516],[525,466,561,316],[660,94,297,250],[931,438,290,288]],
  [[384,172,569,596],[629,85,519,592],[851,284,431,459],[554,500,571,305]],
  [[371,337,351,350],[539,172,494,583],[792,138,469,609],[1034,286,296,362],[696,482,546,307]],
  [[477,155,760,629],[375,284,465,441],[842,134,449,625],[610,463,621,340]],
].map(group => group.map(([x,y,w,h]) => ({ x:x+w/2, y:y+h/2, rx:w/2, ry:h/2 })));
const textures = ['write','record','archive','share'].map(name => {
  const image = new Image();
  image.src = import.meta.env.BASE_URL + 'media/chapter-art/' + name + '-texture.webp';
  return image;
});
const mask = document.createElement('canvas');
mask.width = 360; mask.height = 225;
const pigment = document.createElement('canvas');
pigment.width = 720; pigment.height = 450;
const film = document.createElement('canvas');
film.width = 720; film.height = 450;
const topology = document.createElement('canvas');
topology.width = 240; topology.height = 150;
const topologyContext = topology.getContext('2d', { willReadFrequently: true });
const topologyLabels = new Uint16Array(topology.width * topology.height);
const topologyDepth = new Uint8Array(topology.width * topology.height);
let topologyTime = -Infinity;
let topologyProgress = -Infinity;
let topologyApertureCount = -1;
const touchCanvas = document.createElement('canvas');
touchCanvas.width = 144; touchCanvas.height = 90;
const touchContext = touchCanvas.getContext('2d', { willReadFrequently: true });

function updateTouchField(pointer: { x: number; y: number } | null,
  left: number, top: number, boardWidth: number, boardHeight: number,
  reducedMotion: boolean) {
  if (!touchContext) return null;
  if (reducedMotion) {
    touchContext.clearRect(0,0,144,90);
    return null;
  }
  touchContext.globalCompositeOperation='destination-out';
  touchContext.fillStyle='rgba(0,0,0,.105)';
  touchContext.fillRect(0,0,144,90);
  touchContext.globalCompositeOperation='source-over';
  if (pointer) {
    const x=(pointer.x-left)/boardWidth*144;
    const y=(pointer.y-top)/boardHeight*90;
    const brush=touchContext.createRadialGradient(x,y,0,x,y,18);
    brush.addColorStop(0,'rgba(255,255,255,.76)');
    brush.addColorStop(.5,'rgba(255,255,255,.28)');
    brush.addColorStop(1,'rgba(255,255,255,0)');
    touchContext.fillStyle=brush;
    touchContext.fillRect(x-18,y-18,36,36);
  }
  return touchContext.getImageData(0,0,144,90).data;
}

function touchAt(data: Uint8ClampedArray | null, x: number, y: number) {
  if (!data) return 0;
  const column=Math.round(x/10);
  const row=Math.round(y/10);
  if (column<0 || column>=144 || row<0 || row>=90) return 0;
  return data[(row*144+column)*4+3]/255;
}

// A slow displacement shared by the foam body and the image chambers. Keeping
// both in the same flow field makes the App image feel suspended in the foam.
function flowAt(x: number, y: number, now: number, wake: number, reducedMotion: boolean) {
  if (reducedMotion) return { x: 0, y: 0 };
  return {
    x: Math.sin(now * .00028 + y * .006 + x * .0018) * 8 +
      Math.sin(now * .00019 - x * .0042) * 4 + wake * 19,
    y: Math.cos(now * .00024 + x * .005 - y * .0015) * 5 +
      Math.sin(now * .0002 + y * .004) * 3 + wake * 12,
  };
}

// One displacement field drives the chamber edge and the App pixels within it.
// Coordinates are local to the chamber, so the image bends with its membrane.
function chamberWarp(u: number, v: number, now: number, wake: number,
  pointerInfluence: number, reducedMotion: boolean) {
  if (reducedMotion) return { x: 0, y: 0 };
  const phase = now * .0011;
  return {
    x: Math.sin(v * 6.2 + phase) * (.023 + wake * .035) +
      Math.sin(u * 5.1 - v * 3.4 - phase * .62) * .013 +
      pointerInfluence * Math.sin(v * 8 - phase * 2.4) * .026,
    y: Math.cos(u * 5.4 - phase * .83) * (.019 + wake * .026) +
      Math.sin(v * 5.6 + u * 2.2 + phase * .53) * .012 +
      pointerInfluence * Math.cos(u * 7 + phase * 2.1) * .022,
  };
}

function fillFoamFragment(context: CanvasRenderingContext2D, x: number, y: number,
  rx: number, ry: number, phase: number, now: number, irregularity: number,
  filmEdge = false) {
  const count = 9;
  const points = Array.from({ length: count }, (_, index) => {
    const angle = index / count * Math.PI * 2;
    const wobble = Math.sin(angle * 3 + phase * 2.1 + now * .00041) * .62 +
      Math.cos(angle * 5 - phase * 1.7 - now * .00027) * .38;
    const radius = 1 + wobble * irregularity;
    return { x: Math.cos(angle) * rx * radius, y: Math.sin(angle) * ry * radius };
  });
  context.save();
  context.translate(x, y);
  context.rotate(phase * .34 + Math.sin(now * .0003 + phase) * irregularity * .14);
  context.beginPath();
  context.moveTo((points[count - 1].x + points[0].x) / 2,
    (points[count - 1].y + points[0].y) / 2);
  for (let index = 0; index < count; index++) {
    const current = points[index];
    const next = points[(index + 1) % count];
    context.quadraticCurveTo(current.x, current.y,
      (current.x + next.x) / 2, (current.y + next.y) / 2);
  }
  context.closePath();
  context.fill();
  if (filmEdge) {
    context.strokeStyle='rgba(255,255,247,.65)';
    context.lineWidth=Math.min(3,Math.max(1,rx*.05));
    context.shadowColor='rgba(62,127,139,.3)';
    context.shadowBlur=Math.min(5,rx*.13);
    context.stroke();
  }
  context.restore();
}

function drawFlowingTexture(context: CanvasRenderingContext2D, image: HTMLImageElement,
  now: number, scene: number, reducedMotion: boolean) {
  const strips = reducedMotion ? 1 : 36;
  for (let strip = 0; strip < strips; strip++) {
    const ratio = strip / strips;
    const sourceY = image.naturalHeight * ratio;
    const offset = reducedMotion ? 0 :
      Math.sin(now * .00031 + ratio * 6.8 + scene * 1.4) * 6 +
      Math.sin(now * .00021 - ratio * 4.2 + scene) * 3;
    context.drawImage(image, 0, sourceY, image.naturalWidth,
      image.naturalHeight / strips + 1,
      offset - 10, 450 * ratio, 740, 450 / strips + 1);
  }
}

function aperturePath(button: HTMLElement, canvasBounds: DOMRect, now: number,
  pointer: { x: number; y: number } | null, reducedMotion: boolean, wake: number,
  board: { left: number; top: number; width: number; height: number }):
  { path: Path2D; dx: number; dy: number; scaleX: number; scaleY: number } | null {
  const shape = getComputedStyle(button).getPropertyValue('--aperture-shape');
  const values = shape.match(/-?\d+(?:\.\d+)?%/g)?.map(value => Number.parseFloat(value) / 100);
  if (!values || values.length < 6 || values.length % 2 !== 0) return null;
  const bounds = button.getBoundingClientRect();
  const path = new Path2D();
  const cx = bounds.left - canvasBounds.left + bounds.width / 2;
  const cy = bounds.top - canvasBounds.top + bounds.height / 2;
  const pointerDistance = pointer ? Math.hypot(pointer.x - cx, pointer.y - cy) : Infinity;
  const pointerInfluence = reducedMotion ? 0 : Math.max(0, 1 - pointerDistance / Math.max(bounds.width, bounds.height) / 1.7);
  const field = flowAt((cx - board.left) / board.width * 1440,
    (cy - board.top) / board.height * 900, now, wake, reducedMotion);
  const pointerAngle = Math.atan2(cy - (pointer?.y ?? cy), cx - (pointer?.x ?? cx));
  const dx = (field.x * 2.35 + Math.cos(pointerAngle) * pointerInfluence * 28) * board.width / 1440;
  const dy = (field.y * 2.2 + Math.sin(pointerAngle) * pointerInfluence * 24) * board.height / 900;
  // The chamber breathes as a whole. Its photograph uses these same dimensions
  // below, so neither the membrane nor the content can sit still independently.
  const phase = now * .00062 + cx / board.width * 2.8 + cy / board.height * 1.7;
  const scaleX = reducedMotion ? 1 : 1 + Math.sin(phase) * .045 + wake * .035;
  const scaleY = reducedMotion ? 1 : 1 + Math.cos(phase * .83) * .035 + wake * .025;
  for (let index = 0; index < values.length; index += 2) {
    const angle = Math.atan2(values[index + 1] - .5, values[index] - .5);
    const wave = reducedMotion ? 0 :
      Math.sin(now * .00048 + angle * 2.2) * .065 +
      Math.sin(now * .00029 - angle * 4.3) * .037 +
      wake * Math.sin(angle * 3.7 - now * .003) * .095 +
      pointerInfluence * Math.cos(angle - Math.atan2((pointer?.y ?? cy) - cy,
        (pointer?.x ?? cx) - cx)) * .09;
    const u = values[index], v = values[index + 1];
    const warp = chamberWarp(u, v, now, wake, pointerInfluence, reducedMotion);
    const x = cx + dx + ((u - .5) * (1 + wave) + warp.x) * bounds.width * scaleX;
    const y = cy + dy + ((v - .5) * (1 + wave) + warp.y) * bounds.height * scaleY;
    if (index === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  path.closePath();
  return { path, dx, dy, scaleX, scaleY };
}

function paintFoamTopology(context: CanvasRenderingContext2D, dispersal: number) {
  context.save();
  context.globalAlpha = 1 - dispersal * .7;
  context.filter = 'blur(.9px)';
  context.drawImage(topology,0,0,720,450);
  context.restore();
}

function drawFoamTopology(context: CanvasRenderingContext2D,
  apertures: { button: HTMLElement; aperture: { path: Path2D; dx: number; dy: number;
    scaleX: number; scaleY: number } }[],
  scene: number, next: number, travel: number, dispersal: number,
  left: number, top: number, boardWidth: number, boardHeight: number,
  canvasBounds: DOMRect, now: number, reducedMotion: boolean) {
  if (!topologyContext) return;
  const progress = scene + travel;
  const needsUpdate = now === 0 || now - topologyTime > 64 ||
    Math.abs(progress - topologyProgress) > .025 ||
    apertures.length !== topologyApertureCount;
  if (!needsUpdate) { paintFoamTopology(context, dispersal); return; }
  topologyTime = now;
  topologyProgress = progress;
  topologyApertureCount = apertures.length;
  const sites = Array.from({ length: Math.max(chambers[scene].length,
    chambers[next].length) }, (_, index) => {
    const source = chambers[scene][index] ?? chambers[scene][0];
    const target = chambers[next][index] ?? chambers[next][0];
    return { x: lerp(source.x, target.x, travel) +
      Math.cos(index * 2.41) * dispersal * 145,
      y: lerp(source.y, target.y, travel) +
      Math.sin(index * 2.41) * dispersal * 110,
      size: lerp(source.rx * source.ry, target.rx * target.ry, travel) };
  });
  for (let index = 16; index < 35; index++) {
    const particle = particles[index];
    const a = particle.targets[scene], b = particle.targets[next];
    sites.push({ x: lerp(a.x,b.x,travel) + particle.scatterX * dispersal * .55,
      y: lerp(a.y,b.y,travel) + particle.scatterY * dispersal * .55,
      size: lerp(a.rx * a.ry,b.rx * b.ry,travel) * 1.4 });
  }
  const bounds = apertures.map(({ button }) => button.getBoundingClientRect());
  // Smaller cells gather around the App chamber. They use the same nearest-cell
  // field as the large pockets, so their walls terminate at shared junctions.
  for (const [chamberIndex, { aperture }] of apertures.entries()) {
    const box = bounds[chamberIndex];
    const cx = (box.left - canvasBounds.left + box.width / 2 + aperture.dx - left)
      / boardWidth * 1440;
    const cy = (box.top - canvasBounds.top + box.height / 2 + aperture.dy - top)
      / boardHeight * 900;
    const rx = box.width * aperture.scaleX / boardWidth * 720;
    const ry = box.height * aperture.scaleY / boardHeight * 450;
    const count = chamberIndex === 0 ? 9 : 4;
    for (let index = 0; index < count; index++) {
      const angle = (index + .38 * chamberIndex) / count * Math.PI * 2;
      const offset = 25 + (index % 3) * 9;
      sites.push({ x: cx + Math.cos(angle) * (rx + offset),
        y: cy + Math.sin(angle) * (ry + offset),
        size: 11200 + (index % 4) * 2100 });
    }
  }
  const w = topology.width, h = topology.height;
  const rowBends = sites.map((site, index) => Array.from({ length: h }, (_, row) =>
    Math.sin((row + .5) / h * 900 * .017 + index * 1.9) * site.size * .14));
  const columnBends = sites.map((site, index) => Array.from({ length: w }, (_, column) =>
    Math.cos((column + .5) / w * 1440 * .014 - index * 1.3) * site.size * .1));
  for (let row = 0; row < h; row++) {
    for (let column = 0; column < w; column++) {
      const x = (column + .5) / w * 1440;
      const y = (row + .5) / h * 900;
      const waveX = reducedMotion ? 0 :
        Math.sin(y * .009 + now * .00031) * 37 +
        Math.sin(x * .006 + y * .004) * 14;
      const waveY = reducedMotion ? 0 :
        Math.cos(x * .007 - now * .00023) * 30 +
        Math.sin(y * .006 - x * .003) * 11;
      let nearest = 0, best = Infinity;
      for (let index = 0; index < sites.length; index++) {
        const site = sites[index];
        const dx = x + waveX - site.x, dy = y + waveY - site.y;
        const distance = dx * dx + dy * dy - site.size * .57 +
          rowBends[index][row] + columnBends[index][column];
        if (distance < best) { best = distance; nearest = index; }
      }
      const stageX = left + x * boardWidth / 1440;
      const stageY = top + y * boardHeight / 900;
      for (let index = 0; index < apertures.length; index++) {
        const box = bounds[index];
        if (stageX < box.left - canvasBounds.left - 8 ||
          stageX > box.right - canvasBounds.left + 8 ||
          stageY < box.top - canvasBounds.top - 8 ||
          stageY > box.bottom - canvasBounds.top + 8) continue;
        if (topologyContext.isPointInPath(apertures[index].aperture.path,
          stageX, stageY)) { nearest = sites.length + index; break; }
      }
      const at = row * w + column;
      topologyLabels[at] = nearest;
      // Keep the centres translucent and let colour gather near shared film.
      const site = sites[nearest];
      topologyDepth[at] = site ? Math.round(Math.max(0, 1 - Math.hypot(
        x + waveX - site.x, y + waveY - site.y) /
        Math.max(1, Math.sqrt(site.size) * 2.5)) * 255) : 0;
    }
  }
  const pixels = topologyContext.createImageData(w,h);
  const data = pixels.data;
  const washColors = palettes[travel >= .5 ? next : scene].map(hex => [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ]);
  for (let index = 0; index < topologyLabels.length; index++) {
    const label = topologyLabels[index];
    if (label >= sites.length) continue; // Keep App content clear inside its chamber.
    const colour = washColors[label % washColors.length];
    const offset = index * 4;
    data[offset] = colour[0];
    data[offset + 1] = colour[1];
    data[offset + 2] = colour[2];
    data[offset + 3] = 22 + Math.round((255 - topologyDepth[index]) * .15);
  }
  // Each shared boundary receives one thin light ridge, matching the airy
  // connected-film reference without a dark stroke around every chamber.
  for (let row = 1; row < h - 1; row++) {
    for (let column = 1; column < w - 1; column++) {
      const at = row * w + column;
      if (topologyLabels[at] === topologyLabels[at + 1] &&
        topologyLabels[at] === topologyLabels[at + w]) continue;
      const offset = at * 4;
      data[offset] = 255; data[offset + 1] = 252; data[offset + 2] = 239;
      data[offset + 3] = 188;
    }
  }
  topologyContext.putImageData(pixels,0,0);
  // Pearls sit only on shared boundaries. They break up the vector-smooth
  // ridges into a foamy film without adding separate circular ornaments.
  topologyContext.fillStyle = '#fffdf2';
  for (let row = 2; row < h - 2; row++) {
    for (let column = 2; column < w - 2; column++) {
      const at = row * w + column;
      if (topologyLabels[at] === topologyLabels[at + 1] &&
        topologyLabels[at] === topologyLabels[at + w]) continue;
      const seed = ((column * 73856093) ^ (row * 19349663)) >>> 0;
      if (seed % 5 > 1) continue;
      topologyContext.globalAlpha = .48 + (seed % 7) * .065;
      topologyContext.beginPath();
      topologyContext.arc(column + .5, row + .5, .48 + (seed % 4) * .23,
        0, Math.PI * 2);
      topologyContext.fill();
    }
  }
  topologyContext.globalAlpha = 1;
  paintFoamTopology(context, dispersal);
}

function draw(canvas: HTMLCanvasElement, progress: number, expanded: number,
  pointer: { x: number; y: number } | null, now: number, reducedMotion: boolean) {
  const context = canvas.getContext('2d');
  if (!context) return;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  if (!width || !height) return;
  const scale = canvas.width / width;
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.clearRect(0, 0, width, height);
  const scene = Math.min(3, Math.floor(progress));
  const fraction = progress - scene;
  const next = Math.min(3, scene + 1);
  const travel = smooth(fraction);
  const dispersal = reducedMotion ? 0 : Math.sin(Math.PI * fraction);
  // The App content recedes before its chamber scatters, then the next App
  // content emerges only after the bubble field begins to reassemble.
  const chamberPresence = reducedMotion ? 1 : smooth(Math.max(0, 1 - dispersal * 1.1));
  const compact = width <= 760 || (width <= 900 && height > width);
  const boardWidth = compact ? Math.min(width*1.8432,height*.9216) : Math.min(width, height * 1.6);
  const boardHeight = boardWidth / 1.6;
  const mobileShift=lerp([-.6715,-.6146,-.70,-.6118][scene],
    [-.6715,-.6146,-.70,-.6118][next],travel);
  const mobileTopStops = width <= 760 && height <= 650
    ? [.25,.25,.25,.24] : [.25,.25,.25,.31];
  const mobileTop=lerp(mobileTopStops[scene],mobileTopStops[next],travel);
  const mobileAnchor=lerp([-.1533,-.1444,-.14,-.2433][scene],
    [-.1533,-.1444,-.14,-.2433][next],travel);
  const left = compact ? width*.5+boardWidth*lerp(mobileShift,-.5,dispersal*.82)
    : (width - boardWidth) / 2;
  const top = compact ? height*mobileTop+boardHeight*mobileAnchor : (height - boardHeight) / 2;
  const touchField=updateTouchField(pointer,left,top,boardWidth,boardHeight,reducedMotion);
  const project = (p: Point) =>
    ({ x: left + p.x * boardWidth / 1440, y: top + p.y * boardHeight / 900,
      rx: p.rx * boardWidth / 1440, ry: p.ry * boardHeight / 900 });
  const tone = fraction > .5 ? next : scene;
  const visibleScene = Math.min(3, Math.round(progress));
  const sceneElement = canvas.parentElement?.querySelectorAll<HTMLElement>('.tide-scene')[visibleScene];
  const apertures = Array.from(sceneElement?.querySelectorAll<HTMLElement>('.tide-screen') ?? [])
    .map(button => {
      const bounds=button.getBoundingClientRect();
      const x=bounds.left-rect.left+bounds.width/2;
      const y=bounds.top-rect.top+bounds.height/2;
      const wake=touchAt(touchField,(x-left)/boardWidth*1440,(y-top)/boardHeight*900);
      return { button, image: button.querySelector('img'), wake,
        aperture: aperturePath(button, rect, now, pointer, reducedMotion, wake,
          { left, top, width: boardWidth, height: boardHeight }) };
    })
    .filter((item): item is { button: HTMLElement; image: HTMLImageElement;
      wake: number; aperture: { path: Path2D; dx: number; dy: number;
        scaleX: number; scaleY: number } } =>
      Boolean(item.image?.complete && item.image.naturalWidth && item.aperture));

  const maskContext = mask.getContext('2d');
  const pigmentContext = pigment.getContext('2d');
  const filmContext = film.getContext('2d');
  if (maskContext && pigmentContext && filmContext) {
    maskContext.clearRect(0,0,360,225);
    maskContext.save();
    maskContext.scale(.25,.25);
    maskContext.fillStyle = '#fff';
    const count = Math.max(forms[scene].length, forms[next].length);
    for (let index=0; index<count; index++) {
      const source = forms[scene][index] ?? forms[scene][0];
      const target = forms[next][index] ?? forms[next][0];
      const phase = index * 2.39996;
      const orbit = reducedMotion ? 0 : Math.sin(now*.00037+phase)*8;
      const driftX = Math.cos(phase)*400*dispersal;
      const driftY = Math.sin(phase)*300*dispersal;
      const px = pointer ? (pointer.x-left)/boardWidth*1440 : -1000;
      const py = pointer ? (pointer.y-top)/boardHeight*900 : -1000;
      let x=lerp(source.x,target.x,travel)+driftX+orbit;
      let y=lerp(source.y,target.y,travel)+driftY+orbit*.7;
      const wake=touchAt(touchField,x,y);
      const flow=flowAt(x,y,now,wake,reducedMotion);
      x+=flow.x+Math.cos(phase)*wake*24;
      y+=flow.y+Math.sin(phase)*wake*22;
      const distance=Math.hypot(x-px,y-py);
      if (!reducedMotion && distance<230 && distance>1) {
        x+=(x-px)/distance*(1-distance/230)*27;
        y+=(y-py)/distance*(1-distance/230)*27;
      }
      x=lerp(x,720+Math.cos(phase)*650,expanded*.97);
      y=lerp(y,450+Math.sin(phase)*440,expanded*.97);
      const shrink=1-dispersal*.78-expanded*1.55;
      const rx=Math.max(2,lerp(source.rx,target.rx,travel)*shrink);
      const ry=Math.max(2,lerp(source.ry,target.ry,travel)*shrink);
      if (dispersal > .03 || expanded > .03) {
        fillFoamFragment(maskContext,x,y,rx,ry,phase,now,
          Math.min(.42,dispersal*.42+expanded*.25));
      } else {
        maskContext.beginPath();
        maskContext.ellipse(x,y,rx,ry,0,0,Math.PI*2);
        maskContext.fill();
      }
    }
    // Small pigment fragments appear only while the foam disperses. At rest the
    // chamber is one connected field, rather than a cloud of detached circles.
    for (let index=0; index<particles.length && (dispersal>.025 || expanded>.025); index++) {
      const bubble=particles[index];
      const a=bubble.targets[scene],b=bubble.targets[next];
      const breathing=reducedMotion?0:Math.sin(now*.0003+bubble.phase)*2.1;
      let x=lerp(a.x,b.x,travel)+bubble.scatterX*dispersal*.7+breathing;
      let y=lerp(a.y,b.y,travel)+bubble.scatterY*dispersal*.7+breathing*.55;
      const phase=bubble.phase;
      const wake=touchAt(touchField,x,y);
      x+=Math.cos(phase)*wake*36;
      y+=Math.sin(phase)*wake*28;
      const openX=lerp(x,720+Math.cos(phase)*650,expanded*.97);
      const openY=lerp(y,450+Math.sin(phase)*440,expanded*.97);
      const size=.92-dispersal*.58-expanded*.65;
      fillFoamFragment(maskContext,openX,openY,
        Math.max(2,lerp(a.rx,b.rx,travel)*size),
        Math.max(2,lerp(a.ry,b.ry,travel)*size*.67),phase,now,.36);
    }
    maskContext.restore();
    // Each screenshot chamber participates in the same union mask as the
    // surrounding foam. The membrane and the App content share this contour.
    if (expanded < .7) {
      maskContext.save();
      maskContext.setTransform(360 / boardWidth, 0, 0, 225 / boardHeight,
        -left * 360 / boardWidth, -top * 225 / boardHeight);
      maskContext.globalAlpha = chamberPresence;
      for (const { aperture } of apertures) maskContext.fill(aperture.path);
      maskContext.restore();
    }
    pigmentContext.setTransform(1,0,0,1,0,0);
    pigmentContext.clearRect(0,0,720,450);
    const sourceTexture=textures[scene];
    const targetTexture=textures[next];
    if (sourceTexture.complete && sourceTexture.naturalWidth) {
      pigmentContext.globalAlpha = .45;
      drawFlowingTexture(pigmentContext,sourceTexture,now,scene,reducedMotion);
      if (scene!==next && targetTexture.complete && targetTexture.naturalWidth) {
        pigmentContext.globalAlpha=.45 * travel;
        drawFlowingTexture(pigmentContext,targetTexture,now,next,reducedMotion);
      }
      pigmentContext.globalAlpha=1;
      // The App image lives in the pigment sheet itself. The shared union mask
      // below cuts both the coloured foam and the image with one moving edge.
      const imagePresence = chamberPresence;
      for (const { button, image, aperture } of apertures) {
        const { path, dx, dy, scaleX, scaleY } = aperture;
        const bounds = button.getBoundingClientRect();
        const renderWidth = bounds.width * scaleX;
        const renderHeight = bounds.height * scaleY;
        const x = bounds.left - rect.left + dx + (bounds.width - renderWidth) / 2;
        const y = bounds.top - rect.top + dy + (bounds.height - renderHeight) / 2;
        pigmentContext.save();
        pigmentContext.setTransform(720 / boardWidth, 0, 0, 450 / boardHeight,
          -left * 720 / boardWidth, -top * 450 / boardHeight);
        pigmentContext.clip(path);
        const sourceRatio = image.naturalWidth / image.naturalHeight;
        const cellRatio = bounds.width / bounds.height;
        const sw = sourceRatio > cellRatio ? image.naturalHeight * cellRatio : image.naturalWidth;
        const sh = sourceRatio > cellRatio ? image.naturalHeight : image.naturalWidth / cellRatio;
        const sourceX = (image.naturalWidth - sw) / 2;
        const sourceY = (image.naturalHeight - sh) / 2;
        // The whole App view travels and breathes with its chamber. The shared
        // path removes the rectangular image edge, while the seam is drawn on
        // top by the foam topology below.
        pigmentContext.filter = 'contrast(1.7) saturate(1.12)';
        pigmentContext.globalAlpha = imagePresence;
        pigmentContext.drawImage(image, sourceX, sourceY, sw, sh,
          x, y, renderWidth, renderHeight);
        pigmentContext.filter = 'none';
        // Let the foam colour cross the screenshot's perimeter. A plain clipped
        // photo with a complete outline reads as a separate object.
        const edgeWash = pigmentContext.createRadialGradient(
          x + renderWidth * .5, y + renderHeight * .5, Math.min(renderWidth, renderHeight) * .17,
          x + renderWidth * .5, y + renderHeight * .5, Math.max(renderWidth, renderHeight) * .7);
        edgeWash.addColorStop(0, 'rgba(238,244,240,0)');
        edgeWash.addColorStop(.67, 'rgba(227,237,232,0)');
        edgeWash.addColorStop(.86, 'rgba(252,255,249,.12)');
        edgeWash.addColorStop(1, moteInk[visibleScene][0] + '3a');
        pigmentContext.globalAlpha = imagePresence;
        pigmentContext.fillStyle = edgeWash;
        pigmentContext.fillRect(x - 2, y - 2, renderWidth + 4, renderHeight + 4);
        pigmentContext.globalAlpha = imagePresence * .055;
        pigmentContext.drawImage(sourceTexture, left, top, boardWidth, boardHeight);
        pigmentContext.restore();
      }
      pigmentContext.setTransform(1,0,0,1,0,0);
      pigmentContext.globalCompositeOperation='destination-in';
      pigmentContext.drawImage(mask,0,0,720,450);
      pigmentContext.globalCompositeOperation='source-over';
      context.globalAlpha=Math.pow(1-expanded,1.5) * (1-dispersal*.32);
      context.drawImage(pigment,left,top,boardWidth,boardHeight);
      context.globalAlpha=1;

      // Partial shared seams suggest adjacent chambers in the same foam.
      // The mask keeps every seam inside the connected pigment body.
      filmContext.setTransform(1,0,0,1,0,0);
      filmContext.clearRect(0,0,720,450);
      filmContext.save();
      filmContext.scale(.5,.5);
      // Mobile pigment pockets live inside the shared membrane. Their soft
      // colour merges with the texture instead of reading as outlined dots.
      for (let index=12;index<particles.length;index++) {
        const bubble=particles[index];
        const a=bubble.targets[scene],b=bubble.targets[next];
        const breathing=reducedMotion ? 0 : Math.sin(now*.00052+bubble.phase)*7;
        let x=lerp(a.x,b.x,travel)+bubble.scatterX*dispersal*.45+breathing;
        let y=lerp(a.y,b.y,travel)+bubble.scatterY*dispersal*.45+breathing*.6;
        if (pointer && !reducedMotion) {
          const px=(pointer.x-left)/boardWidth*1440;
          const py=(pointer.y-top)/boardHeight*900;
          const distance=Math.hypot(x-px,y-py);
          if (distance<130 && distance>1) {
            x+=(x-px)/distance*(1-distance/130)*16;
            y+=(y-py)/distance*(1-distance/130)*16;
          }
        }
        const radius=Math.max(5,lerp(a.rx,b.rx,travel)*(1+breathing*.006));
        const wake=touchAt(touchField,x,y);
        x+=Math.cos(bubble.phase)*wake*19;
        y+=Math.sin(bubble.phase)*wake*15;
        const colour=palettes[tone][bubble.color];
        const glow=filmContext.createRadialGradient(x,y,0,x,y,radius);
        glow.addColorStop(0,colour+'2d');
        glow.addColorStop(.54,colour+'17');
        glow.addColorStop(1,colour+'00');
        filmContext.fillStyle=glow;
        filmContext.beginPath();
        filmContext.ellipse(x,y,radius,radius*(.72+(index%4)*.08),bubble.phase*.16,0,Math.PI*2);
        filmContext.fill();
      }
      filmContext.restore();
      if (expanded < .72 && dispersal < .96) {
        drawFoamTopology(filmContext, apertures, scene, next, travel, dispersal,
          left, top, boardWidth, boardHeight, rect, now, reducedMotion);
      }
      filmContext.globalCompositeOperation='destination-in';
      filmContext.drawImage(mask,0,0,720,450);
      filmContext.globalCompositeOperation='source-over';

      context.globalAlpha=Math.pow(1-expanded,1.5) * .85;
      context.drawImage(film,left,top,boardWidth,boardHeight);
      context.globalAlpha=1;
    }
  }

  // The shared film disperses into colour fragments and short membrane glints.
  // Their targets belong to each scene, so the same pieces reform the next one.
  const activity = Math.max(dispersal, expanded * .58);
  if (activity > .015) {
    for (let index = 0; index < particles.length; index++) {
      const bubble = particles[index];
      const a = project(bubble.targets[scene]);
      const b = project(bubble.targets[next]);
      const angle = bubble.phase + index * 2.39996;
      const edgeX = width * .5 + Math.cos(angle) * width * (compact ? .43 : .39);
      const edgeY = height * .5 + Math.sin(angle) * height * (compact ? .37 : .34);
      let x = lerp(a.x, b.x, travel) + bubble.scatterX * boardWidth / 1440 * dispersal;
      let y = lerp(a.y, b.y, travel) + bubble.scatterY * boardHeight / 900 * dispersal;
      const wake = touchAt(touchField,(x-left)/boardWidth*1440,(y-top)/boardHeight*900);
      x += Math.cos(angle)*wake*boardWidth/1440*32;
      y += Math.sin(angle)*wake*boardHeight/900*24;
      x = lerp(x, edgeX, expanded * .9);
      y = lerp(y, edgeY, expanded * .9);
      const radius = Math.max(4, lerp(a.rx, b.rx, travel) *
        (.95 - dispersal * .48 - expanded * .75));
      const gradient = context.createLinearGradient(x-radius,y-radius,x+radius,y+radius);
      const mainVesicle = index < 14;
      gradient.addColorStop(0, palettes[tone][bubble.color] + (mainVesicle ? 'ba' : '85'));
      gradient.addColorStop(.46, mainVesicle
        ? moteInk[tone][bubble.color] + '84'
        : palettes[tone][bubble.color] + 'd6');
      gradient.addColorStop(1, palettes[tone][bubble.color] + '60');
      context.fillStyle = gradient;
      context.globalAlpha = Math.min(.86, activity * (mainVesicle ? .84 : .53));
      fillFoamFragment(context,x,y,radius,radius*(.42+(index%5)*.1),
        bubble.phase,now,.36,true);
    }
    // Fine pieces are bent film highlights, never a field of circular sprites.
    for (const mote of dispersal > .015 ? motes : []) {
      const a=project(mote.targets[scene]);
      const b=project(mote.targets[next]);
      const x=lerp(a.x,b.x,travel)+mote.scatterX*boardWidth/1440*dispersal;
      const y=lerp(a.y,b.y,travel)+mote.scatterY*boardHeight/900*dispersal;
      const wake=touchAt(touchField,(x-left)/boardWidth*1440,(y-top)/boardHeight*900);
      const drift=reducedMotion?0:Math.sin(now*.0012+mote.phase)*3;
      const edgeX=width*.5+Math.cos(mote.phase)*width*.45;
      const edgeY=height*.5+Math.sin(mote.phase)*height*.39;
      const px=lerp(x+drift+wake*18,edgeX,expanded*.9);
      const py=lerp(y+drift*.6+wake*12,edgeY,expanded*.9);
      const length=(2.4+mote.targets[scene].rx*boardWidth/1440*2.8)*
        (mote.phase < 1.15 ? 1.5 : 1);
      const direction=mote.phase+Math.sin(now*.00026+mote.phase)*.23;
      const vx=Math.cos(direction), vy=Math.sin(direction);
      const nx=-vy, ny=vx;
      context.globalAlpha=Math.min(.8,dispersal*(1-expanded)*(.52+wake*.14));
      context.strokeStyle=moteInk[tone][mote.color];
      context.lineWidth=Math.max(.85,length*.22);
      context.lineCap='round';
      context.beginPath();
      context.moveTo(px-vx*length*.5,py-vy*length*.5);
      context.quadraticCurveTo(px+nx*length*.36,py+ny*length*.36,
        px+vx*length*.5,py+vy*length*.5);
      context.stroke();
    }
  }
  context.globalAlpha = 1;
}

export function FoamFieldCanvas({ progress, expanded, pointer, reducedMotion }: {
  progress: number; expanded: boolean; pointer: RefObject<{ x: number; y: number } | null>; reducedMotion: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const values = useRef({ progress, expanded, reducedMotion });
  const expansion = useRef(expanded ? 1 : 0);
  values.current = { progress, expanded, reducedMotion };

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let frame = 0;
    let last = 0;
    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 1.6);
      element.width = Math.round(width * scale);
      element.height = Math.round(height * scale);
      draw(element, values.current.progress, expansion.current, pointer.current, 0, values.current.reducedMotion);
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    observer?.observe(element);
    if (!observer) window.addEventListener('resize', resize);
    const redrawAfterTexture = () => {
      if (values.current.reducedMotion) {
        draw(element, values.current.progress, expansion.current, null, 0, true);
      }
    };
    textures.forEach(texture => texture.addEventListener('load', redrawAfterTexture));
    resize();
    const tick = (now: number) => {
      if (now - last >= 32 && !document.hidden) {
        last = now;
        const state = values.current;
        expansion.current += ((state.expanded ? 1 : 0) - expansion.current) * .12;
        draw(element, state.progress, expansion.current, pointer.current, now, state.reducedMotion);
      }
      frame = requestAnimationFrame(tick);
    };
    if (!reducedMotion) frame = requestAnimationFrame(tick);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      textures.forEach(texture => texture.removeEventListener('load', redrawAfterTexture));
      cancelAnimationFrame(frame);
    };
  }, [pointer, reducedMotion]);

  useEffect(() => {
    if (!reducedMotion || !canvas.current) return;
    expansion.current = expanded ? 1 : 0;
    draw(canvas.current, progress, expansion.current, null, 0, true);
  }, [progress, expanded, reducedMotion]);

  return <canvas className="tide-foam-canvas" ref={canvas} aria-hidden="true" />;
}
