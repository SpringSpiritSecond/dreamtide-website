import { useEffect, useRef, useState } from 'react';
import { DownloadPanel } from './components/DownloadPanel';
import { FeatureStory } from './components/FeatureStory';
import { Header } from './components/Header';
import { WatercolorTide } from './components/WatercolorTide';
import { LivingFoam } from './components/LivingFoam';
import { useLatestRelease } from './hooks/useLatestRelease';

type Route = 'home' | 'app' | 'features' | 'guide' | 'download';

function routeFromHash(): Route {
  const route = window.location.hash.replace(/^#\/?/, '').split('/')[0];
  return route === 'app' || route === 'features' || route === 'guide' || route === 'download' ? route : 'home';
}

function HomePage({ releaseState }: { releaseState: ReturnType<typeof useLatestRelease> }) {
  return <WatercolorTide releaseState={releaseState} />;
}

function AppPage({ releaseState }: { releaseState: ReturnType<typeof useLatestRelease> }) {
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    let locked = false;
    let unlock = 0;
    const slides = () => Array.from(deck.querySelectorAll<HTMLElement>('.subpage-hero, .install-card, .app-sections__intro, .app-section, .app-closing'));
    const turn = (direction: number) => {
      if (locked || !direction) return;
      const pages = slides();
      const current = Math.round(deck.scrollLeft / deck.clientWidth);
      const target = pages[Math.max(0, Math.min(pages.length - 1, current + direction))];
      if (!target || target === pages[current]) return;
      locked = true;
      deck.scrollTo({ left: target.offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      unlock = window.setTimeout(() => { locked = false; }, 620);
    };
    const onWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) < 4 || event.ctrlKey) return;
      const direction = Math.sign(delta);
      const article = (event.target as Element).closest<HTMLElement>('.app-section');
      if (article?.querySelector('.app-guide[open]')) {
        const canRead = direction > 0
          ? article.scrollTop < article.scrollHeight - article.clientHeight - 2
          : article.scrollTop > 2;
        if (canRead) return;
      }
      event.preventDefault();
      turn(direction);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest('.app-media-detail')) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, select, video, details[open]')) return;
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'PageDown' ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 0;
      if (!direction) return;
      event.preventDefault();
      turn(direction);
    };
    deck.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      deck.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      clearTimeout(unlock);
    };
  }, []);

  return (
    <div className="subpage">
      <div className="app-deck" ref={deckRef} aria-label="梦潮逐页介绍">
      <header className="subpage-hero">
        <LivingFoam mood="welcome" className="subpage-hero__foam" />
        <p className="eyebrow">DREAMTIDE · INTO THE TIDE</p>
        <h1><span>记录梦境，</span><span>随时回来看看。</span></h1>
        <p>在梦潮写下梦境、选择日期，保存后添加标签和注记；也能在观梦里按记录或词云重新找到它。</p>
      </header>
      <section className="install-card" aria-labelledby="install-title">
        <LivingFoam mood="install" className="app-screen__foam" />
        <div><span>GET STARTED</span><h2 id="install-title">下载并安装梦潮</h2></div>
        <div>
          <p>下载最新 APK，按照 Android 系统提示完成安装。首次安装时，系统可能要求允许浏览器安装未知来源应用。</p>
          <DownloadPanel state={releaseState} />
        </div>
      </section>
      <FeatureStory />
      <section className="app-closing" aria-labelledby="app-closing-title">
        <LivingFoam mood="finale" className="app-screen__foam" />
        <div>
          <p className="app-closing__kicker">把梦留在手边</p>
          <h2 id="app-closing-title">从下一场梦开始记录。</h2>
          <p>梦境记录只保存在当前设备，暂不提供云同步。建议定期在设置中导出备份，换设备前先保存自己的资料。</p>
        </div>
        <DownloadPanel state={releaseState} variant="footer" />
      </section>
      </div>
    </div>
  );
}

export default function App() {
  const releaseState = useLatestRelease();
  const [route, setRoute] = useState<Route>(routeFromHash);
  const page = route === 'home' ? 'home' : 'app';

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const next = routeFromHash();
      setRoute(next);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const selector = next === 'download' ? '.install-card' : next === 'guide' ? '.app-section' : next === 'features' ? '.app-sections__intro' : next === 'app' ? '.subpage-hero' : null;
        const deck = document.querySelector<HTMLElement>('.app-deck');
        const target = selector ? document.querySelector<HTMLElement>(selector) : null;
        if (deck && target) deck.scrollTo({ left: target.offsetLeft, behavior: 'instant' });
        else window.scrollTo({ top: 0, behavior: 'instant' });
      });
    };
    update();
    window.addEventListener('hashchange', update);
    return () => { window.removeEventListener('hashchange', update); cancelAnimationFrame(frame); };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        document.getElementById('main-content')?.focus();
      }}>跳到主要内容</a>
      <Header route={route} />
      <main id="main-content" tabIndex={-1}>
        {page === 'home' && <HomePage releaseState={releaseState} />}
        {page === 'app' && <AppPage releaseState={releaseState} />}
      </main>
      <footer className="site-footer"><span>梦潮 DreamTide</span><span>记录 · 整理 · 回看</span></footer>
    </>
  );
}
