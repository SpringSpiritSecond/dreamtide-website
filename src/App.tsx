import { DownloadPanel } from './components/DownloadPanel';
import { FeatureStory } from './components/FeatureStory';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Tutorial } from './components/Tutorial';
import { useLatestRelease } from './hooks/useLatestRelease';

export default function App() {
  const releaseState = useLatestRelease();

  return (
    <>
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <Header />
      <main id="main-content">
        <div id="top" />
        <Hero releaseState={releaseState} />
        <FeatureStory />
        <Tutorial />
        <section
          id="download"
          className="download-cta"
          aria-labelledby="download-title"
        >
          <p className="eyebrow">Android</p>
          <h2 id="download-title">下一场梦，醒来就记下</h2>
          <p>
            梦境与设置保存在当前设备。梦潮目前不提供云同步，请定期导出备份。
          </p>
          <DownloadPanel state={releaseState} variant="footer" />
        </section>
      </main>
      <footer className="site-footer">
        <span>梦潮 Dreamtide</span>
        <span>记录 · 整理 · 回看</span>
      </footer>
    </>
  );
}
