import { features } from '../content/siteContent';
import { MediaFrame } from './MediaFrame';

export function FeatureStory() {
  return (
    <section id="features" className="feature-story" aria-labelledby="features-title">
      <div className="section-intro">
        <p className="eyebrow">从记录到回看</p>
        <h2 id="features-title">
          <span>把散落的片段，</span>
          <span>慢慢收回来</span>
        </h2>
        <p>不是复杂的管理工具，而是一条顺着记忆自然展开的路径。</p>
      </div>
      <div className="feature-story__list">
        {features.map((feature) => (
          <article className="feature" key={feature.number}>
            <div className="feature__index"><span>{feature.number}</span><small>{feature.kicker}</small></div>
            <div className="feature__copy">
              <h3>{feature.title}</h3><p>{feature.description}</p>
              <ol className="feature__steps">{feature.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            </div>
            {feature.media && <div className={`feature__media${feature.media.length > 1 ? ' feature__media--sequence' : ''}`}>
              {feature.media.map((media) => <MediaFrame key={media.src} {...media} />)}
            </div>}
          </article>
        ))}
      </div>
    </section>
  );
}
