import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MediaFrame } from './MediaFrame';

describe('MediaFrame', () => {
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
    expect(screen.getByText('截图 / GIF 待替换')).toBeVisible();
  });
});
