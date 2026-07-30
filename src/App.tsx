import { DownloadPanel } from './components/DownloadPanel';
import { FeatureStory } from './components/FeatureStory';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Tutorial } from './components/Tutorial';
import { useLatestRelease } from './hooks/useLatestRelease';

const values = [
  { mark: '01', title: '醒来就写', text: '用最短的路径接住刚醒时仍然鲜活的画面、人物和情绪。' },
  { mark: '02', title: '慢慢整理', text: '标签、注记和人物线索，让散落的梦逐渐长成一份私人档案。' },
  { mark: '03', title: '重新遇见', text: '从日历、筛选和词云出发，在某一天再次走进曾经的梦。' },
];

const faqs = [
  ['梦境会上传到服务器吗？', '不会。梦境与设置保存在当前设备，梦潮目前不提供云同步。'],
  ['更换手机后如何保留记录？', '请先在设置中导出 JSON 备份，并把文件存放在安全的位置。当前版本暂不支持直接导入恢复。'],
  ['为什么安装时会出现风险提示？', '梦潮目前通过 APK 提供下载。Android 可能要求你允许浏览器安装未知来源应用，请只从本站的版本链接下载。'],
  ['可以隐藏不想被别人看到的内容吗？', '可以。你能标记人物或私密片段，并在浏览时选择显示、隐去或使用化名。'],
];

export default function App() {
  const releaseState = useLatestRelease();

  return (
    <>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <Header />
      <main id="main-content">
        <div id="top" />
        <Hero releaseState={releaseState} />

        <section className="value-strip" aria-label="梦潮的三个特点">
          {values.map((item) => (
            <article className="value-card" key={item.mark}>
              <span>{item.mark}</span>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className="manifesto" aria-labelledby="manifesto-title">
          <p className="eyebrow">为什么记录梦</p>
          <div>
            <h2 id="manifesto-title">有些梦不需要被解释，<br />只值得被好好留下。</h2>
            <p>梦潮不急着给梦下定义。它更像一只放在床边的容器：先接住那些容易消散的细节，再把时间、人物与感受轻轻串起来。</p>
          </div>
          <span className="manifesto__glyph" aria-hidden="true">梦</span>
        </section>

        <FeatureStory />
        <Tutorial />

        <section id="privacy" className="privacy-panel" aria-labelledby="privacy-title">
          <div>
            <p className="eyebrow">本地优先</p>
            <h2 id="privacy-title">你的梦，首先属于你。</h2>
          </div>
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
            <h2 id="faq-title">开始之前，<br />你可能还想知道</h2>
          </div>
          <div className="faq__list">
            {faqs.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary>{question}<span aria-hidden="true">＋</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="download" className="download-cta" aria-labelledby="download-title">
          <p className="eyebrow">Android</p>
          <h2 id="download-title">下一场梦，<br />醒来就记下。</h2>
          <p>免费使用，无需注册。梦境与设置保存在当前设备，请记得定期导出备份。</p>
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
