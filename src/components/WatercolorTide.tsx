import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ReleaseState } from '../lib/githubRelease';
import { createWatercolorTide, layoutFor } from '../lib/watercolorTide';
import type { WashChapter, WatercolorTide as Engine } from '../lib/watercolorTide';

const media = (name: string) => `${import.meta.env.BASE_URL}media/${name}`;

type Chapter = WashChapter & {
  key: string; name: string; title: string; lines: readonly string[];
  screen?: { image: string; alt: string; label: string; detail: readonly string[] };
};

// Neighbouring chapters share a pigment, so colour hands over instead of switching.
const chapters: readonly Chapter[] = [
  { key: 'welcome', name: '梦潮', title: '梦醒以后，\n仍有迹可循',
    lines: ['梦潮是一款记录与回看梦境的 Android 应用。', '写下、整理、回看，都只存在你的手机里。'],
    feature: 'word', pal: [[214, 104, 138], [176, 140, 196], [234, 150, 104], [226, 192, 92], [104, 156, 200]], deep: [164, 52, 96] },
  { key: 'write', name: '刻梦', title: '刻梦', lines: ['醒来后，趁还记得，把梦写下来。', '可以选日期，先暂存，想好了再保存。'],
    screen: { image: '刻梦.jpg', alt: '梦潮刻梦书写界面', label: '写下梦境', detail: ['写下梦境正文。', '选择梦发生的日期。', '先暂存草稿，或直接保存为正式记录。'] },
    shot: { w: 1260, h: 2668 }, pal: [[214, 104, 138], [234, 150, 104], [226, 192, 92], [150, 176, 84], [176, 140, 196]], deep: [176, 46, 84] },
  { key: 'record', name: '记录', title: '梦的层次', lines: ['保存之后，补上情绪、标签和梦里的人。', '也能写注记，把私密的片段藏起来。'],
    screen: { image: '编辑-隐.jpg', alt: '梦境记录与隐私界面', label: '梦境记录', detail: ['为梦补上标签、人物与情绪。', '重读时继续写下注记。', '私密片段由你决定是否显示。'] },
    shot: { w: 1260, h: 2676 }, pal: [[58, 150, 150], [92, 136, 210], [136, 182, 104], [150, 130, 200], [214, 132, 150]], deep: [44, 70, 140] },
  { key: 'archive', name: '档案', title: '循迹', lines: ['按日期翻回去看保存过的梦。', '用一个词、一个标签或一个人去找。'],
    screen: { image: '档案.jpg', alt: '梦潮档案列表界面', label: '档案回看', detail: ['按日期与词语查找。', '用标签、人物缩小范围。', '点开一场梦继续阅读。'] },
    shot: { w: 1260, h: 2648 }, pal: [[92, 128, 200], [150, 128, 204], [58, 156, 170], [200, 150, 190], [226, 196, 120]], deep: [52, 56, 128] },
  { key: 'share', name: '分享', title: '带走一场梦', lines: ['把一场梦生成长图，先看完整预览。', '满意了再保存到相册，或发给别人。'],
    screen: { image: '分享.png', alt: '梦潮梦境分享长图预览', label: '分享预览', detail: ['先生成并预览完整梦境长图。', '可以保存图片到设备。', '也可以打开系统分享面板发送。'] },
    shot: { w: 1080, h: 848 }, pal: [[222, 168, 76], [236, 140, 104], [214, 112, 140], [160, 176, 92], [150, 130, 200]], deep: [170, 82, 50] },
  { key: 'download', name: '下载', title: '下载梦潮', lines: ['目前只有 Android 版，免费使用。', '下载后按手机提示完成安装。'],
    feature: 'cta', pal: [[58, 150, 150], [214, 112, 140], [92, 136, 210], [226, 192, 92], [136, 182, 104]], deep: [40, 92, 110] },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const viewport = () => ({ w: window.innerWidth, h: window.innerHeight });

export function WatercolorTide({ releaseState }: { releaseState: ReleaseState }) {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Engine | null>(null);
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
    document.documentElement.style.setProperty('--wash-tone', `rgb(${chapter.pal[0].join(',')})`);
  }, [active, chapter]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    let locked = false;
    let unlock = 0;
    let touchStart: { x: number; y: number } | null = null;
    const turn = (direction: number) => {
      if (locked || !direction) return;
      const next = clamp(active + direction, 0, chapters.length - 1);
      if (next === active) return;
      locked = true;
      setOpen(false);
      setActive(next);
      unlock = window.setTimeout(() => { locked = false; }, reduceMotion ? 300 : 1200);
    };
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) < 6) return;
      event.preventDefault();
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

  return (
    <div className="watercolor-tide">
      <div ref={stage} className={`wash-stage${reduceMotion ? ' is-still' : ''}`}>
        <canvas ref={canvas} className="wash-canvas" aria-hidden="true" />
        <section key={`${active}-${open}`} className="wash-copy" aria-live="polite">
          <Heading className="wash-copy__title">{titleLines.map((line) => <span key={line}>{line}</span>)}</Heading>
          {open && chapter.screen ? (
            <ul id={`wash-detail-${chapter.key}`}>{chapter.screen.detail.map((line) => <li key={line}>{line}</li>)}</ul>
          ) : chapter.lines.map((line) => <p key={line}>{line}</p>)}
          {chapter.key === 'download' && <a className="wash-copy__guide" href="#/app">功能与使用说明 <ArrowRight aria-hidden="true" size={15} /></a>}
        </section>

        {chapters.map((item, index) => {
          if (!item.screen) return null;
          const rect = layoutFor(item, size.w, size.h).shot!;
          const isActive = index === active;
          return (
            <button key={item.key} type="button" tabIndex={isActive ? 0 : -1} aria-hidden={!isActive}
              className={`wash-shot${item.shot!.w > item.shot!.h ? ' is-wide' : ''}${isActive ? ' is-on' : ''}${isActive && open ? ' is-open' : ''}`}
              style={{ left: rect[0], top: rect[1], width: rect[2], height: rect[3] }}
              aria-label={`${isActive && open ? '收起' : '展开'}${item.screen.label}说明`}
              aria-expanded={isActive && open} aria-controls={isActive && open ? `wash-detail-${item.key}` : undefined}
              onClick={() => setOpen((value) => !value)}>
              <img src={media(item.screen.image)} alt={item.screen.alt} />
            </button>
          );
        })}

        {chapters.map((item, index) => {
          if (!item.feature) return null;
          const [x, y, r] = layoutFor(item, size.w, size.h).feature!;
          const isActive = index === active;
          return (
            <div key={item.key} className={`wash-feature${isActive ? ' is-on' : ''}`} aria-hidden={!isActive}
              style={{ left: x - r, top: y - r, width: r * 2, height: r * 2, ['--word' as string]: `${Math.round(r * .5)}px` }}>
              {item.feature === 'word' ? <span className="wash-feature__word" aria-hidden="true">梦潮</span> : (
                <a className="wash-feature__download" href={download.href} download={download.file} tabIndex={isActive ? 0 : -1}>
                  下载 Android 版<span>{download.meta}</span>
                </a>
              )}
            </div>
          );
        })}

        <nav className="wash-dots" aria-label="选择章节">
          {chapters.map((item, index) => (
            <button key={item.key} type="button" aria-label={`前往${item.name}`}
              aria-current={index === active ? 'step' : undefined} onClick={() => goTo(index)} />
          ))}
        </nav>
        <p className="wash-hint" aria-hidden="true">{active === 0 ? '向下滚动' : chapter.screen ? '轻触截图看操作说明' : ''}</p>
      </div>
    </div>
  );
}
