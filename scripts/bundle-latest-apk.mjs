// Copies the APK from this repository's latest public release into the built site, so the download button
// can serve it from the site's own address: one click downloads straight away, with no GitHub API call
// (and its rate limit) in the visitor's browser.
//
// Usage: node scripts/bundle-latest-apk.mjs <dist dir>
// Writes <dist>/download/DreamTide.apk and <dist>/download/latest.json. If there is no release with an APK,
// it writes nothing and the site falls back to reading the GitHub API in the browser.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = process.argv[2] ?? 'dist';
const repo = process.env.GITHUB_REPOSITORY ?? 'SpringSpiritSecond/dreamtide-website';
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'dreamtide-website-deploy' };
if (process.env.GH_TOKEN) headers.Authorization = `Bearer ${process.env.GH_TOKEN}`;

const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers });
if (!response.ok) {
  console.warn(`No latest release to bundle (${response.status}); the site will read the GitHub API instead.`);
  process.exit(0);
}
const release = await response.json();
const apk = (release.assets ?? []).find((asset) => typeof asset.name === 'string' && asset.name.toLowerCase().endsWith('.apk'));
if (!apk) {
  console.warn(`Release ${release.tag_name} has no APK; the site will read the GitHub API instead.`);
  process.exit(0);
}

const file = await fetch(apk.browser_download_url, { headers: { 'User-Agent': headers['User-Agent'] } });
if (!file.ok) throw new Error(`Could not download ${apk.name}: ${file.status}`);
const bytes = Buffer.from(await file.arrayBuffer());
if (bytes.length !== apk.size) throw new Error(`${apk.name} is ${bytes.length} bytes, expected ${apk.size}`);

const dir = path.join(dist, 'download');
await mkdir(dir, { recursive: true });
await writeFile(path.join(dir, 'DreamTide.apk'), bytes);
await writeFile(path.join(dir, 'latest.json'), JSON.stringify({
  version: release.tag_name,
  fileName: apk.name,
  size: apk.size,
  publishedAt: release.published_at,
}, null, 2));
console.log(`Bundled ${apk.name} (${release.tag_name}, ${apk.size} bytes) into ${dir}`);
