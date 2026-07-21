# DreamTide Release Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish each App GitHub Release to the public website repository, expose one public release manifest, and make both the website and App consume it.

**Architecture:** The App repository handles `release.published`, downloads its own APK with the repository `GITHUB_TOKEN`, mirrors the APK and Release metadata to the public website with a repository-scoped token, then commits `public/releases.json`. The website and App only read that public JSON; neither receives credentials for the private App repository.

**Tech Stack:** GitHub Actions, GitHub CLI, jq, React, TypeScript, Vite, Vitest, pnpm.

## Global Constraints

- Do not modify the website's existing uncommitted `README.md` or `COMMITS.md`.
- Do not modify website layout, copy, images, or videos.
- Do not expose `WEB_REPO_TOKEN` in source, build variables, JSON, or logs.
- `WEB_REPO_TOKEN` may access only `SpringSpiritSecond/dreamtide-website` with `Contents: Read and write`.
- Do not create local Git commits or push either development checkout unless the user separately requests it.
- The runtime workflow commit message must be `Sync DreamTide release <tag>`.
- The public APK must be hosted in the website repository's GitHub Release, because private repository assets cannot be downloaded anonymously.

## File Map

### App repository (`SpringSpiritSecond/dreamtide`)

- Create `.github/workflows/sync-release-to-web.yml`: mirror one published Release and commit the manifest.
- Create `src/lib/releaseManifest.ts`: validate manifest data and compare versions.
- Create `src/lib/releaseManifest.test.ts`: specify valid, invalid, newer, and equal-version behavior.
- Modify `src/App.tsx`: use package version and the public manifest in the existing version dialog.
- Modify `src/styles.css`: style release notes in the existing dialog only if existing classes are insufficient.
- Modify `package.json`: add the Vitest test command and dependency.
- Modify `pnpm-lock.yaml`: lock the installed test dependency.

### Website repository (`SpringSpiritSecond/dreamtide-website`)

- Create `public/releases.json`: bootstrap the public manifest from the existing mirrored `v0.2.1` Release.
- Modify `src/lib/githubRelease.ts`: load and validate the public manifest instead of GitHub's API.
- Modify `src/lib/githubRelease.test.ts`: specify manifest mapping and malformed-manifest behavior.
- Modify `docs/releasing.md`: document the automated private-to-public release path and Secret setup.

---

### Task 1: Establish Website Manifest Contract

**Files:**
- Create: `public/releases.json`
- Modify: `src/lib/githubRelease.test.ts`
- Modify: `src/lib/githubRelease.ts`

**Interfaces:**
- Consumes: `${import.meta.env.BASE_URL}releases.json`
- Produces: existing `ResolvedReleaseState` consumed by `useLatestRelease`
- Manifest fields: `latest_version`, `name`, `release_notes`, `published_at`, `download_url`, `file_name`, `file_size`, `updated_at`

- [ ] **Step 1: Replace API-shaped tests with manifest-shaped failing tests**

Add a successful response using:

```ts
{
  latest_version: 'v0.2.1',
  name: 'DreamTide v0.2.1',
  release_notes: '修复与改进',
  published_at: '2026-07-20T15:57:23Z',
  download_url:
    'https://github.com/SpringSpiritSecond/dreamtide-website/releases/download/v0.2.1/DreamTide-v0.2.1.apk',
  file_name: 'DreamTide-v0.2.1.apk',
  file_size: 4_847_264,
  updated_at: '2026-07-20T15:57:23Z',
}
```

Assert mapping to the existing `PublicRelease` shape. Add cases for HTTP 404, HTTP 500, missing `download_url`, and invalid field types.

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```powershell
corepack pnpm test:run -- src/lib/githubRelease.test.ts
```

Expected: failure because the loader still expects GitHub API `assets`.

- [ ] **Step 3: Implement strict manifest validation**

Set:

```ts
export const RELEASE_MANIFEST_URL = `${import.meta.env.BASE_URL}releases.json`;
```

Keep `RELEASES_URL` as the website repository Releases page. Validate required string fields and a finite non-negative `file_size`. Return:

```ts
{
  status: 'ready',
  release: {
    version: manifest.latest_version,
    downloadUrl: manifest.download_url,
    fileName: manifest.file_name,
    sizeLabel: formatBytes(manifest.file_size),
    publishedLabel: formatPublishedDate(manifest.published_at),
  },
}
```

Treat a 404 as `no-release`, malformed JSON or fields as `request-failed`, and an empty download URL as `no-apk`.

- [ ] **Step 4: Bootstrap `public/releases.json`**

Write the existing `v0.2.1` source metadata and the website Release asset URL:

```json
{
  "latest_version": "v0.2.1",
  "name": "DreamTide v0.2.1",
  "release_notes": "# DreamTide v0.2.1\n\n这是 DreamTide v0.2.1 正式版，结束此前的分享功能测试标识。\n\n## 本次更新\n\n- 新增隐私感知的梦境长图生成、预览、保存与 Android 系统分享。\n- 修复分享图片文字空白与画布预览空白问题。\n- 更新并修复 Android 普通、圆形和自适应应用图标。\n- 修复 Android 返回键导航、编辑保存操作和应用内返回导航。\n- 保持梦境内容、设置和 API Key 的本地优先与安全存储策略。\n\n## 安装\n\n下载 `DreamTide-v0.2.1.apk` 后在 Android 设备上安装。升级前建议先在应用中导出本地备份。\n\n> APK 由 GitHub Actions 从 `v0.2.1` 对应源码构建。请勿从非项目发布页下载未知来源的安装包。\n",
  "published_at": "2026-07-20T15:57:23Z",
  "download_url": "https://github.com/SpringSpiritSecond/dreamtide-website/releases/download/v0.2.1/DreamTide-v0.2.1.apk",
  "file_name": "DreamTide-v0.2.1.apk",
  "file_size": 4847264,
  "updated_at": "2026-07-20T15:57:23Z"
}
```

- [ ] **Step 5: Run website verification**

Run:

```powershell
corepack pnpm test:run -- src/lib/githubRelease.test.ts
corepack pnpm lint
corepack pnpm build
```

Expected: all commands exit `0`.

### Task 2: Add App Manifest Parsing with TDD

**Files:**
- Create: `src/lib/releaseManifest.test.ts`
- Create: `src/lib/releaseManifest.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces: `ReleaseManifest`
- Produces: `parseReleaseManifest(value: unknown): ReleaseManifest`
- Produces: `compareVersions(left: string, right: string): number`
- Produces: `normalizeVersion(value: string): string`

- [ ] **Step 1: Prepare an isolated App checkout**

Clone `SpringSpiritSecond/dreamtide` into a separate sibling working directory. Do not change the website working tree for App files.

- [ ] **Step 2: Add Vitest through pnpm**

Run:

```powershell
corepack pnpm add -D vitest
```

Add:

```json
"test:run": "vitest run"
```

- [ ] **Step 3: Write the failing parser and comparison tests**

Tests must assert:

```ts
expect(parseReleaseManifest(validManifest)).toEqual(validManifest);
expect(() => parseReleaseManifest({ ...validManifest, download_url: '' })).toThrow();
expect(compareVersions('v0.3.0', '0.2.1')).toBeGreaterThan(0);
expect(compareVersions('v0.2.1', '0.2.1')).toBe(0);
expect(compareVersions('v0.2.0', '0.2.1')).toBeLessThan(0);
```

- [ ] **Step 4: Run the focused test and confirm RED**

Run:

```powershell
corepack pnpm test:run -- src/lib/releaseManifest.test.ts
```

Expected: failure because `releaseManifest.ts` does not exist.

- [ ] **Step 5: Implement the parser and version comparison**

Define:

```ts
export type ReleaseManifest = {
  latest_version: string;
  name: string;
  release_notes: string;
  published_at: string;
  download_url: string;
  file_name: string;
  file_size: number;
  updated_at: string;
};
```

Reject missing or empty required strings, invalid dates, non-HTTP(S) download URLs, and negative/non-finite sizes. Strip one leading `v` before numeric version comparison.

- [ ] **Step 6: Run the focused test and confirm GREEN**

Run:

```powershell
corepack pnpm test:run -- src/lib/releaseManifest.test.ts
```

Expected: all manifest tests pass.

### Task 3: Connect the Existing App Update Dialog

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css` only if required

**Interfaces:**
- Consumes: `package.json.version`
- Consumes: `https://springspiritsecond.github.io/dreamtide-website/releases.json`
- Consumes: `parseReleaseManifest` and `compareVersions`

- [ ] **Step 1: Import the current version and manifest helpers**

Use:

```ts
import packageJson from '../package.json';
import {
  compareVersions,
  parseReleaseManifest,
  type ReleaseManifest,
} from './lib/releaseManifest';
```

Set:

```ts
const APP_VERSION = packageJson.version;
const VERSION_MANIFEST_URL =
  'https://springspiritsecond.github.io/dreamtide-website/releases.json';
```

Remove the obsolete Git URL, obsolete package manifest URL, hardcoded `0.1.0`, and the duplicate local `compareVersions`.

- [ ] **Step 2: Store and validate the complete manifest**

Replace the `latestVersion` state with:

```ts
const [latestRelease, setLatestRelease] =
  useState<ReleaseManifest | null>(null);
```

In `checkForUpdates`, parse the response with `parseReleaseManifest`, compare `latest_version` with `APP_VERSION`, and preserve existing offline, timeout, silent-check, and local-use feedback.

- [ ] **Step 3: Update the existing version dialog**

Show:

- `当前版本 v${APP_VERSION}`
- latest version from `latestRelease.latest_version`
- `latestRelease.release_notes` with preserved line breaks
- “下载更新” only when a newer version exists

Open `latestRelease.download_url` with `noopener,noreferrer`. Keep “手动检查更新”; remove “前往 Git 更新”.

- [ ] **Step 4: Verify App behavior**

Run:

```powershell
corepack pnpm test:run
corepack pnpm lint
corepack pnpm build
```

Expected: all commands exit `0`.

### Task 4: Implement the Release-Published Sync Workflow

**Files:**
- Create: `.github/workflows/sync-release-to-web.yml`

**Interfaces:**
- Trigger: `release.published`
- Reads: `github.event.release`, private source APK with `GITHUB_TOKEN`
- Writes: website Release and `public/releases.json` with `WEB_REPO_TOKEN`

- [ ] **Step 1: Add the exact trigger and minimal default permission**

Use:

```yaml
on:
  release:
    types:
      - published

permissions:
  contents: read
```

Add a concurrency group for `SpringSpiritSecond/dreamtide-website` with `cancel-in-progress: false`.

- [ ] **Step 2: Validate source metadata and locate the APK**

In Bash, read `GITHUB_EVENT_PATH` with `jq`. Require:

```text
tag: ^v[0-9]+\.[0-9]+\.[0-9]+([-.][0-9A-Za-z.-]+)?$
asset name: DreamTide-<tag>.apk
```

Fail if the exact asset does not exist or does not have one asset ID.

- [ ] **Step 3: Download the private asset**

Use:

```bash
gh api \
  -H "Accept: application/octet-stream" \
  "/repos/${GITHUB_REPOSITORY}/releases/assets/${ASSET_ID}" \
  > "${RUNNER_TEMP}/${APK_NAME}"
```

Set `GH_TOKEN` only for this step to `${{ github.token }}` and reject an empty file.

- [ ] **Step 4: Checkout the target website repository**

Use `actions/checkout@v4` with:

```yaml
repository: SpringSpiritSecond/dreamtide-website
ref: main
token: ${{ secrets.WEB_REPO_TOKEN }}
path: website
```

- [ ] **Step 5: Create or update the public Release**

With `GH_TOKEN: ${{ secrets.WEB_REPO_TOKEN }}`:

1. Write source Release body to a temporary file using `jq`.
2. Create the target Release if missing, otherwise edit its title and notes.
3. Upload the APK with `gh release upload --clobber`.
4. Read the uploaded asset's public URL and size back through `gh release view --json assets`.

- [ ] **Step 6: Generate JSON safely**

Use `jq -n` with `--arg` and `--argjson`; do not interpolate body text into shell source. Write atomically to `website/public/releases.json`, preserving all eight contract fields.

- [ ] **Step 7: Commit only the manifest when changed**

Configure:

```text
user.name: github-actions[bot]
user.email: 41898282+github-actions[bot]@users.noreply.github.com
```

Run `git add public/releases.json`. If staged diff is empty, exit successfully. Otherwise commit `Sync DreamTide release ${TAG}` and push `HEAD:main`.

- [ ] **Step 8: Validate workflow syntax**

Run from the App checkout:

```powershell
actionlint .github/workflows/sync-release-to-web.yml
```

If `actionlint` is unavailable, run its current official binary or container, then repeat the exact command. Expected: no findings and exit `0`.

### Task 5: Document Setup and Run Full Verification

**Files:**
- Modify: website `docs/releasing.md`

**Interfaces:**
- Documents: Secret creation, release prerequisites, sync behavior, failure recovery

- [ ] **Step 1: Replace the manual website-release instructions**

Document:

1. Build and publish `DreamTide-v<tag>.apk` in the App repository.
2. Create a fine-grained PAT restricted to `SpringSpiritSecond/dreamtide-website`.
3. Grant only `Contents: Read and write`.
4. Save it in App repository Actions Secrets as `WEB_REPO_TOKEN`.
5. Publish an App Release and inspect the sync Action, public Release, JSON commit, Pages deployment, and anonymous APK download.
6. Rotate the token before expiry.

- [ ] **Step 2: Verify no credential leakage**

Search tracked changes for:

```text
github_pat_
ghp_
WEB_REPO_TOKEN=
Authorization:
```

Expected: no literal credentials. References such as `${{ secrets.WEB_REPO_TOKEN }}` are allowed.

- [ ] **Step 3: Run complete website verification**

Run:

```powershell
corepack pnpm lint
corepack pnpm test:run
corepack pnpm build
```

Expected: all commands exit `0`.

- [ ] **Step 4: Run complete App verification**

Run:

```powershell
corepack pnpm lint
corepack pnpm test:run
corepack pnpm build
```

Expected: all commands exit `0`.

- [ ] **Step 5: Review isolated diffs**

Website diff must contain only the files listed in this plan plus the approved design and plan documents. App diff must contain only release-sync and update-check files. Do not stage, commit, or push.

