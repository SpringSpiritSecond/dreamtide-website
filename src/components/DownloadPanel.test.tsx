import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DownloadPanel } from './DownloadPanel';

describe('DownloadPanel', () => {
  it('shows a direct APK link for a ready release', () => {
    render(
      <DownloadPanel
        state={{
          status: 'ready',
          release: {
            version: 'v0.3.0',
            downloadUrl: 'https://example.com/DreamTide.apk',
            fileName: 'DreamTide.apk',
            sizeLabel: '12.0 MB',
            publishedLabel: '2026年7月20日',
          },
        }}
      />,
    );

    expect(
      screen.getByRole('link', { name: /下载 Android 版/ }),
    ).toHaveAttribute('href', 'https://example.com/DreamTide.apk');
    expect(
      screen.getByRole('link', { name: /下载 Android 版/ }),
    ).toHaveAttribute('download', 'DreamTide.apk');
    expect(screen.getByRole('link', { name: '查看全部版本' })).toHaveClass(
      'version-link',
    );
    expect(screen.getByText(/v0.3.0/)).toBeVisible();
    expect(screen.getByText(/12.0 MB/)).toBeVisible();
  });

  it('shows loading feedback without inventing a version', () => {
    render(<DownloadPanel state={{ status: 'loading' }} />);

    expect(screen.getByText('正在读取最新版本')).toBeVisible();
    expect(screen.queryByText(/v\d/)).not.toBeInTheDocument();
  });

  it.each([
    ['request-failed', '暂时无法读取版本信息'],
    ['no-release', 'Android 版本正在准备中'],
    ['no-apk', '当前版本未找到 Android 安装包'],
  ] as const)('uses Releases fallback for %s', (reason, message) => {
    render(
      <DownloadPanel state={{ status: 'unavailable', reason }} />,
    );

    expect(screen.getByText(message)).toBeVisible();
    expect(screen.getByRole('link', { name: '查看全部版本' })).toHaveAttribute(
      'href',
      'https://github.com/SpringSpiritSecond/dreamtide-website/releases',
    );
    expect(screen.getByRole('link', { name: '查看全部版本' })).not.toHaveClass(
      'button',
    );
  });
});
