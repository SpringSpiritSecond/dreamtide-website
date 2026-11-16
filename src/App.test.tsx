import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./hooks/useLatestRelease', () => ({
  useLatestRelease: () => ({ status: 'unavailable', reason: 'no-release' }),
}));

function openPage(route: string) {
  act(() => {
    window.location.hash = route;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

describe('App', () => {
  beforeEach(() => { window.location.hash = '#/'; });

  it('opens on the watercolour home with six chapters and the real App screenshots', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: '梦醒以后，仍有迹可循' })).toBeInTheDocument();
    expect(document.querySelector('.watercolor-tide .wash-canvas')).toBeInTheDocument();
    expect(document.querySelector('.wash-shot.has-frame img')).toHaveAttribute('src', '/dreamtide-website/media/app/home-cluster.webp');
    expect(document.querySelectorAll('.wash-lens')).toHaveLength(5);
    expect(document.querySelectorAll('.wash-shot')).toHaveLength(12);
    expect(document.querySelector('.watercolor-tide img[src*="/media/"]:not([src*="/media/app/"])')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /前往/ })).toHaveLength(6);
    expect(document.querySelector('.watercolor-tide')).not.toHaveTextContent(/手机里|这台设备|本地/);
    expect(screen.getByRole('button', { name: '前往梦潮' })).toHaveAttribute('aria-current', 'step');
    expect(document.querySelector('.site-header a[href="#/"]')).toHaveTextContent('梦潮');
    expect(document.querySelector('#site-navigation')).not.toBeInTheDocument();
  });

  it('moves to the next chapter when scrolling down', async () => {
    render(<App />);
    fireEvent.wheel(document.querySelector('.wash-stage')!, { deltaY: 100 });
    await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: '刻梦' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: '前往刻梦' })).toHaveAttribute('aria-current', 'step');
  });

  it('turns only one page for a single trackpad swipe', async () => {
    render(<App />);
    const stage = document.querySelector('.wash-stage')!;
    for (let i = 0; i < 12; i++) fireEvent.wheel(stage, { deltaY: 40 });
    await waitFor(() => expect(screen.getByRole('button', { name: '前往刻梦' })).toHaveAttribute('aria-current', 'step'));
  });

  it('shows and hides the steps for a screenshot', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '前往刻梦' }));
    fireEvent.click(screen.getByRole('button', { name: '展开刻梦说明 · 写到一半' }));
    expect(screen.getByText('写下梦境正文，选好梦发生的日期。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '收起刻梦说明 · 写到一半' })).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: '收起刻梦说明 · 恢复暂存' }));
    await waitFor(() => expect(screen.queryByText('写下梦境正文，选好梦发生的日期。')).not.toBeInTheDocument());
  });

  it('links the download chapter somewhere useful without naming where the file is hosted', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '前往下载' }));
    expect(screen.getByRole('link', { name: /下载 Android 版/ })).toHaveAttribute('href', 'https://github.com/SpringSpiritSecond/dreamtide-website/releases');
    expect(screen.queryByRole('link', { name: /功能与使用说明/ })).not.toBeInTheDocument();
    expect(document.querySelector('.watercolor-tide')).not.toHaveTextContent(/GitHub|Release|安装包/);
  });

  it('opens on the download chapter from an old download link', () => {
    window.location.hash = '#/download';
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: '下载梦潮' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '前往下载' })).toHaveAttribute('aria-current', 'step');
    expect(window.location.hash).toBe('');
  });

  it('shows the home page for the old features and guide addresses', () => {
    for (const route of ['#/app', '#/features', '#/guide']) {
      window.location.hash = route;
      const { unmount } = render(<App />);
      expect(screen.getByRole('heading', { level: 1, name: '梦醒以后，仍有迹可循' })).toBeInTheDocument();
      expect(document.querySelector('.app-deck')).not.toBeInTheDocument();
      expect(window.location.hash).toBe('');
      unmount();
    }
  });

  it('follows a link to the download chapter while the page is open', async () => {
    render(<App />);
    openPage('#/download');
    await waitFor(() => expect(screen.getByRole('button', { name: '前往下载' })).toHaveAttribute('aria-current', 'step'));
  });

  it('skips to the page content without changing the address', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('link', { name: '跳到主要内容' }));
    expect(window.location.hash).toBe('#/');
    expect(document.activeElement).toBe(document.getElementById('main-content'));
  });
});
