import { tutorialSteps } from '../content/siteContent';
import { MediaFrame } from './MediaFrame';

export function Tutorial() {
  return (
    <section id="guide" className="tutorial" aria-labelledby="guide-title">
      <div className="section-intro section-intro--guide">
        <p className="eyebrow">第一次使用梦潮</p>
        <h2 id="guide-title">四步，开始保存<br />你的梦境档案</h2>
        <p>不需要先学会复杂的分类方法。先写下来，剩下的可以慢慢完成。</p>
      </div>
      <ol className="tutorial__list">
        {tutorialSteps.map((step) => (
          <li className="tutorial-step" key={step.number}>
            <div className="tutorial-step__copy"><span>{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></div>
            <div className={`tutorial-step__media${step.media.length > 1 ? ' tutorial-step__media--sequence' : ''}`}>
              {step.media.map((media) => <MediaFrame key={media.src} {...media} />)}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
