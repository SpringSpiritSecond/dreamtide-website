import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { LivingFoam } from './LivingFoam';
import { WaterSurfaceCanvas } from './WaterSurfaceCanvas';
import type { WaterSurfaceHandle } from './WaterSurfaceCanvas';

const media = (name: string) => `${import.meta.env.BASE_URL}media/${name}`;
type Screen = { image: string; alt: string; label: string; lines: readonly string[] };
type Scene = { key: string; name: string; displayTitle: string; lineOne: string; lineTwo: string; note: string; screens: readonly Screen[] };

// Composition follows the four approved morphology studies; 刻梦 is the home scene.
const scenes: readonly Scene[] = [
  { key: 'write', name: '刻梦', displayTitle: '刻梦', lineOne: '醒来后，写下还记得的梦。', lineTwo: '选择日期，暂存或正式保存。', note: '正文 · 日期 · 保存',
    screens: [
      { image: '刻梦.jpg', alt: '梦潮刻梦书写界面', label: '写下梦境', lines: ['写下梦境正文。', '选择梦发生的日期。', '可以暂存草稿，或保存为正式记录。'] },
      { image: 'chapter-art/write-date.webp', alt: '刻梦界面中的日期与保存操作', label: '日期与保存', lines: ['日期可选今天或过去的某一天。', '暂存草稿，或保存为正式记录。'] },
    ] },
  { key: 'record', name: '记录', displayTitle: '梦的层次', lineOne: '保存后，补上情绪、标签和人物。', lineTwo: '也能写注记、标记私密内容。', note: '标签 · 注记 · 隐私',
    screens: [
      { image: '编辑-隐.jpg', alt: '梦境记录与隐私界面', label: '梦境记录', lines: ['为梦补上标签、人物与情绪。', '重读时继续写下注记。', '私密片段由你决定是否显示。'] },
      { image: 'chapter-art/record-tags.webp', alt: '梦境记录中的标签', label: '标签', lines: ['给梦境添加情绪、内容标签和分类。', '也可以标记梦中出现的人物。'] },
      { image: 'chapter-art/record-private.webp', alt: '梦境记录中的隐私与注记', label: '隐私与注记', lines: ['标记私密片段，浏览时切换显示状态。', '为整场梦或正文片段写下注记。'] },
    ] },
  { key: 'archive', name: '档案', displayTitle: '循迹', lineOne: '按日期回看保存的梦。', lineTwo: '用关键词、标签和人物筛选。', note: '日期 · 搜索 · 筛选',
    screens: [
      { image: '档案.jpg', alt: '梦潮档案列表界面', label: '档案回看', lines: ['按日期与词语查找。', '用标签、人物缩小范围。', '点开一场梦继续阅读。'] },
      { image: 'chapter-art/archive-filter.webp', alt: '梦潮档案筛选界面', label: '寻找线索', lines: ['按关键词、标签和人物筛选。', '也可以只看某段时间的梦。'] },
    ] },
  { key: 'share', name: '分享', displayTitle: '带走一场梦', lineOne: '生成梦境长图，先看完整预览。', lineTwo: '确认后保存图片，或选择分享。', note: '长图 · 预览 · 分享',
    screens: [
      { image: '分享.png', alt: '梦潮梦境分享长图预览', label: '分享预览', lines: ['先生成并预览完整梦境长图。', '可以保存图片到设备。', '也可以打开系统分享面板发送。'] },
    ] },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function TideExperience() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const water = useRef<WaterSurfaceHandle>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const lastDrag = useRef<{ x: number; y: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState<{ scene: number; screen: number } | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const active = clamp(Math.round(progress), 0, scenes.length - 1);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    let locked = false;
    let unlock = 0;
    let touchStart: { x: number; y: number } | null = null;
    const turn = (direction: number) => {
      if (locked || !direction) return;
      const next = clamp(active + direction, 0, scenes.length - 1);
      if (next === active) return;
      locked = true;
      setExpanded(null);
      setProgress(next);
      unlock = window.setTimeout(() => { locked = false; }, 620);
    };
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) < 4) return;
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
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.25) turn(-Math.sign(dx));
      touchStart = null;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select')) return;
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'PageDown' ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 0;
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
  }, [active]);
  useEffect(() => { setExpanded(null); }, [active]);

  const goTo = (index: number) => {
    setExpanded(null);
    setProgress(clamp(index, 0, scenes.length - 1));
  };
  const toggleScreen = (scene: number, screen: number, isOpen: boolean) => {
    setExpanded(isOpen ? null : { scene, screen });
  };
  const positionOf = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = positionOf(event);
    pointer.current = point;
    if (reduceMotion || !stage.current) return;
    stage.current.style.setProperty('--pointer-x', `${point.x}px`);
    stage.current.style.setProperty('--pointer-y', `${point.y}px`);
    if (event.buttons !== 0 || event.pointerType === 'touch') {
      const last = lastDrag.current;
      if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 9) {
        water.current?.disturb(point.x, point.y, .5);
        lastDrag.current = point;
      }
    }
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = positionOf(event);
    pointer.current = point;
    lastDrag.current = point;
    if (!reduceMotion) water.current?.disturb(point.x, point.y, 1);
  };

  return (
    <div className="tide-experience" ref={root}>
      <div ref={stage} className={`tide-stage tide-stage--${scenes[active].key}${expanded ? ' is-expanded' : ''}`}
        onPointerMove={onPointerMove} onPointerDown={onPointerDown}
        onPointerUp={() => { lastDrag.current = null; }}
        onPointerLeave={() => { pointer.current = null; lastDrag.current = null; }}>
        <WaterSurfaceCanvas ref={water} reducedMotion={reduceMotion} />
        <LivingFoam mood={scenes[active].key as 'write' | 'record' | 'archive' | 'share'} progress={progress} pointer={pointer} reducedMotion={reduceMotion} className="tide-foam-canvas" />
        <div className="tide-stage__topline" aria-hidden="true"><span>梦潮 DreamTide</span><span>0{active + 1} / 0{scenes.length}</span></div>
        {scenes.map((scene, index) => {
          const visible = index === active;
          const openScreen = expanded?.scene === index ? expanded.screen : null;
          const shown = scene.screens[openScreen ?? 0];
          return (
            <section key={scene.key} className={`tide-scene tide-scene--${scene.key}${openScreen !== null ? ' is-expanded' : ''}`}
              aria-labelledby={`tide-title-${scene.key}`} aria-hidden={!visible} inert={!visible}
              style={{ transform: `translateX(${(index - active) * 100}%)` }}>
              <div className="tide-scene__frame">
                {index === 0 ? <h1 id={`tide-title-${scene.key}`} className="tide-chapter-title">{scene.displayTitle}</h1>
                  : <h2 id={`tide-title-${scene.key}`} className="tide-chapter-title">{scene.displayTitle}</h2>}
                <div className="tide-scene__copy" aria-live="polite">
                  {openScreen === null ? <><p>{scene.lineOne}</p><p>{scene.lineTwo}</p></> : (
                    <><span className="tide-scene__detail-kicker">0{index + 1} / {scene.name}</span><p>{shown.label}</p><div id={`tide-detail-${scene.key}`} className="tide-scene__detail">
                      {shown.lines.map((line) => <span key={line}>{line}</span>)}
                    </div></>
                  )}
                  {index === scenes.length - 1 && openScreen === null && (
                    <a className="tide-scene__guide-link" href="#/app">功能与使用说明 <ArrowRight aria-hidden="true" size={15} /></a>
                  )}
                </div>
                <div className="tide-screens">
                  {scene.screens.map((screen, screenIndex) => {
                    const isOpen = openScreen === screenIndex;
                    return (
                      <button key={screen.image} type="button"
                        className={`tide-screen tide-screen--${scene.key}-${screenIndex}${isOpen ? ' is-open' : ''}`}
                        aria-label={`${isOpen ? '收起' : '展开'}${screen.label}说明`} aria-expanded={isOpen}
                        aria-controls={isOpen ? `tide-detail-${scene.key}` : undefined}
                        onClick={() => toggleScreen(index, screenIndex, isOpen)}>
                        <img src={media(screen.image)} alt={screen.alt} />
                        <span className="tide-screen__label" aria-hidden="true">{isOpen ? '轻触恢复' : `轻触 · ${screen.label}`}</span>
                      </button>
                    );
                  })}
                </div>
                {openScreen !== null && <button type="button" className="tide-scene__open-note" onClick={() => setExpanded(null)}>返回{scene.name}章节 <ArrowRight aria-hidden="true" size={15} /></button>}
                <span className="tide-scene__footnote" aria-hidden="true">{scene.note}</span>
              </div>
            </section>
          );
        })}
        <div className="tide-stage__bottomline">
          <span>梦境手札</span>
          <nav className="tide-progress" aria-label="选择章节">
            {scenes.map((scene, index) => (
              <button key={scene.key} type="button" className={index === active ? 'is-current' : ''}
                aria-label={`前往${scene.name}`} aria-current={index === active ? 'step' : undefined}
                onClick={() => goTo(index)} />
            ))}
          </nav>
          {active < scenes.length - 1 ? (
            <button type="button" className="tide-next" onClick={() => goTo(active + 1)}>下一页 <ArrowRight aria-hidden="true" size={15} /></button>
          ) : <span className="tide-next-spacer" aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}
