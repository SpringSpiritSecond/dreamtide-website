import { tutorialSteps } from '../content/siteContent';
import { MediaFrame } from './MediaFrame';

export function Tutorial() {
  return (
    <section id="guide" className="tutorial" aria-labelledby="guide-title">
      <div className="section-intro section-intro--guide">
        <p className="eyebrow">第一次使用梦潮</p>
        <h2 id="guide-title">从写下第一场梦开始</h2>
        <p>四个步骤，认识梦潮。</p>
      </div>
      <ol className="tutorial__list">
        {tutorialSteps.map((step) => (
          <li className="tutorial-step" key={step.number}>
            <div className="tutorial-step__copy">
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            <MediaFrame
              src={step.media.src}
              alt={step.media.alt}
              label={step.media.label}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
