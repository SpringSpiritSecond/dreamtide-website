import { features } from '../content/siteContent';
import { ProductGallery } from './ProductGallery';

export function FeatureStory() {
  return (
    <>
      <ProductGallery />
      <section className="feature-story feature-story--text" aria-labelledby="features-title">
        <div className="section-intro">
          <p className="eyebrow">功能地图</p>
          <h2 id="features-title"><span>从记录到回看，</span><span>每一步都有迹可循。</span></h2>
          <p>了解记录、整理、隐私保护与重新发现之间如何彼此连接。</p>
        </div>
        <div className="feature-cards">
          {features.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <div className="feature__index"><span>{feature.number}</span><small>{feature.kicker}</small></div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <ul>{feature.steps.map((step) => <li key={step}>{step}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
