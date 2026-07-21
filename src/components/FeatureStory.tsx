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
            </div>
            {feature.media && (
              <MediaFrame
                src={feature.media.src}
                alt={feature.media.alt}
                label={feature.media.label}
                portrait={feature.media.portrait}
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
