import type { ReleaseState } from '../lib/githubRelease';
import { DownloadPanel } from './DownloadPanel';
import { MediaFrame } from './MediaFrame';

export function Hero({ releaseState }: { releaseState: ReleaseState }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="eyebrow">本地优先的 Android 梦境记录应用</p>
        <h1 id="hero-title">梦醒以后，仍有迹可循</h1>
        <p className="hero__lead">
          记录每一次梦境，整理情绪与片段，再从日历、档案和词云里慢慢回看。
        </p>
        <div className="hero__actions">
          <DownloadPanel state={releaseState} />
          <a className="button button--quiet" href="#guide">
            看看怎么用
          </a>
        </div>
      </div>
      <div className="hero__visual">
        <span className="hero__stamp" aria-hidden="true">
          DREAM / TIDE
        </span>
        <MediaFrame
          src="media/hero/home.webp"
          alt="梦潮 App 首页"
          label="梦潮首页主截图"
          eager
          portrait
        />
      </div>
    </section>
  );
}
