import { ArrowUpRight, Download } from 'lucide-react';
import { RELEASES_URL, type ReleaseState } from '../lib/githubRelease';

const unavailableCopy = {
  'request-failed': '暂时无法读取版本信息',
  'no-release': 'Android 版本正在准备中',
  'no-apk': '当前版本未找到 Android 安装包',
} as const;

export function DownloadPanel({ state, variant = 'hero' }: {
  state: ReleaseState; variant?: 'hero' | 'footer';
}) {
  return (
    <div className={`download-panel download-panel--${variant}`}>
      {state.status === 'ready' && <>
        <a className="button button--primary" href={state.release.downloadUrl}>
          <Download aria-hidden="true" size={18} />下载 Android 版
        </a>
        <p className="release-meta">{state.release.version} · {state.release.sizeLabel} · {state.release.publishedLabel}</p>
      </>}
      {state.status === 'loading' && <>
        <span className="button button--primary button--loading" aria-live="polite">
          <span className="loading-dot" aria-hidden="true" />正在读取最新版本
        </span>
        <a className="text-link" href={RELEASES_URL}>查看全部版本 <ArrowUpRight aria-hidden="true" size={15} /></a>
      </>}
      {state.status === 'unavailable' && <>
        <p className="release-message" role="status">{unavailableCopy[state.reason]}</p>
        <a className="button button--secondary" href={RELEASES_URL}>查看全部版本 <ArrowUpRight aria-hidden="true" size={17} /></a>
      </>}
    </div>
  );
}
