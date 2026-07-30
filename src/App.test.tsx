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

  it('uses real product media and repeats prominent discovery routes', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: '潮落有迹，梦醒留痕。' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '深入了解梦潮的完整功能' })).toHaveAttribute('href', '#/features');
    expect(screen.getByRole('link', { name: '进入梦潮完整使用教程' })).toHaveAttribute('href', '#/guide');
    expect(screen.getByRole('link', { name: /浏览全部功能/ })).toHaveAttribute('href', '#/features');
    expect(screen.getByRole('link', { name: /打开使用指南/ })).toHaveAttribute('href', '#/guide');
    expect(screen.queryByRole('heading', { name: '写下并保存一场梦' })).not.toBeInTheDocument();
    expect(document.querySelector('video[aria-label="梦潮首页与刻梦入口演示"]')).toBeInTheDocument();
  });

  it('uses one switchable gallery without repeating feature images', () => {
    render(<App />);
    openPage('#/features');
    expect(screen.getAllByRole('tab')).toHaveLength(9);
    expect(document.querySelectorAll('.product-gallery__stage img, .product-gallery__stage video')).toHaveLength(1);
    expect(document.querySelectorAll('.feature-card img, .feature-card video')).toHaveLength(0);
    fireEvent.click(screen.getByRole('tab', { name: /词云回看/ }));
    expect(document.querySelector('video[src$="/media/词云.mp4"]')).toBeInTheDocument();
  });

  it('uses a download control and a detailed text-only guide', () => {
    render(<App />);
    openPage('#/guide');
    const install = screen.getByRole('heading', { name: '下载并安装梦潮' }).closest('section');
    expect(install?.querySelector('.download-panel')).toBeInTheDocument();
    expect(install?.querySelector('img, video')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.guide-page')).toHaveLength(10);
    expect(screen.getByRole('heading', { name: '“注”与 AI 释梦' })).toBeInTheDocument();
    expect(document.querySelector('.detailed-guide img, .detailed-guide video')).not.toBeInTheDocument();
  });
});
