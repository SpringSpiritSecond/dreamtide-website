import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MediaFrame } from './MediaFrame';

const slides = [
  { title: '梦潮首页', description: '从刻梦、月历、梦境数量与词云进入不同路径。', src: 'media/首页.mp4', alt: '梦潮首页操作演示', label: '梦潮首页', portrait: true },
  { title: '刻梦书写', description: '输入梦境正文，选择梦境发生日期，再决定暂存或正式保存。', src: 'media/刻梦.jpg', alt: '梦潮刻梦书写页，包含正文、梦境日期、暂存与保存', label: '刻梦书写', portrait: true },
  { title: '标签与隐私工具', description: '保存以后，通过“标、隐、注”继续整理一场梦。', src: 'media/编辑-隐.jpg', alt: '梦境详情中的标签、隐私和注记工具', label: '标签与隐私', portrait: true },
  { title: '不谈人间事', description: '在人名原文、墨迹遮盖和化名之间切换。', src: 'media/不谈人间事.mp4', alt: '不谈人间事隐私模式演示', label: '不谈人间事', portrait: true },
  { title: '春梦了无痕', description: '隐藏私密片段，需要时再用打字动画恢复。', src: 'media/春梦了无痕.mp4', alt: '春梦了无痕隐私模式演示', label: '春梦了无痕', portrait: true },
  { title: '筛选档案', description: '按关键词、标签、人物、分类与日期缩小范围。', src: 'media/档案 筛选.jpg', alt: '梦潮档案筛选界面', label: '筛选档案', portrait: true },
  { title: '阅读正文', description: '从档案结果打开正文，继续查看标签、注记与释梦。', src: 'media/档案 正文.mp4', alt: '从档案打开梦境正文', label: '阅读正文', portrait: true },
  { title: '词云回看', description: '点击高频词，查看包含这个词的相关梦境。', src: 'media/词云.mp4', alt: '通过词云回看相关梦境', label: '词云回看', portrait: true },
  { title: '生成分享卡片', description: '先预览完整长图，再选择保存图片或系统分享。', src: 'media/分享.png', alt: '梦潮生成的梦境分享卡片', label: '分享卡片', portrait: false },
];

export function ProductGallery() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [playing]);

  const select = (index: number) => {
    setActive((index + slides.length) % slides.length);
    setPlaying(false);
  };
  const slide = slides[active];

  return (
    <section className="product-gallery" aria-labelledby="gallery-title">
      <div className="product-gallery__copy">
        <p className="eyebrow">产品图集</p>
        <h2 id="gallery-title"><span>一组素材，</span><span>看完整使用路径。</span></h2>
        <p>图集会自动切换，也可以点击下方名称或左右按钮手动查看。每张素材只在这里出现一次。</p>
        <div className="product-gallery__status" aria-live="polite">
          <span>{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          <h3>{slide.title}</h3>
          <p>{slide.description}</p>
        </div>
        <div className="product-gallery__controls">
          <button type="button" aria-label="上一张" onClick={() => select(active - 1)}><ChevronLeft aria-hidden="true" /></button>
          <button type="button" aria-label={playing ? '暂停自动切换' : '继续自动切换'} onClick={() => setPlaying((value) => !value)}>
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <button type="button" aria-label="下一张" onClick={() => select(active + 1)}><ChevronRight aria-hidden="true" /></button>
        </div>
      </div>
      <div className="product-gallery__stage">
        <MediaFrame key={slide.src} {...slide} eager />
      </div>
      <div className="product-gallery__tabs" role="tablist" aria-label="选择产品画面">
        {slides.map((item, index) => (
          <button type="button" role="tab" aria-selected={active === index} key={item.src} onClick={() => select(index)}>
            <span>{String(index + 1).padStart(2, '0')}</span>{item.title}
          </button>
        ))}
      </div>
    </section>
  );
}
