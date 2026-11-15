// Render the prototype's actual pixel shader without opening another browser.
const fs = require('node:fs');
const vm = require('node:vm');
const zlib = require('node:zlib');
const path = require('node:path');

const variant = (process.argv[2] || 'A').toUpperCase();
const source = fs.readFileSync(path.join(__dirname, 'interactive-foam-prototype.html'), 'utf8');
const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!script || !'ABC'.includes(variant)) throw new Error('Missing script or invalid variant');
const mobile = process.argv[3] === 'mobile';
const width = mobile ? 390 : 1280, height = mobile ? 844 : 720;
const context2d = () => ({
  createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  setTransform() {}, clearRect() {}, putImageData() {}, drawImage() {}
});
const element = () => ({ getContext: context2d, addEventListener() {},
  classList: { add() {}, remove() {} }, textContent: '', src: '' });
const nodes = new Map();
const document = {
  querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, element()); return nodes.get(selector) },
  createElement: element
};
const sandbox = {
  document, window: { addEventListener() {} }, innerWidth: width, innerHeight: height,
  devicePixelRatio: 1, requestAnimationFrame() {}, setTimeout() {},
  performance: { now: () => 0 },
  Image: class { complete = false; naturalWidth = 0; naturalHeight = 0 },
  URL, URLSearchParams, Math, Uint8ClampedArray,
  history: { replaceState() {} },
  location: { search: `?variant=${variant}`, pathname: '/dreamtide-website/design-review/interactive-foam-prototype.html', href: 'http://localhost/dreamtide-website/design-review/interactive-foam-prototype.html' }
};
vm.createContext(sandbox);
const started = performance.now();
vm.runInContext(script + '\nfor(let frame=0;frame<20;frame++)draw(100+frame*100); globalThis.result={width:fieldWidth,height:fieldHeight,data:fieldPixels.data};', sandbox);
const renderMs = Math.round((performance.now() - started)/20);
const { width: w, height: h, data } = sandbox.result;
const raw = Buffer.alloc((w * 4 + 1) * h);
for (let y = 0; y < h; y++) {
  const start = y * (w * 4 + 1); raw[start] = 0;
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, j = start + 1 + x * 4;
    const a = data[i + 3] / 255;
    raw[j] = Math.round(data[i] * a + 232 * (1 - a));
    raw[j + 1] = Math.round(data[i + 1] * a + 235 * (1 - a));
    raw[j + 2] = Math.round(data[i + 2] * a + 232 * (1 - a));
    raw[j + 3] = 255;
  }
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function chunk(type, bytes) {
  const kind = Buffer.from(type), length = Buffer.alloc(4);
  length.writeUInt32BE(bytes.length);
  let crc = 0xffffffff;
  for (const b of Buffer.concat([kind, bytes])) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8);
  const tail = Buffer.alloc(4); tail.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, kind, bytes, tail]);
}
function pngFor(bytes, imageWidth, imageHeight) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(imageWidth, 0); ihdr.writeUInt32BE(imageHeight, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(bytes)), chunk('IEND', Buffer.alloc(0))]);
}
const output = path.join(__dirname, `interactive-foam-field-${variant}${mobile ? '-mobile' : ''}.png`);
fs.writeFileSync(output, pngFor(raw, w, h));
const fullRaw = Buffer.alloc((width * 4 + 1) * height);
for (let y = 0; y < height; y++) {
  const sourceY = Math.min(h - 1, (y + .5) * h / height - .5);
  const y0 = Math.max(0, Math.floor(sourceY)), y1 = Math.min(h - 1, y0 + 1), fy = Math.max(0, Math.min(1, sourceY - y0));
  const line = y * (width * 4 + 1); fullRaw[line] = 0;
  for (let x = 0; x < width; x++) {
    const sourceX = Math.min(w - 1, (x + .5) * w / width - .5);
    const x0 = Math.max(0, Math.floor(sourceX)), x1 = Math.min(w - 1, x0 + 1), fx = Math.max(0, Math.min(1, sourceX - x0));
    for (let channel = 0; channel < 4; channel++) {
      const a = raw[y0 * (w * 4 + 1) + 1 + x0 * 4 + channel];
      const b = raw[y0 * (w * 4 + 1) + 1 + x1 * 4 + channel];
      const c = raw[y1 * (w * 4 + 1) + 1 + x0 * 4 + channel];
      const d = raw[y1 * (w * 4 + 1) + 1 + x1 * 4 + channel];
      fullRaw[line + 1 + x * 4 + channel] = Math.round((a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy);
    }
  }
}
const fullOutput = path.join(__dirname, `interactive-foam-field-${variant}${mobile ? '-mobile' : ''}-full.png`);
fs.writeFileSync(fullOutput, pngFor(fullRaw, width, height));
process.stdout.write(`${output} ${w}x${h}; ${fullOutput} ${width}x${height}; ${renderMs}ms render\n`);
