import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MediaFrame } from './MediaFrame';

describe('MediaFrame', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds an asset URL beneath the configured Vite base path', () => {
    render(
      <MediaFrame
        src="media/hero/home.webp"
        alt="梦潮首页截图"
        label="首页截图"
        eager
      />,
    );

    const image = screen.getByRole('img', { name: '梦潮首页截图' });
    expect(image).toHaveAttribute(
      'src',
      '/dreamtide-website/media/hero/home.webp',
    );
    expect(image).toHaveAttribute('loading', 'eager');
  });

  it('keeps an informative fixed-ratio fallback when media is missing', () => {
    render(
      <MediaFrame
        src="media/tutorial/01-install.gif"
        alt="安装梦潮步骤"
        label="01 · 下载与安装"
      />,
    );

    fireEvent.error(screen.getByRole('img', { name: '安装梦潮步骤' }));

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('01 · 下载与安装')).toBeVisible();
    expect(screen.getByText('媒体素材待补充')).toBeVisible();
  });

  it('renders an eager MP4 as an inline muted loop', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    const { container } = render(
      <MediaFrame
        src="media/首页.mp4"
        alt="梦潮首页操作演示"
        label="梦潮首页"
        eager
        portrait
      />,
    );

    const video = container.querySelector('video');
    expect(video).toHaveAttribute(
      'src',
      '/dreamtide-website/media/首页.mp4',
    );
    expect(video).toHaveAttribute('aria-label', '梦潮首页操作演示');
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(video).not.toHaveAttribute('controls');
    expect(video?.muted).toBe(true);
  });

  it('does not autoplay video when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const { container } = render(
      <MediaFrame
        src="media/词云.mp4"
        alt="词云回看演示"
        label="词云"
      />,
    );

    const video = container.querySelector('video');
    expect(video).not.toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('controls');
  });
});
