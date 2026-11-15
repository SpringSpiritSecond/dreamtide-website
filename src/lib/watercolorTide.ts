// Live watercolour for the home page: a wash with bubble prints, rendered on the GPU.
// Chapters change by easing colours, cross-fading the stain and letting prints soak away and bloom;
// nothing on the paper is ever moved or dragged.

export type Rgb = readonly [number, number, number];
export type Rect = [number, number, number, number];
export type WashChapter = {
  shot?: { w: number; h: number };
  feature?: 'word' | 'cta';
  pal: readonly Rgb[];
  deep: Rgb;
};
export type WashLayout = { copy: Rect; shot?: Rect; feature?: [number, number, number] };

type Print = {
  x: number; y: number; r: number; sx: number; rot: number; wob: number; ghost: boolean;
  feature?: boolean; cursor?: boolean; born: number; dying?: number; life?: number;
  vx?: number; vy?: number; a?: number; draw?: number;
};

const N = 44;
const CURSOR = 6;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (k: number) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** Where copy, screenshot and feature print sit for a chapter at a given viewport size. */
export function layoutFor(chapter: WashChapter, W: number, H: number): WashLayout {
  const mobile = W < 760;
  const copy: Rect = mobile ? [0, 40, W, 290] : [0, H / 2 - 190, clamp(W * .06, 16, 112) + Math.min(W * .32, 440) + 30, H / 2 + 190];
  const layout: WashLayout = { copy };
  if (chapter.shot) {
    let h = mobile ? H * .5 : Math.min(H * .8, 760);
    let w = h * chapter.shot.w / chapter.shot.h;
    const maxW = mobile ? W - 48 : W * .44;
    if (w > maxW) { w = maxW; h = w * chapter.shot.h / chapter.shot.w; }
    const cx = mobile ? W / 2 : W * .68, cy = mobile ? H - h / 2 - 58 : H / 2;
    layout.shot = [cx - w / 2, cy - h / 2, w, h];
  }
  if (chapter.feature) {
    const r = chapter.feature === 'word'
      ? (mobile ? Math.min(W * .36, H * .2) : Math.min(H * .3, W * .2))
      : (mobile ? Math.min(W * .34, H * .19) : Math.min(H * .22, W * .15));
    layout.feature = [mobile ? W / 2 : W * .66, mobile ? H * .66 : H * .52, r];
  }
  return layout;
}

const VS = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }';
const FS = `precision highp float;
uniform vec2 R; uniform float D, S, t, k;
uniform vec2 seedA, seedB;
uniform vec3 P[5]; uniform vec3 DP;
uniform vec4 copyBox, shot; uniform float shotOn;
uniform vec4 PR[${N}]; uniform vec4 PX[${N}];
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1., 0.)), f.x), mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ return n(p) * .5 + n(p * 2.1) * .27 + n(p * 4.3) * .15 + n(p * 8.7) * .08; }
float sdBox(vec2 p, vec4 b, float r){
  vec2 c = b.xy + b.zw * .5, q = abs(p - c) - b.zw * .5 + r;
  return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r;
}
void main(){
  vec2 p = vec2(gl_FragCoord.x, R.y - gl_FragCoord.y) / D;
  vec2 u = p / S;
  vec3 paper = vec3(.968, .957, .933);
  vec3 col = paper + (h(gl_FragCoord.xy) - .5) * .024 + (n(u * .5) - .5) * .016;

  // Two stain shapes cross-fade between chapters, so the wash re-forms instead of sliding.
  float wet = mix(fbm(u * .0036 + seedA), fbm(u * .0036 + seedB), k);
  float amount = smoothstep(.36, .66, wet);
  float m = min(min(p.x - copyBox.x, copyBox.z - p.x), min(p.y - copyBox.y, copyBox.w - p.y)) / S;
  amount *= 1. - smoothstep(-60., 40., m) * .8;
  float sd = sdBox(p, shot, 20. * S) / S + (fbm(u * .012 + 4.) - .5) * 70.;
  amount *= mix(1., .25 + .75 * smoothstep(0., 90., sd), shotOn);
  float tide = exp(-abs(wet - .5) / .018) * .16 * smoothstep(.2, .6, amount + .3);

  vec3 pig = vec3(0.); float ws = 0.;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float w = pow(fbm(u * .0042 + vec2(11. + fi * 17.3, fi * 7.1)), 4.) * (i == 0 ? 1.5 : 1.);
    pig += P[i] * w; ws += w;
  }
  pig /= ws;
  float pool = smoothstep(.68, .8, fbm(u * .006 + vec2(61., 3.))) * smoothstep(.3, .7, amount);
  pig = mix(pig, DP, pool * .75);

  float a = amount * .56 + tide + pool * .18;
  a *= .8 + n(u * .18) * .28 + (h(gl_FragCoord.xy * 1.37) - .5) * .08;

  for (int i = 0; i < ${N}; i++) {
    vec4 b = PR[i];
    if (b.w <= 0.) continue;
    vec4 x = PX[i];
    vec2 d = (p - b.xy) / S; float r = b.z / S;
    if (abs(d.x) > r * 1.6 + 20. || abs(d.y) > r * 1.6 + 20.) continue;
    float cr = cos(x.y), sn = sin(x.y);
    vec2 e = vec2((d.x * cr + d.y * sn) / x.x, (-d.x * sn + d.y * cr) * x.x);
    float ang = atan(e.y, e.x);
    float edge = r * (1. + (n(vec2(cos(ang), sin(ang)) * 1.8 + x.z) - .5) * .22) + (n(u * .25) - .5) * min(3., r * .12);
    float dd = length(e) - edge;
    if (x.w > .5) {
      a *= 1. - (1. - smoothstep(-r * .35, 4., dd)) * .55 * b.w;
      a += exp(-abs(dd) / 5.) * .05 * amount * b.w;
    } else if (dd < 0.) {
      a *= 1. - smoothstep(0., -3.5, dd) * .93 * b.w;
    } else {
      a += exp(-dd / (1.6 + r * .03)) * (.32 + amount * .25) * (.7 + n(u * .4) * .5) * b.w;
    }
  }
  a = min(.82, a);
  col = mix(col, pig, a);
  col *= 1. - max(0., a - .45) * .35;

  // Wet paint keeps moving in place: pigment clouds thicken and thin out.
  vec2 q = u * .0032;
  float k1 = .5 + .5 * sin(t * .23), k2 = .5 + .5 * sin(t * .17 + 2.);
  float c1 = mix(n(q + vec2(3.1, 7.7)) * .65 + n(q * 2.3 + 1.7) * .35, n(q + vec2(9.4, 2.2)) * .65 + n(q * 2.3 + 8.1) * .35, k1);
  float c2 = mix(n(q * 1.3 + vec2(5.5, 1.1)) * .65 + n(q * 2.9 + 4.4) * .35, n(q * 1.3 + vec2(12.3, 6.6)) * .65 + n(q * 2.9 + 11.) * .35, k2);
  float wetPaint = smoothstep(.955, .8, dot(col, vec3(.333))) * .85 + .15;
  vec3 glaze = mix(vec3(1.), mix(P[0], P[1], smoothstep(.3, .7, c2)), .55);
  col *= mix(vec3(1.), glaze, smoothstep(.48, .78, c1) * .3 * wetPaint);
  col = mix(col, paper, smoothstep(.5, .2, c1) * .1 * wetPaint);
  gl_FragColor = vec4(col, 1.);
}`;

function chapterPrints(index: number, L: WashLayout, W: number, H: number): Print[] {
  const rnd = mulberry(31 + index * 977), S = H / 800, mobile = W < 760, P: Print[] = [];
  const sdShot = (x: number, y: number) => {
    if (!L.shot) return 1e9;
    const [sx, sy, sw, sh] = L.shot;
    const qx = Math.abs(x - sx - sw / 2) - sw / 2, qy = Math.abs(y - sy - sh / 2) - sh / 2;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0);
  };
  const free = (x: number, y: number, r: number) => {
    if (x - r < 8 || x + r > W - 8 || y - r < 8 || y + r > H - 8) return false;
    if (y + r > H - 70 && Math.abs(x - W / 2) < 120 + r) return false;   // chapter dots
    if (y - r < 76 && x - r < 170) return false;                         // site name
    if (!mobile && y + r > H - 64 && x + r > W - 280) return false;      // hint
    const c = L.copy;
    if (x + r > c[0] - 10 && x - r < c[2] + 10 && y + r > c[1] - 20 && y - r < c[3] + 20) return false;
    if (sdShot(x, y) < r + 26 * S) return false;
    if (L.feature && Math.hypot(x - L.feature[0], y - L.feature[1]) < L.feature[2] + r + 20 * S) return false;
    for (const p of P) if (Math.hypot(p.x - x, p.y - y) < p.r + r + 8 * S) return false;
    return true;
  };
  const add = (x: number, y: number, r: number, ghost = false) =>
    P.push({ x, y, r, sx: .82 + rnd() * .36, rot: rnd() * Math.PI, wob: rnd() * 50, ghost, born: 0 });
  if (L.feature) P.push({ x: L.feature[0], y: L.feature[1], r: L.feature[2], sx: .96, rot: rnd(), wob: rnd() * 50, ghost: false, feature: true, born: 0 });
  const bigs = mobile ? 2 : 3;
  for (let n = 0; P.filter((p) => !p.feature).length < bigs && n < 3000; n++) {
    const r = (34 + rnd() * 34) * S, x = rnd() * W, y = rnd() * H;
    if (free(x, y, r)) add(x, y, r);
  }
  for (const b of P.slice()) {
    const side = rnd() * Math.PI * 2, want = 2 + Math.floor(rnd() * 2);
    for (let got = 0, tries = 0; got < want && tries < 200; tries++) {
      const a = side + (rnd() - .5) * 1.6, r = (5 + Math.pow(rnd(), 1.6) * 13) * S, d = b.r + r + (10 + rnd() * 46) * S;
      const x = b.x + Math.cos(a) * d, y = b.y + Math.sin(a) * d;
      if (free(x, y, r)) { add(x, y, r); got++; }
    }
  }
  for (let n = 0, mids = 0; mids < 3 && n < 3000; n++) {
    const r = (15 + rnd() * 14) * S, x = rnd() * W, y = rnd() * H;
    if (free(x, y, r)) { add(x, y, r); mids++; }
  }
  for (let n = 0, g = 0; g < 3 && n < 3000; n++) {
    const r = (50 + rnd() * 50) * S, x = rnd() * W, y = rnd() * H;
    if (L.shot && sdShot(x, y) < 10) continue;
    const c = L.copy;
    if (x > c[0] && x < c[2] && y > c[1] && y < c[3]) continue;
    add(x, y, r, true); g++;
  }
  return P.slice(0, 20);
}

export type WatercolorTide = { go: (index: number, instant?: boolean) => void; resize: () => void; dispose: () => void };

export function createWatercolorTide(canvas: HTMLCanvasElement, chapters: readonly WashChapter[], reduce: boolean): WatercolorTide {
  const gl = canvas.getContext('webgl', { antialias: false }) as WebGLRenderingContext | null;
  const U: Record<string, WebGLUniformLocation | null> = {};
  if (gl) {
    const sh = (type: number, src: string) => {
      const o = gl.createShader(type)!;
      gl.shaderSource(o, src); gl.compileShader(o);
      return o;
    };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'a');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const name of ['R', 'D', 'S', 't', 'k', 'seedA', 'seedB', 'P', 'DP', 'copyBox', 'shot', 'shotOn', 'PR', 'PX']) U[name] = gl.getUniformLocation(pr, name);
  }

  let W = 1, H = 1, DPR = 1, current = -1, raf = 0;
  let prints: Print[] = [];
  const live = {
    pal: chapters[0].pal.map((c) => [...c]), deep: [...chapters[0].deep],
    copy: [0, 0, 0, 0] as number[], shot: [0, 0, 0, 0] as number[], shotOn: 0,
  };
  let seedA: [number, number] = [0, 0], seedB: [number, number] = [0, 0], washK = 1, washFrom = 0;
  const seedFor = (i: number): [number, number] => [i * 13.7 + 2.3, i * 5.9 + 1.7];

  const resize = () => {
    W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight;
    // The painting is soft; cap its resolution so large screens stay smooth.
    DPR = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(2.4e6 / (W * H)));
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    gl?.viewport(0, 0, canvas.width, canvas.height);
    if (current >= 0) prints = chapterPrints(current, layoutFor(chapters[current], W, H), W, H);
  };

  const go = (index: number, instant = false) => {
    if (index === current) return;
    const prev = current;
    current = index;
    const now = performance.now();
    for (const p of prints) if (!p.cursor && !p.dying) p.dying = now;
    const fresh = chapterPrints(index, layoutFor(chapters[index], W, H), W, H);
    fresh.forEach((p, i) => { p.born = instant || reduce ? 0 : now + 380 + (p.feature ? 0 : 160 + i * 70); });
    prints.push(...fresh);
    seedA = washK < .5 ? seedA : seedB;
    seedB = seedFor(index);
    if (prev < 0) seedA = seedB;
    washK = instant || reduce || prev < 0 ? 1 : 0; washFrom = now;
    if (prev < 0 || instant) {
      live.copy = [...layoutFor(chapters[index], W, H).copy];
    }
  };

  // The cursor drops a bubble now and then; it lands on the wet paint and leaves a print that soaks away.
  const mouse = { x: NaN, y: NaN, travel: 0 };
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || reduce) return;
    const box = canvas.getBoundingClientRect();
    const x = event.clientX - box.left, y = event.clientY - box.top;
    if (!Number.isNaN(mouse.x)) mouse.travel += Math.hypot(x - mouse.x, y - mouse.y);
    mouse.x = x; mouse.y = y;
    if (mouse.travel < 110 + Math.random() * 80) return;
    if (prints.filter((p) => p.cursor).length >= CURSOR) return;
    mouse.travel = 0;
    const S = H / 800, r = (Math.random() < .3 ? 46 + Math.random() * 22 : 16 + Math.random() * 20) * S;
    prints.push({
      x: x + (Math.random() - .5) * 70 * S, y: y + (Math.random() - .5) * 70 * S, r, sx: .85 + Math.random() * .3,
      rot: Math.random() * 3, wob: Math.random() * 50, ghost: false, cursor: true, born: performance.now(),
      life: 3500 + Math.random() * 2000, vx: (Math.random() - .5) * 6, vy: (Math.random() - .5) * 4,
    });
  };
  window.addEventListener('pointermove', onPointerMove);

  const PRbuf = new Float32Array(N * 4), PXbuf = new Float32Array(N * 4), Pbuf = new Float32Array(15);
  const t0 = performance.now();
  let last = t0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (current < 0) return;
    const dt = Math.min(.05, (now - last) / 1000), f = dt * 60;
    last = now;
    const ch = chapters[current], L = layoutFor(ch, W, H);
    // Colours, clear areas and the stain all ease toward the chapter; nothing jumps.
    const kc = reduce ? 1 : 1 - Math.pow(.975, f), kb = reduce ? 1 : 1 - Math.pow(.93, f);
    live.pal.forEach((c, i) => c.forEach((v, j) => { c[j] = lerp(v, ch.pal[i][j], kc); }));
    live.deep.forEach((v, j) => { live.deep[j] = lerp(v, ch.deep[j], kc); });
    const ts = L.shot ?? live.shot;
    for (let j = 0; j < 4; j++) { live.copy[j] = lerp(live.copy[j], L.copy[j], kb); live.shot[j] = lerp(live.shot[j], ts[j], kb); }
    live.shotOn = lerp(live.shotOn, L.shot ? 1 : 0, kb);
    if (washK < 1) washK = reduce ? 1 : clamp((now - washFrom) / 2200, 0, 1);

    prints = prints.filter((p) => {
      if (p.cursor) {
        const age = (now - p.born) / 1000, k = age * 1000 / (p.life ?? 4000);
        p.x += (p.vx ?? 0) * dt; p.y += (p.vy ?? 0) * dt;
        p.vx = (p.vx ?? 0) * Math.pow(.97, f); p.vy = (p.vy ?? 0) * Math.pow(.97, f);
        p.draw = p.r * ease(age / .6) * (1 + k * .12);
        p.a = k < .55 ? 1 : 1 - ease((k - .55) / .45);
        return p.a > 0;
      }
      if (p.dying) {
        const k = (now - p.dying) / (reduce ? 1 : 1100);
        p.a = 1 - ease(k); p.draw = p.r * (1 + ease(k) * .14);
        return k < 1;
      }
      const g = now < p.born ? 0 : ease((now - p.born) / 700);
      p.a = g > 0 ? 1 : 0; p.draw = p.r * g;
      return true;
    });
    if (!gl) return;
    const list = prints.length > N ? prints.filter((p) => !p.dying).concat(prints.filter((p) => p.dying)).slice(0, N) : prints;
    PRbuf.fill(0); PXbuf.fill(0);
    list.forEach((p, i) => {
      PRbuf.set([p.x, p.y, p.draw ?? 0, p.a ?? 0], i * 4);
      PXbuf.set([p.sx, p.rot, p.wob, p.ghost ? 1 : 0], i * 4);
    });
    live.pal.forEach((c, i) => Pbuf.set(c.map((v) => v / 255), i * 3));
    gl.uniform2f(U.R, canvas.width, canvas.height); gl.uniform1f(U.D, DPR); gl.uniform1f(U.S, H / 800);
    gl.uniform1f(U.t, reduce ? 0 : (now - t0) / 1000); gl.uniform1f(U.k, ease(washK));
    gl.uniform2f(U.seedA, seedA[0], seedA[1]); gl.uniform2f(U.seedB, seedB[0], seedB[1]);
    gl.uniform3fv(U.P, Pbuf); gl.uniform3f(U.DP, live.deep[0] / 255, live.deep[1] / 255, live.deep[2] / 255);
    gl.uniform4f(U.copyBox, live.copy[0], live.copy[1], live.copy[2], live.copy[3]);
    gl.uniform4f(U.shot, live.shot[0], live.shot[1], live.shot[2], live.shot[3]); gl.uniform1f(U.shotOn, live.shotOn);
    gl.uniform4fv(U.PR, PRbuf); gl.uniform4fv(U.PX, PXbuf);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  resize();
  raf = requestAnimationFrame(frame);
  return {
    go, resize,
    dispose: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
    },
  };
}
