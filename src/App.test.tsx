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
    expect(document.querySelector('.wash-shot img')).toHaveAttribute('src', '/dreamtide-website/media/刻梦.jpg');
    expect(screen.getAllByRole('button', { name: /前往/ })).toHaveLength(6);
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

  it('shows and hides the steps for a screenshot', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '前往刻梦' }));
    fireEvent.click(screen.getByRole('button', { name: '展开写下梦境说明' }));
    expect(screen.getByText('写下梦境正文。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '收起写下梦境说明' })).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: '收起写下梦境说明' }));
    await waitFor(() => expect(screen.queryByText('写下梦境正文。')).not.toBeInTheDocument());
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
    expect(document.querySelectorAll('.app-section')).toHaveLength(6);
    expect(document.querySelectorAll('.app-section__media--single')).toHaveLength(4);
    expect(document.querySelectorAll('.app-section__gallery')).toHaveLength(2);
    expect(screen.getAllByRole('tab')).toHaveLength(6);
    expect(document.querySelectorAll('.app-section__media img, .app-section__media video')).toHaveLength(6);
    fireEvent.click(screen.getByRole('tab', { name: /春梦了无痕/ }));
    expect(document.querySelector('video[src$="/media/春梦了无痕-web.mp4"]')).toBeInTheDocument();
  });

  it('opens a styled image and explanation page from an App screenshot', () => {
    render(<App />);
    openPage('#/app');
    fireEvent.click(screen.getByRole('button', { name: '展开刻梦书写图文说明' }));
    const detail = screen.getByRole('dialog', { name: '刻梦书写页图文说明' });
    expect(detail).toHaveTextContent('趁细节还清晰，写下梦境正文');
    expect(detail.querySelector('img')).toHaveAttribute('src', '/dreamtide-website/media/刻梦.jpg');
    fireEvent.click(screen.getByRole('button', { name: '返回刻梦书写页' }));
    expect(screen.queryByRole('dialog', { name: '刻梦书写页图文说明' })).not.toBeInTheDocument();
  });

  it('keeps installation and all guide content on the App page', () => {
    render(<App />);
    openPage('#/app');
    const install = screen.getByRole('heading', { name: '下载并安装梦潮' }).closest('section');
    expect(install?.querySelector('.download-panel')).toBeInTheDocument();
    expect(document.querySelectorAll('.app-guide')).toHaveLength(6);
    expect(document.querySelectorAll('.app-guide__group')).toHaveLength(11);
    expect(screen.getByRole('heading', { name: '个人账号与设置' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '“注”与 AI 释梦' })).toBeInTheDocument();

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
