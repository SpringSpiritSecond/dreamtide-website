import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { appSections, type AppSection } from '../content/siteContent';
import { MediaFrame } from './MediaFrame';
import { LivingFoam, type FoamMood } from './LivingFoam';

const sectionMoods: FoamMood[] = ['home', 'write', 'record', 'archive', 'cloud', 'sharePage'];

function SectionMedia({ section }: { section: AppSection }) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const isGallery = section.media.length > 1;
  const media = section.media[active];
  useEffect(() => {
    if (!expanded) return;
    const root = document.getElementById('root');
    if (root) root.inert = true;
    return () => { if (root) root.inert = false; };
  }, [expanded]);
  const openDetail = () => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setExpanded(true);
  };
  const closeDetail = () => {
    setExpanded(false);
    requestAnimationFrame(() => returnFocus.current?.focus());
  };
  const detail = expanded && createPortal((
    <div className="app-media-detail" role="dialog" aria-modal="true" aria-label={`${section.title}图文说明`}
      onWheel={(event) => event.stopPropagation()} onTouchStart={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()} onKeyDown={(event) => {
        if (event.key === 'Escape') closeDetail();
        if (event.key === 'Tab') { event.preventDefault(); event.currentTarget.querySelector('button')?.focus(); }
      }}>
      <LivingFoam mood={sectionMoods[Number(section.number) - 1]} className="app-media-detail__foam" />
      <div className="app-media-detail__inner">
        <div className="app-media-detail__topline"><span>梦潮 DreamTide</span><span>{section.number} / 06</span></div>
        <button type="button" className="app-media-detail__close" autoFocus onClick={closeDetail}>返回{section.title} <ChevronLeft aria-hidden="true" size={16} /></button>
        <div className="app-media-detail__image"><img src={`${import.meta.env.BASE_URL}${media.src}`} alt={media.alt} /></div>
        <div className="app-media-detail__copy">
          <p className="app-media-detail__kicker">{section.kicker} · {media.label}</p>
          <h4>{section.title}</h4>
          <p>{section.description}</p>
          <p>{media.detail ?? section.guides[0]?.summary}</p>
          <ul>{section.highlights.map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
      </div>
    </div>
  ), document.body);

  if (!isGallery) {
    return (
      <div className="app-section__media app-section__media--single">
        <MediaFrame {...media} onImageClick={openDetail} />
        {detail}
      </div>
    );
  }

  const select = (index: number) => {
    setActive((index + section.media.length) % section.media.length);
  };

  return (
    <div className="app-section__media app-section__gallery">
      <div className="app-gallery__stage" aria-live="polite">
        <MediaFrame key={media.src} {...media} onImageClick={openDetail} />
      </div>
      <div className="app-gallery__footer">
        <div>
          <span>{String(active + 1).padStart(2, '0')} / {String(section.media.length).padStart(2, '0')}</span>
          <strong>{media.label}</strong>
        </div>
        <div className="app-gallery__controls">
          <button type="button" aria-label={`${section.title}上一张`} onClick={() => select(active - 1)}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" aria-label={`${section.title}下一张`} onClick={() => select(active + 1)}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="app-gallery__tabs" role="tablist" aria-label={`${section.title}图集`}>
        {section.media.map((item, index) => (
          <button
            type="button"
            role="tab"
            aria-selected={active === index}
            key={item.src}
            onClick={() => select(index)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {item.label}
          </button>
        ))}
      </div>
      {detail}
    </div>
  );
}

export function FeatureStory() {
  return (
    <section className="app-sections" aria-labelledby="app-sections-title">
      <div className="section-intro app-sections__intro">
        <LivingFoam mood="overview" className="app-screen__foam" />
        <p className="eyebrow">功能一览</p>
        <h2 id="app-sections-title"><span>从写下梦境，</span><span>到整理与回看。</span></h2>
        <p>下面按实际使用顺序介绍书写、标签与隐私标记、档案筛选、词云和分享预览。</p>
      </div>

      <div className="app-sections__list">
        {appSections.map((section) => (
          <article className="app-section" id={`app-section-${section.number}`} key={section.number}>
            <LivingFoam mood={sectionMoods[Number(section.number) - 1]} className="app-section__foam" />
            <div className="app-section__copy">
              <div className="app-section__index">
                <span>{section.number}</span>
                <small>{section.kicker}</small>
              </div>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <ul>
                {section.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
            </div>

            <SectionMedia section={section} />

            <details className="app-guide">
              <summary>
                <span>使用指南</span>
                <strong>了解如何使用“{section.title}”</strong>
                <i aria-hidden="true">＋</i>
              </summary>
              <div className="app-guide__content">
                {section.guides.map((guide) => (
                  <section className="app-guide__group" key={guide.title}>
                    <header>
                      <h4>{guide.title}</h4>
                      <p>{guide.summary}</p>
                    </header>
                    <dl>
                      {guide.controls.map(([name, description]) => (
                        <div key={name}>
                          <dt>{name}</dt>
                          <dd>{description}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </div>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
