import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DownloadPanel } from './components/DownloadPanel';
import { FeatureStory } from './components/FeatureStory';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { useLatestRelease } from './hooks/useLatestRelease';

type Page = 'home' | 'app';

const values = [
  { mark: '01', title: '趁梦未散', text: '醒来片刻，把尚有温度的光影、人声与情绪轻轻收下。' },
  { mark: '02', title: '听见回声', text: '人物、情绪与反复出现的意象，在字里行间慢慢显出彼此的关联。' },
  { mark: '03', title: '潮汐有迹', text: '当年月与数量铺展开来，那些曾经来过的梦，也有了可循的纹路与轻重。' },
];

const faqs = [
  ['梦境会上传到服务器吗？', '不会。梦境与设置保存在当前设备，梦潮目前不提供云同步。'],
  ['更换手机后如何保留记录？', '请先在设置中导出 JSON 备份，并把文件存放在安全的位置。当前版本暂不支持直接导入恢复。'],
  ['为什么安装时会出现风险提示？', '梦潮目前通过 APK 提供下载。Android 可能要求你允许浏览器安装未知来源应用，请只从本站的版本链接下载。'],
  ['可以隐藏不想被别人看到的内容吗？', '可以。你能标记人物或私密片段，并在浏览时选择显示、隐去或使用化名。'],
];

function pageFromHash(): Page {
  const route = window.location.hash.replace(/^#\/?/, '').split('/')[0];
  return route === 'app' || route === 'features' || route === 'guide' ? 'app' : 'home';
}

function HomePage({ releaseState }: { releaseState: ReturnType<typeof useLatestRelease> }) {
  return (
    <>
      <Hero releaseState={releaseState} />
      <a className="discover-banner" href="#/app" aria-label="走进梦潮">
        <span className="discover-banner__index">不止是一眼 · 继续探索</span>
        <span className="discover-banner__title">走进梦潮</span>
        <span className="discover-banner__copy">
          看一场梦如何被留下，又在岁月里重新相遇
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
          <p className="eyebrow">深入梦潮</p>
          <h2 id="pathways-title"><span>从梦醒的一刻，</span><span>到多年后的再次相遇。</span></h2>
        </div>
        <div className="pathways__grid pathways__grid--single">
          <a className="path-card path-card--features" href="#/app">
            <span>DREAMTIDE · PRODUCT TOUR</span>
            <h3>看看梦潮如何留住一场梦</h3>
            <p>收下刚醒时的片段，让人物、情绪与隐秘各得其所；待年月流过，再循着档案与词云，与它不期而遇。</p>
            <strong>探索梦潮 <ArrowRight aria-hidden="true" size={18} /></strong>
          </a>
        </div>
      </section>

      <section className="manifesto" aria-labelledby="manifesto-title">
        <p className="eyebrow">为什么留下梦</p>
        <div>
          <h2 id="manifesto-title"><span>留住梦的原貌，</span><span>也听见它的回响。</span></h2>
          <p>梦潮先收下容易消散的细节。日后，当人物、情绪与年月再次交叠，梦里反复浮现的意象，也会渐渐有了轮廓。</p>
        </div>
        <span className="manifesto__glyph" aria-hidden="true">梦</span>
      </section>

      <section id="privacy" className="privacy-panel" aria-labelledby="privacy-title">
        <div><p className="eyebrow">本地优先</p><h2 id="privacy-title">你的梦，首先属于你。</h2></div>
        <div className="privacy-panel__copy">
          <p>梦境是很私人的内容。梦潮默认把数据留在你的设备中，不要求账号，也不把梦境交给云端。</p>
          <ul>
            <li><strong>不需要登录</strong><span>打开就能落笔</span></li>
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

      <a className="tutorial-gateway" href="#/app" aria-label="了解梦潮的功能与使用方法">
        <span className="tutorial-gateway__eyebrow">准备好迎接下一场梦了吗</span>
        <strong>从这里开始</strong>
        <span className="tutorial-gateway__action">
          趁余温未散落笔，循着年月与意象再次相逢
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

function AppPage({ releaseState }: { releaseState: ReturnType<typeof useLatestRelease> }) {
  return (
    <div className="subpage">
      <header className="subpage-hero">
        <p className="eyebrow">DREAMTIDE · INTO THE TIDE</p>
        <h1><span>从梦醒的一刻，</span><span>到再次遇见。</span></h1>
        <p>梦潮收下刚醒时的记忆，让人物、情绪与隐秘各得其所，也让散落在年月里的意象重新浮现。</p>
      </header>
      <section className="install-card" aria-labelledby="install-title">
        <div><span>GET STARTED</span><h2 id="install-title">下载并安装梦潮</h2></div>
        <div>
          <p>下载最新 APK，按照 Android 系统提示完成安装。首次安装时，系统可能要求允许浏览器安装未知来源应用。</p>
          <DownloadPanel state={releaseState} />
        </div>
      </section>
      <FeatureStory />
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
        {page === 'app' && <AppPage releaseState={releaseState} />}
      </main>
      <footer className="site-footer"><span>梦潮 Dreamtide</span><span>入梦 · 留痕 · 重逢</span></footer>
    </>
  );
}
