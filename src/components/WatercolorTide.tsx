import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { RELEASES_URL } from '../lib/githubRelease';
import type { ReleaseState } from '../lib/githubRelease';
import { COMPOSE_ASPECT, composeBox, createWatercolorTide, layoutFor } from '../lib/watercolorTide';
import type { WashChapter, WatercolorTide as Engine } from '../lib/watercolorTide';
import { createBubbleTide } from '../lib/bubbleTide';
import type { BubbleTide, Keepout, Point, TideShape } from '../lib/bubbleTide';

const media = (name: string) => `${import.meta.env.BASE_URL}media/${name}`;

type Screen = { image: string; alt: string; label: string; w: number; h: number };
/**
 * One piece of a chapter's composition, in fractions of the compose box (height = 1, width = COMPOSE_ASPECT).
 * phone: a whole App screen, tilted by `rot`; the main one gets a hand-drawn ink frame.
 * lens:  a close-up of one part of a screen, cut into a bubble-print shape with a pigment rim.
 */
type Piece =
  | { kind: 'phone'; screen: number; x: number; y: number; h: number; rot: number; frame?: boolean }
  | { kind: 'lens'; screen: number; fx: number; fy: number; zoom: number; x: number; y: number; d: number; rot: number };
type Chapter = WashChapter & {
  key: string; name: string; title: string; lines: readonly string[];
  screens?: readonly Screen[]; pieces?: readonly Piece[]; detail?: readonly string[];
};

const hex = (value: string) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as unknown as readonly [number, number, number];
const palette = (...values: string[]) => values.map(hex);
// App screens from the new design (public/media/app). Size is the exported image size.
const screen = (image: string, label: string, alt: string, w = 702, h = 1520): Screen => ({ image: `app/${image}.webp`, label, alt, w, h });
const phone = (s: number, x: number, y: number, h: number, rot: number, frame = false): Piece => ({ kind: 'phone', screen: s, x, y, h, rot, frame });
const lens = (s: number, fx: number, fy: number, zoom: number, x: number, y: number, d: number, rot = 0): Piece => ({ kind: 'lens', screen: s, fx, fy, zoom, x, y, d, rot });

// Pigments follow the App's own washes (晨、霞、藤、潮). Neighbouring chapters share a colour,
// so the paper hands over from one wash to the next instead of switching.
// Pieces are listed back to front.
const chapters: readonly Chapter[] = [
  { key: 'welcome', name: '梦潮', title: '梦醒以后，\n仍有迹可循',
    lines: ['梦潮是一款记录与回看梦境的 Android 应用。', '醒来时写下，过些日子再慢慢翻回去看。'],
    screens: [
      screen('home-cluster', '首页 · 聚', '梦潮首页的「聚」排布：梦里的词浮成泡印，下面是本周日期和刻梦、观梦两个入口', 739, 1600),
      screen('home-date', '首页 · 字', '梦潮首页的「字」排布：大字显示今天的日期和昨晚的梦', 739, 1600),
      screen('home-month', '首页 · 历', '梦潮首页的「历」排布：这个月的日历，有梦的日子留着泡印', 739, 1600),
    ],
    pieces: [phone(1, .2, .55, .64, -8), phone(2, .72, .5, .64, 7), phone(0, .45, .5, .82, -1.5, true), lens(0, .5, .29, 2.1, .8, .75, .3, 8)],
    detail: ['首页有三种排布：梦里的词、今天的日期、这个月的日历。', '点右侧的小图标切换排布。', '底部两个入口：「刻梦」写下新梦，「观梦」回看过去的梦。'],
    shots: [{ w: 739, h: 1600 }],
    pal: palette('#ec6f93', '#f2cf6b', '#9fb043', '#8a9ae0', '#ee9440'), deep: [150, 40, 80] },
  { key: 'write', name: '刻梦', title: '刻梦', lines: ['醒来后，趁还记得，把梦写下来。', '可以选日期，先暂存，想好了再保存。'],
    screens: [
      screen('write-draft', '写到一半', '刻梦页：正文写到一半，下方是暂存和保存按钮', 718, 1556),
      screen('write-restore', '恢复暂存', '刻梦页：再次进入时，上次暂存的正文和日期回到纸上', 718, 1554),
    ],
    pieces: [phone(1, .66, .45, .7, 6), phone(0, .33, .52, .84, -3, true), lens(0, .45, .25, 2.2, .8, .74, .3, -6)],
    detail: ['写下梦境正文，选好梦发生的日期。', '点「暂存」先存草稿，下次进来接着写。', '点「保存」，这场梦就正式记下了。'],
    shots: [{ w: 718, h: 1556 }],
    pal: palette('#ec6f93', '#ee9440', '#f2cf6b', '#86b443', '#8a9ae0'), deep: [170, 50, 80] },
  { key: 'record', name: '梦的层次', title: '梦的层次', lines: ['保存之后，梦里的词会浮成泡印。', '补上情绪和标签，写下注记，也能把梦里的人名遮起来。'],
    screens: [
      screen('read', '读一条梦', '读一条梦：标题、日期、梦里的词浮成泡印，下面是正文和分享、编辑、标隐注、释梦等操作', 718, 1556),
      screen('tag', '标记', '「标记」工具：在正文下方点选情绪、标签和分类', 718, 1556),
      screen('privacy-on', '遮住人名', '隐藏打开之后的正文：梦里的人名被墨迹遮住', 718, 1556),
    ],
    pieces: [phone(1, .2, .55, .64, -8), phone(2, .72, .5, .64, 7), phone(0, .45, .5, .82, -1.5, true), lens(0, .42, .2, 1.9, .82, .76, .3, 7)],
    detail: ['读梦时，底部是分享、编辑、标记、隐藏、注记和释梦。', '「标记」在正文下方补上情绪、标签和分类。', '「隐藏」用墨迹遮住梦里的人名，或藏起私密的片段。'],
    shots: [{ w: 718, h: 1556 }],
    pal: palette('#8a9ae0', '#9fd0ec', '#f09ab5', '#f2cf6b', '#35a39a'), deep: [60, 70, 150] },
  { key: 'view', name: '观梦', title: '观梦', lines: ['想回看时，按日子翻，或者按时间一条条看；', '也可以换成词云，看哪些词反复出现。'],
    screens: [
      screen('view-records', '记录', '观梦的记录：标题下切换记录和词云，梦按月份排列，每条有标题、摘录和标签'),
      screen('calendar-month', '日历', '日历：十一月月历，有梦的日期带着泡印，下面列出选中那天的梦', 739, 1600),
      screen('view-cloud', '词云', '观梦的词云：反复出现的词浮成大小不同的泡印'),
    ],
    pieces: [phone(1, .2, .55, .64, -8), phone(2, .72, .5, .64, 7), phone(0, .45, .5, .82, -1.5, true), lens(2, .48, .4, 1.8, .82, .76, .3, -7)],
    detail: ['标题下切换「记录」和「词云」，筛选条件两边通用。', '在日历上点一个日期，下面列出那天的梦。', '在词云里点一个词，下面列出提到它的梦。'],
    shots: [{ w: 702, h: 1520 }],
    pal: palette('#4f9fd0', '#45b5ae', '#8fd06a', '#f6b48a', '#e8707a'), deep: [30, 90, 120] },
  { key: 'share', name: '分享', title: '带走一场梦', lines: ['把一场梦生成一张长图，先看完整预览。', '满意了再保存图片，或者发给别人。'],
    screens: [screen('share', '分享长图', '分享图片预览：一场梦生成的长图，下面是保存图片和分享', 720, 1554)],
    pieces: [phone(0, .52, .5, .86, 2.5, true), lens(0, .5, .38, 1.9, .14, .74, .3, -6)],
    detail: ['读梦时点「分享」，先生成一张完整的长图。', '点「保存图片」存下来，或点「分享」发给别人。', '点「关闭」退出预览，什么都不会发出去。'],
    shots: [{ w: 720, h: 1554 }],
    pal: palette('#f6b48a', '#ec6f93', '#e3bd2f', '#45b5ae', '#8a9ae0'), deep: [170, 82, 50] },
  { key: 'download', name: '下载', title: '下载梦潮', lines: ['目前只有 Android 版，免费使用。', '下载后按手机提示完成安装。'],
    feature: 'cta', pal: palette('#45b5ae', '#ec6f93', '#3c7dc4', '#e3bd2f', '#86b443'), deep: [30, 90, 110] },
];

/**
 * The pigment bubbles follow a curve worked out from where things actually are on the page: they hug the
 * copy from below, sweep over the title, run down the gap before the phones, or curl round the download
 * print. Everything on the page that matters (text, screens, close-ups, controls) is kept clear.
 */
type Route = 'under' | 'over' | 'gap' | 'ring';
const routes: Record<string, Route> = {
  welcome: 'under', write: 'over', record: 'gap', view: 'under', share: 'over', download: 'ring',
};
type Box = [number, number, number, number];

function tideShape(route: Route, stage: HTMLElement, index: number, palette: TideShape['palette']): TideShape {
  const W = stage.clientWidth, H = stage.clientHeight, S = H / 800, mobile = W < 760;
  const rel = (el: Element): Box => {
    const a = el.getBoundingClientRect(), b = stage.getBoundingClientRect();
    return [a.left - b.left, a.top - b.top, a.width, a.height];
  };
  // Measure the settled layout: offsets ignore the entrance transforms still running.
  const at = (el: HTMLElement): Box => [el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight];
  const pad = (b: Box, p: number): Box => [b[0] - p, b[1] - p, b[2] + 2 * p, b[3] + 2 * p];
  const copyEl = stage.querySelector<HTMLElement>('.wash-copy');
  const copy: Box = copyEl ? rel(copyEl) : [0, 0, 0, 0];
  const pieces = [...stage.querySelectorAll<HTMLElement>('.wash-shot.is-on, .wash-lens.is-on')].map((el) => pad(at(el), 14 * S));
  const featureEl = stage.querySelector<HTMLElement>('.wash-feature.is-on');
  const feature = featureEl ? at(featureEl) : null;
  const avoid: Keepout[] = [
    { rect: pad(copy, 14 * S) }, ...pieces.map((rect) => ({ rect })),
    { rect: [0, 0, 260, 76] },                       // site name
    { rect: [W / 2 - 150, H - 66, 300, 66] },        // chapter dots
    { rect: [W - 300, H - 62, 300, 62] },            // hint
  ];
  if (feature) avoid.push({ circle: [feature[0] + feature[2] / 2, feature[1] + feature[3] / 2, feature[2] / 2 + 18 * S] });

  const left = copy[0], right = copy[0] + copy[2], top = copy[1], bottom = copy[1] + copy[3];
  const phonesLeft = pieces.length ? Math.min(...pieces.map((p) => p[0])) : W * .5;
  const gap = Math.max(right + 20, (right + phonesLeft) / 2);
  let path: Point[], width: number;
  if (mobile) {
    // One band between the copy and the screens, a slow wave across the page.
    const tops = [...pieces.map((p) => p[1]), ...(feature ? [feature[1]] : [])];
    const phonesTop = tops.length ? Math.min(...tops) : H * .7;
    const y = (bottom + phonesTop) / 2;
    path = [[-10, y + 8], [W * .3, y - 10], [W * .62, y + 8], [W + 10, y - 6]];
    width = Math.max(10, (phonesTop - bottom) / 2 - 8);
  } else if (route === 'ring' && feature) {
    const cx = feature[0] + feature[2] / 2, cy = feature[1] + feature[3] / 2, R = feature[2] / 2 + 60 * S;
    path = [215, 180, 145, 112, 80, 50].map((deg) => [cx + Math.cos(deg * Math.PI / 180) * R, cy + Math.sin(deg * Math.PI / 180) * R * .92]);
    width = 34 * S;
  } else if (route === 'over') {
    path = [[left + 150, top - 70 * S], [left + (right - left) * .55, top - 48 * S], [gap, top + 20 * S], [gap - 10, H * .58], [gap + 12, H * .9]];
    width = 30 * S;
  } else if (route === 'gap') {
    path = [[gap + 14, H * .06], [gap - 12, H * .3], [gap + 10, H * .54], [gap - 8, H * .78], [gap + 6, H * 1.02]];
    width = Math.max(18, (phonesLeft - right) / 2 - 10);
  } else {
    path = [[left - 40, H * 1.02], [left + (right - left) * .35, bottom + 60 * S], [right - 20, bottom + 24 * S], [gap, bottom - 60 * S], [gap + 8, H * .32], [gap - 6, H * .12]];
    width = 32 * S;
  }
  return { path, width, avoid, palette, seed: index + 1 };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const viewport = () => ({ w: window.innerWidth, h: window.innerHeight });
const rgb = (c: readonly number[]) => `${c[0]}, ${c[1]}, ${c[2]}`;

/** startAt: chapter key to open on (e.g. 'download'); jumpId changes whenever the address asks to go there again. */
export function WatercolorTide({ releaseState, startAt = null, jumpId = 0 }: { releaseState: ReleaseState; startAt?: string | null; jumpId?: number }) {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Engine | null>(null);
  const foamCanvas = useRef<HTMLCanvasElement>(null);
  const foam = useRef<BubbleTide | null>(null);
  const wheelRef = useRef({ last: 0 });
  const [active, setActive] = useState(() => Math.max(0, chapters.findIndex((item) => item.key === startAt)));
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(viewport);
  const [reduceMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const chapter = chapters[active];

  useEffect(() => {
    if (!canvas.current) return;
    const tide = createWatercolorTide(canvas.current, chapters, reduceMotion);
    engine.current = tide;
    let timer = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => { tide.resize(); setSize(viewport()); }, 150);
    };
    window.addEventListener('resize', onResize);
    return () => { tide.dispose(); engine.current = null; window.removeEventListener('resize', onResize); clearTimeout(timer); };
  }, [reduceMotion]);

  useEffect(() => {
    if (!foamCanvas.current) return;
    const bubbles = createBubbleTide(foamCanvas.current, reduceMotion);
    foam.current = bubbles;
    return () => { bubbles.dispose(); foam.current = null; };
  }, [reduceMotion]);

  // Re-route the bubbles whenever the chapter or the page size changes, once the new layout is in place.
  const routed = useRef(false);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const frame = requestAnimationFrame(() => {
      foam.current?.resize();
      foam.current?.set(tideShape(routes[chapter.key], element, active, chapter.pal), !routed.current);
      routed.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [active, chapter, size, open]);

  // The very first chapter appears at once; later ones are painted in.
  const painted = useRef(false);
  useEffect(() => {
    engine.current?.go(active, !painted.current);
    painted.current = true;
    document.documentElement.style.setProperty('--wash-tone', `rgb(${rgb(chapter.pal[0])})`);
  }, [active, chapter]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    let locked = false;
    let unlock = 0;
    let touchStart: { x: number; y: number } | null = null;
    const wheel = wheelRef.current;
    const turn = (direction: number) => {
      if (locked || !direction) return;
      const next = clamp(active + direction, 0, chapters.length - 1);
      if (next === active) return;
      locked = true;
      setOpen(false);
      setActive(next);
      unlock = window.setTimeout(() => { locked = false; }, reduceMotion ? 300 : 700);
    };
    // One swipe is one page. A trackpad keeps sending scroll events for a second or more after a swipe,
    // so a new turn needs a short pause in the stream, not just the end of the lock.
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      const now = performance.now();
      const fresh = now - wheel.last > 220;
      wheel.last = now;
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) < 6 || !fresh) return;
      turn(Math.sign(delta));
    };
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) touchStart = { x: touch.clientX, y: touch.clientY };
    };
    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch || !touchStart) return;
      const dx = touch.clientX - touchStart.x, dy = touch.clientY - touchStart.y;
      touchStart = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 46) turn(Math.abs(dy) > Math.abs(dx) ? -Math.sign(dy) : -Math.sign(dx));
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select')) return;
      if (event.key === 'Escape') { setOpen(false); return; }
      const direction = ['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key) ? 1
        : ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
      if (!direction) return;
      event.preventDefault();
      turn(direction);
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      clearTimeout(unlock);
    };
  }, [active, reduceMotion]);

  const goTo = (index: number) => { setOpen(false); setActive(index); };
  // Follow the address when it changes while the page is open (e.g. a link to #/download).
  const lastJump = useRef(jumpId);
  useEffect(() => {
    if (jumpId === lastJump.current) return;
    lastJump.current = jumpId;
    setOpen(false);
    setActive(Math.max(0, chapters.findIndex((item) => item.key === startAt)));
  }, [jumpId, startAt]);
  const download = releaseState.status === 'ready'
    ? { href: releaseState.release.downloadUrl, file: releaseState.release.fileName, meta: `${releaseState.release.version} · ${releaseState.release.sizeLabel}` }
    : { href: RELEASES_URL, file: undefined, meta: releaseState.status === 'loading' ? '正在读取最新版本' : '打开版本列表' };
  const titleLines = chapter.title.split('\n');
  const Heading = active === 0 ? 'h1' : 'h2';
  const [bx, by, , bh] = composeBox(size.w, size.h);

  return (
    <div className="watercolor-tide">
      <div ref={stage} className={`wash-stage${reduceMotion ? ' is-still' : ''}`}>
        <canvas ref={canvas} className="wash-canvas" aria-hidden="true" />
        <canvas ref={foamCanvas} className="wash-foam" aria-hidden="true" />
        <section key={`${active}-${open}`} className="wash-copy" aria-live="polite">
          <Heading className="wash-copy__title">{titleLines.map((line) => <span key={line}>{line}</span>)}</Heading>
          {open && chapter.detail ? (
            <ul id={`wash-detail-${chapter.key}`}>{chapter.detail.map((line) => <li key={line}>{line}</li>)}</ul>
          ) : chapter.lines.map((line) => <p key={line}>{line}</p>)}
        </section>

        {chapters.map((item, index) => {
          if (!item.screens || !item.pieces) return null;
          const isActive = index === active;
          return item.pieces.map((piece, order) => {
            const shot = item.screens![piece.screen];
            const tone = item.pal[order % item.pal.length];
            if (piece.kind === 'phone') {
              const h = piece.h * bh, w = h * shot.w / shot.h;
              const style = {
                left: bx + piece.x * bh * COMPOSE_ASPECT - w / 2, top: by + piece.y * bh - h / 2, width: w, height: h,
                '--rot': `${piece.rot}deg`, '--order': order, '--tone': rgb(tone), zIndex: 2 + order,
              } as CSSProperties;
              return (
                <button key={`${item.key}-${order}`} type="button" tabIndex={isActive ? 0 : -1} aria-hidden={!isActive}
                  className={`wash-shot${piece.frame ? ' has-frame' : ''}${isActive ? ' is-on' : ''}${isActive && open ? ' is-open' : ''}`}
                  style={style}
                  aria-label={`${isActive && open ? '收起' : '展开'}${item.name}说明 · ${shot.label}`}
                  aria-expanded={isActive && open} aria-controls={isActive && open ? `wash-detail-${item.key}` : undefined}
                  onClick={() => setOpen((value) => !value)}>
                  <img src={media(shot.image)} alt={shot.alt} />
                </button>
              );
            }
            // A close-up: the screen scaled up and slid so (fx, fy) sits in the middle of the bubble.
            const d = piece.d * bh, iw = d * piece.zoom, ih = iw * shot.h / shot.w;
            const style = {
              left: bx + piece.x * bh * COMPOSE_ASPECT - d / 2, top: by + piece.y * bh - d / 2, width: d, height: d,
              '--rot': `${piece.rot}deg`, '--order': order, '--tone': rgb(tone), '--shape': order % 3, zIndex: 2 + order,
            } as CSSProperties;
            return (
              <div key={`${item.key}-${order}`} aria-hidden="true" className={`wash-lens${isActive ? ' is-on' : ''}`} style={style}>
                <div className="wash-lens__window">
                  <img src={media(shot.image)} alt="" style={{ width: iw, height: ih, left: d / 2 - piece.fx * iw, top: d / 2 - piece.fy * ih }} />
                </div>
              </div>
            );
          });
        })}

        {chapters.map((item, index) => {
          if (!item.feature) return null;
          const [x, y, r] = layoutFor(item, size.w, size.h).feature!;
          const isActive = index === active;
          return (
            <div key={item.key} className={`wash-feature${isActive ? ' is-on' : ''}`} aria-hidden={!isActive}
              style={{ left: x - r, top: y - r, width: r * 2, height: r * 2 }}>
              <a className="wash-feature__download" href={download.href} download={download.file} tabIndex={isActive ? 0 : -1}>
                下载 Android 版<span>{download.meta}</span>
              </a>
            </div>
          );
        })}

        <nav className="wash-dots" aria-label="选择章节">
          {chapters.map((item, index) => (
            <button key={item.key} type="button" aria-label={`前往${item.name}`}
              aria-current={index === active ? 'step' : undefined} onClick={() => goTo(index)} />
          ))}
        </nav>
        <p className="wash-hint" aria-hidden="true">{active === 0 ? '向下滚动' : chapter.detail ? '轻触截图看操作说明' : ''}</p>
      </div>
    </div>
  );
}
