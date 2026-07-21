import { describe, expect, it, vi } from 'vitest';
import { formatBytes, loadLatestRelease } from './githubRelease';

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('loadLatestRelease', () => {
  it('returns the APK from the latest public release', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      response({
        tag_name: 'v0.3.0',
        published_at: '2026-07-20T00:00:00Z',
        assets: [
          {
            name: 'DreamTide-v0.3.0.apk',
            browser_download_url: 'https://example.com/app.apk',
            size: 12_582_912,
          },
        ],
      }),
    );

    await expect(loadLatestRelease(fetcher)).resolves.toEqual({
      status: 'ready',
      release: {
        version: 'v0.3.0',
        downloadUrl: 'https://example.com/app.apk',
        fileName: 'DreamTide-v0.3.0.apk',
        sizeLabel: '12.0 MB',
        publishedLabel: '2026年7月20日',
      },
    });
  });

  it('distinguishes a missing release from other request failures', async () => {
    await expect(
      loadLatestRelease(vi.fn().mockResolvedValue(response({}, 404))),
    ).resolves.toEqual({ status: 'unavailable', reason: 'no-release' });

    await expect(
      loadLatestRelease(vi.fn().mockResolvedValue(response({}, 500))),
    ).resolves.toEqual({ status: 'unavailable', reason: 'request-failed' });
  });

  it('reports a release that has no APK asset', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      response({
        tag_name: 'v0.3.0',
        published_at: '2026-07-20T00:00:00Z',
        assets: [{ name: 'notes.txt', browser_download_url: '#', size: 20 }],
      }),
    );

    await expect(loadLatestRelease(fetcher)).resolves.toEqual({
      status: 'unavailable',
      reason: 'no-apk',
    });
  });

  it('formats file sizes without false precision', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1_048_576)).toBe('1.0 MB');
  });
});
