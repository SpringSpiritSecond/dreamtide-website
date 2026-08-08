import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { appSections, type AppSection } from '../content/siteContent';
import { MediaFrame } from './MediaFrame';

function SectionMedia({ section }: { section: AppSection }) {
  const [active, setActive] = useState(0);
  const isGallery = section.media.length > 1;
  const media = section.media[active];

  if (!isGallery) {
    return (
      <div className="app-section__media app-section__media--single">
        <MediaFrame {...media} />
      </div>
    );
  }

  const select = (index: number) => {
    setActive((index + section.media.length) % section.media.length);
  };

  return (
    <div className="app-section__media app-section__gallery">
      <div className="app-gallery__stage" aria-live="polite">
        <MediaFrame key={media.src} {...media} />
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
    </div>
  );
}

export function FeatureStory() {
  return (
    <section className="app-sections" aria-labelledby="app-sections-title">
      <div className="section-intro app-sections__intro">
        <p className="eyebrow">功能一览</p>
        <h2 id="app-sections-title"><span>沿着一场梦，</span><span>循迹去往更深处。</span></h2>
        <p>趁余温未散写下片段，让人物与意象渐渐显形；待年月流过，还能循着曾经留下的痕迹，再次与它相逢。</p>
      </div>

      <div className="app-sections__list">
        {appSections.map((section) => (
          <article className="app-section" id={`app-section-${section.number}`} key={section.number}>
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
