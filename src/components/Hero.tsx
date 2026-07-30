import type { ReleaseState } from '../lib/githubRelease';
import { DownloadPanel } from './DownloadPanel';
import { MediaFrame } from './MediaFrame';

export function Hero({ releaseState }: { releaseState: ReleaseState }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="eyebrow">本地优先的 Android 梦境记录应用</p>
        <h1 id="hero-title">潮落有迹，<br /><em>梦醒留痕。</em></h1>
        <p className="hero__lead">在梦消散以前，接住它。记录画面与情绪，整理人物和片段，再从日历、档案与词云里慢慢回看。</p>
        <div className="hero__actions">
          <DownloadPanel state={releaseState} />
          <a className="button button--quiet" href="#features">先了解梦潮</a>
        </div>
        <div className="hero__notes" aria-label="产品特点">
          <span>无需账号</span><span>数据本地保存</span><span>支持导出备份</span>
        </div>
      </div>
      <div className="hero__visual">
        <span className="hero__stamp" aria-hidden="true">DREAM / TIDE</span>
        <div className="hero__orb" aria-hidden="true" />
        <MediaFrame src="media/首页.mp4" alt="梦潮 App 首页操作演示" label="梦潮首页" eager portrait />
        <p className="hero__caption"><span>01</span> 一份只属于你的梦境档案</p>
      </div>
    </section>
  );
}
