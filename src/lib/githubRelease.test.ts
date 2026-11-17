import { describe, expect, it, vi } from 'vitest';
import { BUNDLED_APK_URL, BUNDLED_INFO_URL, formatBytes, loadLatestRelease } from './githubRelease';

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// A site without a bundled APK: the bundled info file is missing, the GitHub API answers.
const apiOnly = (body: unknown, status = 200) =>
  vi.fn((url: RequestInfo | URL) => Promise.resolve(url === BUNDLED_INFO_URL ? response({}, 404) : response(body, status)));

describe('loadLatestRelease', () => {
  it('returns the APK from the latest public release', async () => {
    const fetcher = apiOnly({
      tag_name: 'v0.3.0',
      published_at: '2026-07-20T00:00:00Z',
      assets: [
        {
          name: 'DreamTide-v0.3.0.apk',
          browser_download_url: 'https://example.com/app.apk',
          size: 12_582_912,
        },
      ],
    });

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
      loadLatestRelease(apiOnly({}, 404)),
    ).resolves.toEqual({ status: 'unavailable', reason: 'no-release' });

    await expect(
      loadLatestRelease(apiOnly({}, 500)),
    ).resolves.toEqual({ status: 'unavailable', reason: 'request-failed' });
  });

  it('reports a release that has no APK asset', async () => {
    const fetcher = apiOnly({
      tag_name: 'v0.3.0',
      published_at: '2026-07-20T00:00:00Z',
      assets: [{ name: 'notes.txt', browser_download_url: '#', size: 20 }],
    });

    await expect(loadLatestRelease(fetcher)).resolves.toEqual({
      status: 'unavailable',
      reason: 'no-apk',
    });
  });

  it('prefers the APK copied into the site, so a click downloads from the site itself', async () => {
    const fetcher = vi.fn((url: RequestInfo | URL) => Promise.resolve(url === BUNDLED_INFO_URL
      ? response({ version: 'v0.4.0', fileName: 'DreamTide-v0.4.0.apk', size: 3_700_256, publishedAt: '2026-11-16T03:17:05Z' })
      : response({}, 500)));

    await expect(loadLatestRelease(fetcher)).resolves.toEqual({
      status: 'ready',
      release: {
        version: 'v0.4.0',
        downloadUrl: BUNDLED_APK_URL,
        fileName: 'DreamTide-v0.4.0.apk',
        sizeLabel: '3.5 MB',
        publishedLabel: '2026年11月16日',
      },
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('formats file sizes without false precision', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1_048_576)).toBe('1.0 MB');
  });
});
