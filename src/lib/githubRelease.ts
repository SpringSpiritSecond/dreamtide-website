export const RELEASES_URL =
  'https://github.com/SpringSpiritSecond/dreamtide-website/releases';
export const LATEST_RELEASE_API =
  'https://api.github.com/repos/SpringSpiritSecond/dreamtide-website/releases/latest';

export type PublicRelease = {
  version: string;
  downloadUrl: string;
  fileName: string;
  sizeLabel: string;
  publishedLabel: string;
};

export type ReleaseUnavailableReason =
  | 'request-failed'
  | 'no-release'
  | 'no-apk';

export type ResolvedReleaseState =
  | { status: 'ready'; release: PublicRelease }
  | { status: 'unavailable'; reason: ReleaseUnavailableReason };

export type ReleaseState = { status: 'loading' } | ResolvedReleaseState;

type GithubAsset = {
  name?: unknown;
  browser_download_url?: unknown;
  size?: unknown;
};

type GithubRelease = {
  tag_name?: unknown;
  published_at?: unknown;
  assets?: unknown;
};

type ApkAsset = {
  name: string;
  browser_download_url: string;
  size: number;
};

export function formatBytes(bytes: number) {
  if (bytes <= 0) return '0 B';
  if (bytes < 1_048_576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function isApkAsset(asset: GithubAsset): asset is ApkAsset {
  return (
    typeof asset.name === 'string' &&
    asset.name.toLowerCase().endsWith('.apk') &&
    typeof asset.browser_download_url === 'string' &&
    typeof asset.size === 'number'
  );
}

export async function loadLatestRelease(
  fetcher: typeof fetch = fetch,
): Promise<ResolvedReleaseState> {
  try {
    const response = await fetcher(LATEST_RELEASE_API, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (response.status === 404) {
      return { status: 'unavailable', reason: 'no-release' };
    }
    if (!response.ok) {
      return { status: 'unavailable', reason: 'request-failed' };
    }

    const payload = (await response.json()) as GithubRelease;
    const assets = Array.isArray(payload.assets)
      ? (payload.assets as GithubAsset[])
      : [];
    const apk = assets.find(isApkAsset);

    if (!apk) {
      return { status: 'unavailable', reason: 'no-apk' };
    }

    const date =
      typeof payload.published_at === 'string'
        ? new Date(payload.published_at)
        : null;

    return {
      status: 'ready',
      release: {
        version:
          typeof payload.tag_name === 'string' ? payload.tag_name : '最新版',
        downloadUrl: apk.browser_download_url,
        fileName: apk.name,
        sizeLabel: formatBytes(apk.size),
        publishedLabel:
          date && !Number.isNaN(date.valueOf())
            ? new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              }).format(date)
            : '最近发布',
      },
    };
  } catch {
    return { status: 'unavailable', reason: 'request-failed' };
  }
}
