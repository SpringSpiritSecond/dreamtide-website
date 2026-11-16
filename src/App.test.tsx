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
    expect(document.querySelectorAll('.wash-lens')).toHaveLength(10);
    expect(document.querySelectorAll('.wash-shot')).toHaveLength(15);
    expect(document.querySelector('.watercolor-tide img[src*="/media/"]:not([src*="/media/app/"])')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /前往/ })).toHaveLength(8);
    expect(screen.getByRole('button', { name: '前往梦潮' })).toHaveAttribute('aria-current', 'step');
    expect(document.querySelector('#site-navigation a[href="#/features"]')).toHaveTextContent('功能');
    expect(document.querySelector('#site-navigation a[href="#/download"]')).toHaveTextContent('下载');
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
    expect(screen.getByRole('link', { name: /下载 Android 版/ })).toHaveAttribute('href', '#/download');
    expect(screen.getByRole('link', { name: /功能与使用说明/ })).toHaveAttribute('href', '#/app');
    expect(document.querySelector('.watercolor-tide')).not.toHaveTextContent(/GitHub|Release|安装包/);
  });

  it('shows one block per App area and only uses galleries for multiple media', () => {
    render(<App />);
    openPage('#/app');
    expect(document.querySelectorAll('.app-section')).toHaveLength(7);
    expect(document.querySelectorAll('.app-section__media--single')).toHaveLength(1);
    expect(document.querySelectorAll('.app-section__gallery')).toHaveLength(6);
    expect(screen.getAllByRole('tab')).toHaveLength(24);
    expect(document.querySelectorAll('.app-section__media img')).toHaveLength(7);
    expect(document.querySelector('.app-section__media video')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /恢复暂存/ }));
    expect(document.querySelector('img[src$="/media/app/write-restore.webp"]')).toBeInTheDocument();
  });

  it('opens a styled image and explanation page from an App screenshot', () => {
    render(<App />);
    openPage('#/app');
    fireEvent.click(screen.getByRole('button', { name: '展开空白页图文说明' }));
    const detail = screen.getByRole('dialog', { name: '刻梦书写页图文说明' });
    expect(detail).toHaveTextContent('趁细节还清晰，写下梦境正文');
    expect(detail.querySelector('img')).toHaveAttribute('src', '/dreamtide-website/media/app/write-blank.webp');
    fireEvent.click(screen.getByRole('button', { name: '返回刻梦书写页' }));
    expect(screen.queryByRole('dialog', { name: '刻梦书写页图文说明' })).not.toBeInTheDocument();
  });

  it('keeps installation and all guide content on the App page', () => {
    render(<App />);
    openPage('#/app');
    const install = screen.getByRole('heading', { name: '下载并安装梦潮' }).closest('section');
    expect(install?.querySelector('.download-panel')).toBeInTheDocument();
    expect(document.querySelectorAll('.app-guide')).toHaveLength(7);
    expect(document.querySelectorAll('.app-guide__group')).toHaveLength(11);
    expect(screen.getByRole('heading', { name: '「我的」面板' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '「注记」与 AI 释梦' })).toBeInTheDocument();

    const homeSection = document.querySelector('#app-section-01');
    const guide = homeSection?.querySelector('details');
    expect(guide).not.toHaveAttribute('open');
    fireEvent.click(homeSection!.querySelector('summary')!);
    expect(guide).toHaveAttribute('open');
  });

  it('skips to App content without changing the hash route', () => {
    render(<App />);
    openPage('#/app');
    fireEvent.click(screen.getByRole('link', { name: '跳到主要内容' }));
    expect(window.location.hash).toBe('#/app');
    expect(document.activeElement).toBe(document.getElementById('main-content'));
    expect(document.querySelector('.app-deck')).toBeInTheDocument();
  });
});
