export const RELEASES_URL =
  'https://github.com/SpringSpiritSecond/dreamtide-website/releases';
export const LATEST_RELEASE_API =
  'https://api.github.com/repos/SpringSpiritSecond/dreamtide-website/releases/latest';
// The deploy copies the latest APK into the site (scripts/bundle-latest-apk.mjs), so it downloads from the
// site's own address with one click and without the GitHub API's per-visitor rate limit.
export const BUNDLED_APK_URL = `${import.meta.env.BASE_URL}download/DreamTide.apk`;
export const BUNDLED_INFO_URL = `${import.meta.env.BASE_URL}download/latest.json`;

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

const dateLabel = (value: unknown) => {
  const date = typeof value === 'string' ? new Date(value) : null;
  return date && !Number.isNaN(date.valueOf())
    ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date)
    : '最近发布';
};

type BundledInfo = { version?: unknown; fileName?: unknown; size?: unknown; publishedAt?: unknown };

/** The APK copied into the site at deploy time, if there is one. */
async function loadBundledRelease(fetcher: typeof fetch): Promise<ResolvedReleaseState | null> {
  try {
    const response = await fetcher(BUNDLED_INFO_URL, { cache: 'no-cache' });
    if (!response.ok) return null;
    const info = (await response.json()) as BundledInfo;
    if (typeof info.fileName !== 'string' || typeof info.size !== 'number') return null;
    return {
      status: 'ready',
      release: {
        version: typeof info.version === 'string' ? info.version : '最新版',
        downloadUrl: BUNDLED_APK_URL,
        fileName: info.fileName,
        sizeLabel: formatBytes(info.size),
        publishedLabel: dateLabel(info.publishedAt),
      },
    };
  } catch {
    return null;
  }
}

export async function loadLatestRelease(
  fetcher: typeof fetch = fetch,
): Promise<ResolvedReleaseState> {
  const bundled = await loadBundledRelease(fetcher);
  if (bundled) return bundled;
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

    return {
      status: 'ready',
      release: {
        version:
          typeof payload.tag_name === 'string' ? payload.tag_name : '最新版',
        downloadUrl: apk.browser_download_url,
        fileName: apk.name,
        sizeLabel: formatBytes(apk.size),
        publishedLabel: dateLabel(payload.published_at),
      },
    };
  } catch {
    return { status: 'unavailable', reason: 'request-failed' };
  }
}
