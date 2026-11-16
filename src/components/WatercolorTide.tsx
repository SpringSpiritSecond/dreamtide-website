import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ReleaseState } from '../lib/githubRelease';
import { COMPOSE_ASPECT, composeBox, createWatercolorTide, layoutFor } from '../lib/watercolorTide';
import type { WashChapter, WatercolorTide as Engine } from '../lib/watercolorTide';

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
    lines: ['梦潮是一款记录与回看梦境的 Android 应用。', '写下、整理、回看，都只存在你的手机里。'],
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
  { key: 'record', name: '梦的层次', title: '梦的层次', lines: ['保存之后，梦里的词会浮成泡印。', '再补上情绪、标签和分类，也能写注记。'],
    screens: [
      screen('read', '读一条梦', '读一条梦：标题、日期、梦里的词浮成泡印，下面是正文和分享、编辑、标隐注、释梦等操作', 718, 1556),
      screen('tag', '标记', '「标记」工具：在正文下方点选情绪、标签和分类', 718, 1556),
    ],
    pieces: [phone(1, .68, .46, .7, 6), phone(0, .33, .52, .84, -2.5, true), lens(0, .42, .2, 1.9, .1, .22, .32, -8), lens(1, .4, .82, 1.9, .82, .72, .3, 6)],
    detail: ['读梦时，底部是分享、编辑、标记、隐藏、注记和释梦。', '「标记」在正文下方补上情绪、标签和分类。', '「注记」写下当时的感受，也可以请 AI 释梦。'],
    shots: [{ w: 718, h: 1556 }],
    pal: palette('#8a9ae0', '#9fd0ec', '#f09ab5', '#f2cf6b', '#35a39a'), deep: [60, 70, 150] },
  { key: 'calendar', name: '日历', title: '回到那一天', lines: ['按日子翻回去，看那天做过什么梦。', '有梦的日期下面，留着一枚小泡印。'],
    screens: [
      screen('calendar-month', '月历', '日历页：十一月月历，有梦的日期带着泡印，下面列出选中那天的梦', 739, 1600),
      screen('calendar-day', '当天', '当天页：十一月十日的两场梦', 739, 1600),
    ],
    pieces: [phone(1, .68, .46, .7, 6), phone(0, .33, .52, .84, -2.5, true), lens(0, .42, .31, 2.1, .8, .74, .3, 5)],
    detail: ['在月历上点一个日期，下面列出那天的梦。', '点日期标题，打开那一天的梦境页。', '「再记一场梦」会记在选中的那一天。'],
    shots: [{ w: 739, h: 1600 }],
    pal: palette('#4f9fd0', '#8fd06a', '#2f8f8f', '#9fd0ec', '#f09ab5'), deep: [30, 80, 130] },
  { key: 'view', name: '观梦', title: '观梦', lines: ['过去的梦都在「观梦」：按时间一条条看，', '或者换成词云，看哪些词反复出现。'],
    screens: [
      screen('view-records', '记录', '观梦的记录：标题下切换记录和词云，梦按月份排列，每条有标题、摘录和标签'),
      screen('view-cloud', '词云', '观梦的词云：反复出现的词浮成大小不同的泡印'),
    ],
    pieces: [phone(1, .68, .5, .72, 5), phone(0, .32, .5, .84, -3, true), lens(0, .3, .2, 2, .1, .2, .3, 7), lens(1, .48, .4, 1.8, .84, .74, .3, -7)],
    detail: ['标题下切换「记录」和「词云」，筛选条件两边通用。', '用搜索和筛选，按情绪、人物、标签或时间缩小范围。', '在词云里点一个词，下面列出提到它的梦。'],
    shots: [{ w: 702, h: 1520 }],
    pal: palette('#45b5ae', '#f6b48a', '#e8707a', '#4f9fd0', '#e3bd2f'), deep: [30, 110, 110] },
  { key: 'private', name: '隐私', title: '只留在\n你的手机里', lines: ['梦只存在这台设备上，没有账号，也不上传。', '梦里的人名和私密片段可以遮住，也能导出备份。'],
    screens: [
      screen('privacy-on', '隐私打开之后', '隐私打开之后的正文：梦里的人名被墨迹遮住，私密片段藏起来', 718, 1556),
      screen('account', '我的', '「我的」面板：隐私、外观和本机数据设置'),
    ],
    pieces: [phone(1, .68, .46, .7, 6), phone(0, .33, .52, .84, -2.5, true), lens(0, .78, .46, 2.3, .8, .74, .3, -5), lens(1, .62, .39, 1.7, .86, .16, .26, 6)],
    detail: ['「不谈人间事」：梦里的人名显示原名、遮住或换成化名。', '「春梦了无痕」：标为私密的文字显示或藏起来。', '「本地备份导出」把梦和设置存成一个文件。'],
    shots: [{ w: 718, h: 1556 }],
    pal: palette('#8a9ae0', '#45b5ae', '#f09ab5', '#9fd0ec', '#86b443'), deep: [50, 60, 140] },
  { key: 'share', name: '分享', title: '带走一场梦', lines: ['把一场梦生成一张长图，先看完整预览。', '满意了再保存到手机，或者发给别人。'],
    screens: [
      screen('share', '分享长图', '分享图片预览：一场梦生成的长图，下面是保存图片和分享', 720, 1554),
      screen('read', '读一条梦', '读一条梦：底部左边是分享', 718, 1556),
    ],
    pieces: [phone(1, .3, .47, .7, -6), phone(0, .64, .52, .84, 3, true), lens(0, .5, .38, 1.9, .14, .78, .3, -6)],
    detail: ['读梦时点「分享」，先生成一张完整的长图。', '点「保存图片」存到手机，或点「分享」发给别人。', '点「关闭」退出预览，什么都不会发出去。'],
    shots: [{ w: 720, h: 1554 }],
    pal: palette('#f6b48a', '#ec6f93', '#e3bd2f', '#45b5ae', '#8a9ae0'), deep: [170, 82, 50] },
  { key: 'download', name: '下载', title: '下载梦潮', lines: ['目前只有 Android 版，免费使用。', '下载后按手机提示完成安装。'],
    feature: 'cta', pal: palette('#45b5ae', '#ec6f93', '#3c7dc4', '#e3bd2f', '#86b443'), deep: [30, 90, 110] },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const viewport = () => ({ w: window.innerWidth, h: window.innerHeight });
const rgb = (c: readonly number[]) => `${c[0]}, ${c[1]}, ${c[2]}`;

export function WatercolorTide({ releaseState }: { releaseState: ReleaseState }) {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Engine | null>(null);
  const wheelRef = useRef({ last: 0 });
  const [active, setActive] = useState(0);
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
  const download = releaseState.status === 'ready'
    ? { href: releaseState.release.downloadUrl, file: releaseState.release.fileName, meta: `${releaseState.release.version} · ${releaseState.release.sizeLabel}` }
    : { href: '#/download', file: undefined, meta: releaseState.status === 'loading' ? '正在读取最新版本' : '查看下载说明' };
  const titleLines = chapter.title.split('\n');
  const Heading = active === 0 ? 'h1' : 'h2';
  const [bx, by, , bh] = composeBox(size.w, size.h);

  return (
    <div className="watercolor-tide">
      <div ref={stage} className={`wash-stage${reduceMotion ? ' is-still' : ''}`}>
        <canvas ref={canvas} className="wash-canvas" aria-hidden="true" />
        <section key={`${active}-${open}`} className="wash-copy" aria-live="polite">
          <Heading className="wash-copy__title">{titleLines.map((line) => <span key={line}>{line}</span>)}</Heading>
          {open && chapter.detail ? (
            <ul id={`wash-detail-${chapter.key}`}>{chapter.detail.map((line) => <li key={line}>{line}</li>)}</ul>
          ) : chapter.lines.map((line) => <p key={line}>{line}</p>)}
          {chapter.key === 'download' && <a className="wash-copy__guide" href="#/app">功能与使用说明 <ArrowRight aria-hidden="true" size={15} /></a>}
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
