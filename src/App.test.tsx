import { act, fireEvent, render, screen } from '@testing-library/react';
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

  it('routes all discovery links to one App page', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: '潮落有迹，梦醒留痕。' })).toBeInTheDocument();
    expect(document.querySelector('.discover-banner')).toHaveAttribute('href', '#/app');
    expect(screen.getByRole('link', { name: '了解梦潮的功能与使用方法' })).toHaveAttribute('href', '#/app');
    expect(document.querySelector('#site-navigation a[href="#/app"]')).toHaveTextContent('走进梦潮');
    expect(document.querySelector('a[href="#/features"], a[href="#/guide"]')).not.toBeInTheDocument();
    expect(document.querySelector('video[aria-label="梦潮首页与刻梦入口演示"]')).toBeInTheDocument();
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
    expect(document.querySelector('video[src$="/media/春梦了无痕.mp4"]')).toBeInTheDocument();
  });

  it('keeps installation and all guide content on the App page', () => {
    render(<App />);
    openPage('#/app');
    const install = screen.getByRole('heading', { name: '下载并安装梦潮' }).closest('section');
    expect(install?.querySelector('.download-panel')).toBeInTheDocument();
    expect(document.querySelectorAll('.app-guide')).toHaveLength(6);
    expect(document.querySelectorAll('.app-guide__group')).toHaveLength(10);
    expect(screen.getByRole('heading', { name: '个人账号与设置' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '“注”与 AI 释梦' })).toBeInTheDocument();

    const homeSection = document.querySelector('#app-section-01');
    const guide = homeSection?.querySelector('details');
    expect(guide).not.toHaveAttribute('open');
    fireEvent.click(homeSection!.querySelector('summary')!);
    expect(guide).toHaveAttribute('open');
  });
});
