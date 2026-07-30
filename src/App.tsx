import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DownloadPanel } from './components/DownloadPanel';
import { FeatureStory } from './components/FeatureStory';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Tutorial } from './components/Tutorial';
import { useLatestRelease } from './hooks/useLatestRelease';

type Page = 'home' | 'features' | 'guide';

const values = [
  { mark: '01', title: '醒来就写', text: '用最短的路径留住刚醒时仍然鲜活的画面、人物和情绪。' },
  { mark: '02', title: '慢慢整理', text: '标签、注记和人物线索，让散落的梦逐渐长成一份私人档案。' },
  { mark: '03', title: '重新理解', text: '从档案、词云与释梦出发，发现梦境中反复出现的线索。' },
];

const faqs = [
  ['梦境会上传到服务器吗？', '不会。梦境与设置保存在当前设备，梦潮目前不提供云同步。'],
  ['更换手机后如何保留记录？', '请先在设置中导出 JSON 备份，并把文件存放在安全的位置。当前版本暂不支持直接导入恢复。'],
  ['为什么安装时会出现风险提示？', '梦潮目前通过 APK 提供下载。Android 可能要求你允许浏览器安装未知来源应用，请只从本站的版本链接下载。'],
  ['可以隐藏不想被别人看到的内容吗？', '可以。你能标记人物或私密片段，并在浏览时选择显示、隐去或使用化名。'],
];

function pageFromHash(): Page {
  const route = window.location.hash.replace(/^#\/?/, '').split('/')[0];
  return route === 'features' || route === 'guide' ? route : 'home';
}

function HomePage({ releaseState }: { releaseState: ReturnType<typeof useLatestRelease> }) {
  return (
    <>
      <Hero releaseState={releaseState} />
      <a className="discover-banner" href="#/features" aria-label="深入了解梦潮的完整功能">
        <span className="discover-banner__index">不止是一眼 · 继续探索</span>
        <span className="discover-banner__title">了解梦潮</span>
        <span className="discover-banner__copy">
          看它如何记录、整理并重新连接每一场梦
          <ArrowRight aria-hidden="true" size={30} />
        </span>
      </a>
      <section className="value-strip" aria-label="梦潮的三个特点">
        {values.map((item) => (
          <article className="value-card" key={item.mark}>
            <span>{item.mark}</span><h2>{item.title}</h2><p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="pathways" aria-labelledby="pathways-title">
        <div className="section-intro">
          <p className="eyebrow">从这里继续</p>
          <h2 id="pathways-title"><span>按你现在想做的事，</span><span>选择一条路径</span></h2>
        </div>
        <div className="pathways__grid">
          <a className="path-card path-card--features" href="#/features">
            <span>01 · FEATURES</span>
            <h3>看看梦潮能做什么</h3>
            <p>记录、整理、隐私浏览、档案、词云与释梦，集中了解完整功能。</p>
            <strong>浏览全部功能 <ArrowRight aria-hidden="true" size={18} /></strong>
          </a>
          <a className="path-card path-card--guide" href="#/guide">
            <span>02 · START HERE</span>
            <h3>现在就开始使用</h3>
            <p>从下载安装开始，跟着指南写下第一场梦，并了解备份与隐私设置。</p>
            <strong>打开使用指南 <ArrowRight aria-hidden="true" size={18} /></strong>
          </a>
        </div>
      </section>

      <section className="manifesto" aria-labelledby="manifesto-title">
        <p className="eyebrow">为什么记录梦</p>
        <div>
          <h2 id="manifesto-title"><span>记录梦的原貌，</span><span>也探索梦的回响。</span></h2>
          <p>梦潮先帮你留住容易消散的细节，再通过人物、情绪、时间与释梦功能，陪你重新理解梦境中反复出现的线索。</p>
        </div>
        <span className="manifesto__glyph" aria-hidden="true">梦</span>
      </section>

      <section id="privacy" className="privacy-panel" aria-labelledby="privacy-title">
        <div><p className="eyebrow">本地优先</p><h2 id="privacy-title">你的梦，首先属于你。</h2></div>
        <div className="privacy-panel__copy">
          <p>梦境是很私人的内容。梦潮默认把数据留在你的设备中，不要求账号，也不把记录交给云端。</p>
          <ul>
            <li><strong>不需要登录</strong><span>打开就能开始记录</span></li>
            <li><strong>本地保存</strong><span>内容留在当前设备</span></li>
            <li><strong>可导出备份</strong><span>由你决定文件去向</span></li>
          </ul>
        </div>
      </section>

      <section id="faq" className="faq" aria-labelledby="faq-title">
        <div className="section-intro">
          <p className="eyebrow">常见问题</p>
          <h2 id="faq-title"><span>开始之前，</span><span>你可能还想知道</span></h2>
        </div>
        <div className="faq__list">
          {faqs.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>{question}<span aria-hidden="true">＋</span></summary><p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <a className="tutorial-gateway" href="#/guide" aria-label="进入梦潮完整使用教程">
        <span className="tutorial-gateway__eyebrow">看到这里，不妨真正开始</span>
        <strong>进入完整教程</strong>
        <span className="tutorial-gateway__action">
          从下载安装，到写下第一场梦
          <ArrowRight aria-hidden="true" size={34} />
        </span>
      </a>

      <DownloadSection releaseState={releaseState} />
    </>
  );
}

function DownloadSection({ releaseState }: { releaseState: ReturnType<typeof useLatestRelease> }) {
  return (
    <section id="download" className="download-cta" aria-labelledby="download-title">
      <p className="eyebrow">Android</p>
      <h2 id="download-title"><span>下一场梦，</span><span>醒来就记下。</span></h2>
      <p>免费使用，无需注册。梦境与设置保存在当前设备，请记得定期导出备份。</p>
      <DownloadPanel state={releaseState} variant="footer" />
    </section>
  );
}

function FeaturesPage() {
  return (
    <div className="subpage">
      <header className="subpage-hero">
        <p className="eyebrow">功能 · FEATURES</p>
        <h1><span>从一段刚醒的记忆，</span><span>到一份完整的梦境档案。</span></h1>
        <p>从醒来后的快速记录，到整理、回看与重新理解，看看梦潮如何陪伴一场梦慢慢留下痕迹。</p>
      </header>
      <FeatureStory />
      <nav className="next-page" aria-label="继续浏览">
        <span>接下来</span>
        <a href="#/guide">查看如何开始使用 <ArrowRight aria-hidden="true" /></a>
      </nav>
    </div>
  );
}

function GuidePage({ releaseState }: { releaseState: ReturnType<typeof useLatestRelease> }) {
  return (
    <div className="subpage">
      <header className="subpage-hero subpage-hero--guide">
        <p className="eyebrow">使用指南 · START HERE</p>
        <h1><span>先安装，</span><span>再写下第一场梦。</span></h1>
        <p>从下载安装到写下第一场梦，一步步熟悉记录、整理、隐私保护与备份。</p>
      </header>
      <section className="install-card" aria-labelledby="install-title">
        <div><span>STEP 01</span><h2 id="install-title">下载并安装梦潮</h2></div>
        <div>
          <p>下载最新 APK，按照 Android 系统提示完成安装。首次安装时，系统可能要求允许浏览器安装未知来源应用。</p>
          <DownloadPanel state={releaseState} />
        </div>
      </section>
      <Tutorial />
      <nav className="next-page" aria-label="继续浏览">
        <span>还想多了解一点？</span>
        <a href="#/features">浏览全部功能 <ArrowRight aria-hidden="true" /></a>
      </nav>
    </div>
  );
}

export default function App() {
  const releaseState = useLatestRelease();
  const [page, setPage] = useState<Page>(pageFromHash);

  useEffect(() => {
    const update = () => { setPage(pageFromHash()); window.scrollTo({ top: 0, behavior: 'instant' }); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <Header page={page} />
      <main id="main-content">
        {page === 'home' && <HomePage releaseState={releaseState} />}
        {page === 'features' && <FeaturesPage />}
        {page === 'guide' && <GuidePage releaseState={releaseState} />}
      </main>
      <footer className="site-footer"><span>梦潮 Dreamtide</span><span>记录 · 整理 · 回看</span></footer>
    </>
  );
}
