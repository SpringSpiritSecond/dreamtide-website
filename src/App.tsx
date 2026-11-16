import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { WatercolorTide } from './components/WatercolorTide';
import { useLatestRelease } from './hooks/useLatestRelease';

// The site is one page. Links to the old features and download pages still land somewhere useful:
// #/download opens on the download chapter, any other address on the first chapter.
const OLD_PAGES = ['app', 'features', 'guide', 'download'];
const chapterFromHash = () => {
  const route = window.location.hash.replace(/^#\/?/, '').split('/')[0];
  // An old page address opens this page; drop it from the address bar so it doesn't look like another page.
  if (OLD_PAGES.includes(route)) window.history.replaceState(null, '', window.location.pathname + window.location.search);
  return route === 'download' ? 'download' : null;
};

export default function App() {
  const releaseState = useLatestRelease();
  const [jump, setJump] = useState(() => ({ chapter: chapterFromHash(), id: 0 }));

  useEffect(() => {
    // Only an address that names a chapter moves the page; anything else leaves the reader where they are.
    const update = () => {
      const chapter = chapterFromHash();
      if (chapter) setJump((current) => ({ chapter, id: current.id + 1 }));
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        document.getElementById('main-content')?.focus();
      }}>跳到主要内容</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <WatercolorTide releaseState={releaseState} startAt={jump.chapter} jumpId={jump.id} />
      </main>
    </>
  );
}
