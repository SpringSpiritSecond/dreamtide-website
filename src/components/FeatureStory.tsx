import { features } from '../content/siteContent';
import { ProductGallery } from './ProductGallery';

export function FeatureStory() {
  return (
    <>
      <ProductGallery />
      <section className="feature-story feature-story--text" aria-labelledby="features-title">
        <div className="section-intro">
          <p className="eyebrow">功能地图</p>
          <h2 id="features-title"><span>先看功能关系，</span><span>需要时再进入详细指南。</span></h2>
          <p>图片统一放在上方图集；这里用文字解释各项能力，避免相同界面重复出现。</p>
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
