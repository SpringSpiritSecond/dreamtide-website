import { features } from '../content/siteContent';
import { MediaFrame } from './MediaFrame';

export function FeatureStory() {
  return (
    <section
      id="features"
      className="feature-story"
      aria-labelledby="features-title"
    >
      <div className="section-intro">
        <p className="eyebrow">一场梦，从记录到回看</p>
        <h2 id="features-title">把散落的片段，慢慢收回来</h2>
      </div>
      <div className="feature-story__list">
        {features.map((feature) => (
          <article className="feature" key={feature.number}>
            <span className="feature__number" aria-hidden="true">
              {feature.number}
            </span>
            <div className="feature__copy">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <ol className="feature__steps">
                {feature.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            {feature.media && (
              <div
                className={`feature__media${
                  feature.media.length > 1 ? ' feature__media--sequence' : ''
                }`}
              >
                {feature.media.map((media) => (
                  <MediaFrame
                    key={media.src}
                    src={media.src}
                    alt={media.alt}
                    label={media.label}
                    portrait={media.portrait}
                  />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
