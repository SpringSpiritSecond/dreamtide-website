import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./hooks/useLatestRelease', () => ({
  useLatestRelease: () => ({ status: 'unavailable', reason: 'no-release' }),
}));

describe('App', () => {
  it('introduces Dreamtide and exposes the primary page landmarks', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '潮落有迹，梦醒留痕',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('presents the four real product capabilities and tutorial steps', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: '把散落的片段，慢慢收回来',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '趁记忆还清晰，写下梦' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '梦留在你的设备里' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '从写下第一场梦开始' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('uses every supplied product media asset', () => {
    const { container } = render(<App />);
    const sources = Array.from(
      container.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
        'img, video',
      ),
      (element) => decodeURI(element.getAttribute('src') ?? ''),
    );

    for (const filename of [
      '首页.mp4',
      '不谈人间事.mp4',
      '春梦了无痕.mp4',
      '编辑-隐.jpg',
      '档案.jpg',
      '档案 筛选.jpg',
      '档案 正文.mp4',
      '词云.mp4',
      '分享.png',
    ]) {
      expect(
        sources.some((src) => src.endsWith(`/media/${filename}`)),
      ).toBe(true);
    }
  });
});
