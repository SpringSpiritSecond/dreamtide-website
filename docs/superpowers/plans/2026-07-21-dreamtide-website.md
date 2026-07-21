# Dreamtide Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a poetic, accessible Dreamtide product website that teaches first-time users the four-step workflow and automatically links to the latest public Android APK.

**Architecture:** Use a small React + TypeScript + Vite single-page site with content defined in one typed module, focused presentational sections, a reusable media frame with missing-asset fallback, and an isolated GitHub Release client. Deploy the static build to the `/dreamtide-website/` GitHub Pages project path through GitHub Actions.

**Tech Stack:** React, TypeScript, Vite, CSS, Lucide React, Vitest, Testing Library, Playwright, GitHub Actions, GitHub REST API.

## Global Constraints

- The public repository must not contain or expose source from the private `SpringSpiritSecond/dreamtide` repository.
- The website must not claim that account registration, cloud sync, a free AI service, iOS, or an app-store build exists.
- Core copy must match `docs/superpowers/specs/2026-07-21-dreamtide-website-design.md`.
- Use the “雾白诗页 + 潮汐文字装置” direction: fog white, pale gray-green, cyan, typewriter blue, and only small coral accents.
- Do not use purple-pink gradients, card-grid SaaS layouts, Emoji as icons, or decorative motion that interferes with reading.
- Interactive transitions must stay within 200–300ms and respect `prefers-reduced-motion`.
- Touch targets must be at least 44px high.
- The site must work at 375px, 768px, 1024px, and 1440px without horizontal scrolling.
- Vite assets must resolve beneath `/dreamtide-website/`.
- The browser must never receive a GitHub token or request the private App repository API.
- Media filenames and replacement behavior must follow the approved `public/media/` contract.

## Planned File Structure

```text
.github/workflows/deploy-pages.yml   GitHub Pages build and deployment
docs/releasing.md                    Public APK publishing instructions
index.html                           Static document shell and metadata
package.json                         Scripts and dependencies
playwright.config.ts                 Responsive browser checks
tsconfig.app.json                    Browser TypeScript configuration
tsconfig.json                        TypeScript project references
tsconfig.node.json                   Tooling TypeScript configuration
vite.config.ts                       React, tests, and Pages base path
public/favicon.svg                   Dreamtide wave mark
public/media/README.md               Screenshot/GIF replacement contract
src/main.tsx                         React entry point
src/App.tsx                          Page section composition only
src/styles.css                       Tokens, layout, responsive rules, motion
src/content/siteContent.ts           Typed public copy and media paths
src/lib/githubRelease.ts             Release fetch, validation, formatting
src/lib/githubRelease.test.ts        Release client unit tests
src/hooks/useLatestRelease.ts        Fetch lifecycle for page components
src/components/Header.tsx            Desktop/mobile navigation
src/components/Hero.tsx              Hero message, media, primary conversion
src/components/FeatureStory.tsx      Editorial feature sequence
src/components/Tutorial.tsx          Four-step screenshot/GIF guide
src/components/DownloadPanel.tsx     Release states and download actions
src/components/MediaFrame.tsx        Media loading and missing-file fallback
src/components/MediaFrame.test.tsx   Media fallback behavior
src/components/DownloadPanel.test.tsx Release-state rendering
src/App.test.tsx                     Semantic shell and copy smoke test
src/test/setup.ts                    Testing Library matchers
e2e/site.spec.ts                     Browser navigation and viewport checks
```

---

### Task 1: Bootstrap the tested static application

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `src/test/setup.ts`

**Interfaces:**
- Produces: default React component `App(): JSX.Element`.
- Produces: scripts `dev`, `build`, `test`, `test:run`, `lint`, and `preview`.
- Produces: Vitest browser-like test environment with jest-dom matchers.

- [ ] **Step 1: Create package metadata and install dependencies**

Create `package.json`:

```json
{
  "name": "dreamtide-website",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

Run:

```bash
pnpm add react react-dom lucide-react
pnpm add -D typescript vite @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/react @types/react-dom eslint @eslint/js typescript-eslint @playwright/test
```

Expected: dependencies are recorded in `package.json` and `pnpm-lock.yaml` is created.

- [ ] **Step 2: Write the first failing page test**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('introduces Dreamtide and exposes the primary page landmarks', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: '梦醒以后，仍有迹可循' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test and verify the missing application fails**

Run: `pnpm test:run src/App.test.tsx`

Expected: FAIL because `src/App.tsx` does not exist.

- [ ] **Step 4: Add TypeScript, Vite, document shell, and minimal App**

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

Create `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true
  },
  "include": ["vite.config.ts", "playwright.config.ts"]
}
```

Create `vite.config.ts`:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/dreamtide-website/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="梦潮是一款本地优先的 Android 梦境记录、整理与回看应用。"
    />
    <meta name="theme-color" content="#eef2ed" />
    <link rel="icon" type="image/svg+xml" href="/dreamtide-website/favicon.svg" />
    <title>梦潮 Dreamtide｜记录与回看梦境</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <>
      <header>
        <a href="#top" aria-label="梦潮首页">梦潮 Dreamtide</a>
      </header>
      <main id="top">
        <h1>梦醒以后，仍有迹可循</h1>
      </main>
      <footer>梦潮 Dreamtide</footer>
    </>
  );
}
```

Create `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create an empty `src/styles.css` so the entry import resolves.

- [ ] **Step 5: Run unit tests and production build**

Run: `pnpm test:run && pnpm build`

Expected: all tests PASS and Vite writes `dist/index.html`.

- [ ] **Step 6: Commit the foundation**

```bash
git add package.json pnpm-lock.yaml index.html tsconfig*.json vite.config.ts src
git commit -m "Build the Dreamtide website foundation"
```

---

### Task 2: Implement the public APK release client

**Files:**
- Create: `src/lib/githubRelease.ts`
- Create: `src/lib/githubRelease.test.ts`
- Create: `src/hooks/useLatestRelease.ts`

**Interfaces:**
- Produces: `loadLatestRelease(fetcher?: typeof fetch): Promise<ResolvedReleaseState>`.
- Produces: `formatBytes(bytes: number): string`.
- Produces: `useLatestRelease(): ReleaseState`.
- Produces:

```ts
type PublicRelease = {
  version: string;
  downloadUrl: string;
  fileName: string;
  sizeLabel: string;
  publishedLabel: string;
};

type ReleaseState =
  | { status: 'loading' }
  | { status: 'ready'; release: PublicRelease }
  | {
      status: 'unavailable';
      reason: 'request-failed' | 'no-release' | 'no-apk';
    };
```

- [ ] **Step 1: Write release parsing and failure-state tests**

Create `src/lib/githubRelease.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the release tests and verify they fail**

Run: `pnpm test:run src/lib/githubRelease.test.ts`

Expected: FAIL because `githubRelease.ts` does not exist.

- [ ] **Step 3: Implement validated release loading**

Create `src/lib/githubRelease.ts`:

```ts
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

export function formatBytes(bytes: number) {
  if (bytes <= 0) return '0 B';
  if (bytes < 1_048_576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function isApkAsset(asset: GithubAsset) {
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

    if (!apk || !isApkAsset(apk)) {
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
```

Create `src/hooks/useLatestRelease.ts`:

```ts
import { useEffect, useState } from 'react';
import {
  loadLatestRelease,
  type ReleaseState,
} from '../lib/githubRelease';

export function useLatestRelease() {
  const [state, setState] = useState<ReleaseState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    void loadLatestRelease().then((nextState) => {
      if (active) setState(nextState);
    });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
```

- [ ] **Step 4: Run release tests**

Run: `pnpm test:run src/lib/githubRelease.test.ts`

Expected: 4 tests PASS.

- [ ] **Step 5: Commit the isolated release client**

```bash
git add src/lib src/hooks
git commit -m "Load the latest public Android release"
```

---

### Task 3: Add typed content and resilient media frames

**Files:**
- Create: `src/content/siteContent.ts`
- Create: `src/components/MediaFrame.tsx`
- Create: `src/components/MediaFrame.test.tsx`
- Create: `public/media/README.md`

**Interfaces:**
- Produces: `features: Feature[]` and `tutorialSteps: TutorialStep[]`.
- Produces: `MediaFrame(props: MediaFrameProps): JSX.Element`.
- `MediaFrameProps`:

```ts
type MediaFrameProps = {
  src: string;
  alt: string;
  label: string;
  eager?: boolean;
  portrait?: boolean;
};
```

- [ ] **Step 1: Write media success and fallback tests**

Create `src/components/MediaFrame.test.tsx`:

```tsx
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
    expect(image).toHaveAttribute('src', '/dreamtide-website/media/hero/home.webp');
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
```

- [ ] **Step 2: Run the media tests and verify they fail**

Run: `pnpm test:run src/components/MediaFrame.test.tsx`

Expected: FAIL because `MediaFrame.tsx` does not exist.

- [ ] **Step 3: Implement the media frame**

Create `src/components/MediaFrame.tsx`:

```tsx
import { ImageIcon } from 'lucide-react';
import { useState } from 'react';

export type MediaFrameProps = {
  src: string;
  alt: string;
  label: string;
  eager?: boolean;
  portrait?: boolean;
};

export function MediaFrame({
  src,
  alt,
  label,
  eager = false,
  portrait = false,
}: MediaFrameProps) {
  const [failed, setFailed] = useState(false);
  const url = `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`;

  return (
    <figure
      className={`media-frame${portrait ? ' media-frame--portrait' : ''}`}
      data-state={failed ? 'missing' : 'ready'}
    >
      {!failed && (
        <img
          src={url}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <figcaption className="media-frame__fallback">
          <ImageIcon aria-hidden="true" size={24} strokeWidth={1.5} />
          <strong>{label}</strong>
          <span>截图 / GIF 待替换</span>
        </figcaption>
      )}
    </figure>
  );
}
```

- [ ] **Step 4: Add the approved content model**

Create `src/content/siteContent.ts`:

```ts
export type Feature = {
  number: string;
  title: string;
  description: string;
  media?: {
    src: string;
    alt: string;
    label: string;
  };
};

export type TutorialStep = {
  number: string;
  title: string;
  description: string;
  media: {
    src: string;
    alt: string;
    label: string;
  };
};

export const features: Feature[] = [
  {
    number: '01',
    title: '趁记忆还清晰，写下梦',
    description: '用“刻梦”记录正文，支持暂存与正式保存。',
    media: {
      src: 'media/features/record.webp',
      alt: '梦潮刻梦书写界面',
      label: '刻梦 · 记录',
    },
  },
  {
    number: '02',
    title: '为梦留下线索',
    description:
      '保存后添加标签、隐私标记和注记，也可以获得 AI 参考解读。',
    media: {
      src: 'media/features/annotate.webp',
      alt: '梦潮标签、隐私和注记界面',
      label: '标 · 隐 · 注',
    },
  },
  {
    number: '03',
    title: '在时间里重新遇见',
    description: '从日历、档案与词云回看过去的梦。',
    media: {
      src: 'media/features/review.webp',
      alt: '梦潮日历、档案与词云回看界面',
      label: '梦潮 · 回看',
    },
  },
  {
    number: '04',
    title: '梦留在你的设备里',
    description:
      '当前数据本地保存，并支持导出备份。梦潮目前不提供云同步。',
  },
];

export const tutorialSteps: TutorialStep[] = [
  {
    number: '01',
    title: '下载并安装',
    description:
      '下载最新版 APK，按照 Android 系统提示完成安装。首次安装可能需要允许浏览器安装未知应用。',
    media: {
      src: 'media/tutorial/01-install.gif',
      alt: '下载并安装梦潮 Android 版的步骤演示',
      label: '01 · 下载与安装',
    },
  },
  {
    number: '02',
    title: '写下第一场梦',
    description:
      '打开梦潮，点击醒目的“刻梦”入口。趁细节还清晰，写下你记得的画面与感受。',
    media: {
      src: 'media/tutorial/02-record.gif',
      alt: '进入刻梦并记录梦境的步骤演示',
      label: '02 · 开始刻梦',
    },
  },
  {
    number: '03',
    title: '保存并整理',
    description:
      '先暂存未完成的内容，或正式保存一场梦。保存后可添加标签、隐私标记和注记。',
    media: {
      src: 'media/tutorial/03-organize.gif',
      alt: '保存梦境并添加标签与注记的步骤演示',
      label: '03 · 保存与整理',
    },
  },
  {
    number: '04',
    title: '回到梦潮回看',
    description:
      '从日历找到某一天，从档案翻阅记录，也可以点击词云中的词重新进入相关梦境。',
    media: {
      src: 'media/tutorial/04-review.gif',
      alt: '通过日历、档案和词云回看梦境的步骤演示',
      label: '04 · 回看梦潮',
    },
  },
];
```

- [ ] **Step 5: Document the exact media replacement contract**

Create `public/media/README.md`:

```md
# 官网截图与动图

将正式素材按以下名称放入目录，页面会自动使用，无需修改代码：

- `hero/home.webp`：首屏主截图，推荐 1080 × 2160，纵向 1:2。
- `features/record.webp`：刻梦功能截图，推荐 1440 × 1080，4:3。
- `features/annotate.webp`：标/隐/注截图，推荐 1440 × 1080，4:3。
- `features/review.webp`：日历/档案/词云截图，推荐 1440 × 1080，4:3。
- `tutorial/01-install.gif`：下载与安装步骤，推荐 1200 × 900，4:3。
- `tutorial/02-record.gif`：开始刻梦步骤，推荐 1200 × 900，4:3。
- `tutorial/03-organize.gif`：保存与整理步骤，推荐 1200 × 900，4:3。
- `tutorial/04-review.gif`：回看步骤，推荐 1200 × 900，4:3。

单个 GIF 建议不超过 5 MB。体积更大时优先转换为动画 WebP，并同步修改
`src/content/siteContent.ts` 中对应的扩展名。素材缺失时，官网会显示固定比例的
品牌占位画面，不会破坏布局。
```

- [ ] **Step 6: Run tests and commit**

Run: `pnpm test:run src/components/MediaFrame.test.tsx`

Expected: 2 tests PASS.

```bash
git add src/content src/components/MediaFrame* public/media/README.md
git commit -m "Define resilient website media content"
```

---

### Task 4: Build the complete semantic product narrative

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Hero.tsx`
- Create: `src/components/FeatureStory.tsx`
- Create: `src/components/Tutorial.tsx`
- Create: `src/components/DownloadPanel.tsx`
- Create: `src/components/DownloadPanel.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- `DownloadPanel({ state, variant? }: { state: ReleaseState; variant?: 'hero' | 'footer' }): JSX.Element`.
- `Hero({ releaseState }: { releaseState: ReleaseState }): JSX.Element`.
- `Header(): JSX.Element`, `FeatureStory(): JSX.Element`, and `Tutorial(): JSX.Element`.

- [ ] **Step 1: Write release-state component tests**

Create `src/components/DownloadPanel.test.tsx`:

```tsx
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
  });
});
```

- [ ] **Step 2: Run the component test and verify it fails**

Run: `pnpm test:run src/components/DownloadPanel.test.tsx`

Expected: FAIL because `DownloadPanel.tsx` does not exist.

- [ ] **Step 3: Implement the download state UI**

Create `src/components/DownloadPanel.tsx`:

```tsx
import { ArrowUpRight, Download } from 'lucide-react';
import {
  RELEASES_URL,
  type ReleaseState,
} from '../lib/githubRelease';

const unavailableCopy = {
  'request-failed': '暂时无法读取版本信息',
  'no-release': 'Android 版本正在准备中',
  'no-apk': '当前版本未找到 Android 安装包',
} as const;

export function DownloadPanel({
  state,
  variant = 'hero',
}: {
  state: ReleaseState;
  variant?: 'hero' | 'footer';
}) {
  return (
    <div className={`download-panel download-panel--${variant}`}>
      {state.status === 'ready' && (
        <>
          <a className="button button--primary" href={state.release.downloadUrl}>
            <Download aria-hidden="true" size={18} />
            下载 Android 版
          </a>
          <p className="release-meta">
            {state.release.version} · {state.release.sizeLabel} ·{' '}
            {state.release.publishedLabel}
          </p>
        </>
      )}

      {state.status === 'loading' && (
        <>
          <span className="button button--primary button--loading" aria-live="polite">
            <span className="loading-dot" aria-hidden="true" />
            正在读取最新版本
          </span>
          <a className="text-link" href={RELEASES_URL}>
            查看全部版本 <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        </>
      )}

      {state.status === 'unavailable' && (
        <>
          <p className="release-message" role="status">
            {unavailableCopy[state.reason]}
          </p>
          <a className="button button--secondary" href={RELEASES_URL}>
            查看全部版本 <ArrowUpRight aria-hidden="true" size={17} />
          </a>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Implement navigation and product sections**

Create `src/components/Header.tsx`:

```tsx
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '#features', label: '功能' },
  { href: '#guide', label: '使用方法' },
  { href: '#download', label: '下载' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="梦潮首页">
        <span>梦潮</span>
        <small>Dreamtide</small>
      </a>
      <button
        className="menu-button"
        type="button"
        aria-expanded={open}
        aria-controls="site-navigation"
        aria-label={open ? '关闭导航' : '打开导航'}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <nav id="site-navigation" className={open ? 'site-nav is-open' : 'site-nav'}>
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
```

Create `src/components/Hero.tsx`:

```tsx
import type { ReleaseState } from '../lib/githubRelease';
import { DownloadPanel } from './DownloadPanel';
import { MediaFrame } from './MediaFrame';

export function Hero({ releaseState }: { releaseState: ReleaseState }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="eyebrow">本地优先的 Android 梦境记录应用</p>
        <h1 id="hero-title">梦醒以后，仍有迹可循</h1>
        <p className="hero__lead">
          记录每一次梦境，整理情绪与片段，再从日历、档案和词云里慢慢回看。
        </p>
        <div className="hero__actions">
          <DownloadPanel state={releaseState} />
          <a className="button button--quiet" href="#guide">看看怎么用</a>
        </div>
      </div>
      <div className="hero__visual">
        <span className="hero__stamp" aria-hidden="true">DREAM / TIDE</span>
        <MediaFrame
          src="media/hero/home.webp"
          alt="梦潮 App 首页"
          label="梦潮首页主截图"
          eager
          portrait
        />
      </div>
    </section>
  );
}
```

Create `src/components/FeatureStory.tsx`:

```tsx
import { features } from '../content/siteContent';
import { MediaFrame } from './MediaFrame';

export function FeatureStory() {
  return (
    <section id="features" className="feature-story" aria-labelledby="features-title">
      <header className="section-intro">
        <p className="eyebrow">一场梦，从记录到回看</p>
        <h2 id="features-title">把散落的片段，慢慢收回来</h2>
      </header>
      <div className="feature-story__list">
        {features.map((feature) => (
          <article className="feature" key={feature.number}>
            <span className="feature__number" aria-hidden="true">
              {feature.number}
            </span>
            <div className="feature__copy">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
            {feature.media && (
              <MediaFrame
                src={feature.media.src}
                alt={feature.media.alt}
                label={feature.media.label}
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
```

Create `src/components/Tutorial.tsx`:

```tsx
import { tutorialSteps } from '../content/siteContent';
import { MediaFrame } from './MediaFrame';

export function Tutorial() {
  return (
    <section id="guide" className="tutorial" aria-labelledby="guide-title">
      <header className="section-intro section-intro--guide">
        <p className="eyebrow">第一次使用梦潮</p>
        <h2 id="guide-title">从写下第一场梦开始</h2>
        <p>四个步骤，认识梦潮。</p>
      </header>
      <ol className="tutorial__list">
        {tutorialSteps.map((step) => (
          <li className="tutorial-step" key={step.number}>
            <div className="tutorial-step__copy">
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            <MediaFrame
              src={step.media.src}
              alt={step.media.alt}
              label={step.media.label}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 5: Compose the page and expand semantic smoke tests**

Replace `src/App.tsx` with:

```tsx
import { DownloadPanel } from './components/DownloadPanel';
import { FeatureStory } from './components/FeatureStory';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Tutorial } from './components/Tutorial';
import { useLatestRelease } from './hooks/useLatestRelease';

export default function App() {
  const releaseState = useLatestRelease();

  return (
    <>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <Header />
      <main id="main-content">
        <div id="top" />
        <Hero releaseState={releaseState} />
        <FeatureStory />
        <Tutorial />
        <section id="download" className="download-cta" aria-labelledby="download-title">
          <p className="eyebrow">Android</p>
          <h2 id="download-title">下一场梦，醒来就记下</h2>
          <p>
            梦境与设置保存在当前设备。梦潮目前不提供云同步，请定期导出备份。
          </p>
          <DownloadPanel state={releaseState} variant="footer" />
        </section>
      </main>
      <footer className="site-footer">
        <span>梦潮 Dreamtide</span>
        <span>记录 · 整理 · 回看</span>
      </footer>
    </>
  );
}
```

Extend `src/App.test.tsx` with:

```tsx
import { vi } from 'vitest';

vi.mock('./hooks/useLatestRelease', () => ({
  useLatestRelease: () => ({ status: 'unavailable', reason: 'no-release' }),
}));

it('presents the four real product capabilities and tutorial steps', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: '把散落的片段，慢慢收回来' }))
    .toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '趁记忆还清晰，写下梦' }))
    .toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '梦留在你的设备里' }))
    .toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '从写下第一场梦开始' }))
    .toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
});
```

- [ ] **Step 6: Run focused and full tests**

Run:

```bash
pnpm test:run src/components/DownloadPanel.test.tsx src/App.test.tsx
pnpm test:run
```

Expected: all tests PASS with no React act warnings.

- [ ] **Step 7: Commit the complete product narrative**

```bash
git add src
git commit -m "Present the Dreamtide product and first-use guide"
```

---

### Task 5: Apply the poetic responsive visual system

**Files:**
- Modify: `src/styles.css`
- Create: `public/favicon.svg`
- Create: `playwright.config.ts`
- Create: `e2e/site.spec.ts`

**Interfaces:**
- Produces CSS tokens used by every component class from Task 4.
- Produces Playwright checks at 375, 768, 1024, and 1440 CSS pixels.

- [ ] **Step 1: Write responsive browser checks**

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://127.0.0.1:4173/dreamtide-website/',
  },
  webServer: {
    command: 'pnpm build && pnpm preview --host 127.0.0.1',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
```

Create `e2e/site.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

for (const width of [375, 768, 1024, 1440]) {
  test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 375 ? 760 : 900 });
    await page.goto('');

    const sizes = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));

    expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
    await expect(
      page.getByRole('heading', { level: 1, name: '梦醒以后，仍有迹可循' }),
    ).toBeVisible();
  });
}

test('mobile navigation reaches the tutorial', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 760 });
  await page.goto('');
  await page.getByRole('button', { name: '打开导航' }).click();
  await page.getByRole('link', { name: '使用方法' }).click();
  await expect(page.locator('#guide')).toBeInViewport();
});

test('missing media keeps a visible branded placeholder', async ({ page }) => {
  await page.goto('');
  await expect(page.getByText('梦潮首页主截图')).toBeVisible();
  await expect(page.getByText('截图 / GIF 待替换').first()).toBeVisible();
});
```

- [ ] **Step 2: Run the browser tests and verify visual CSS is incomplete**

Run:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected: semantic checks may pass, but mobile navigation or overflow checks expose incomplete layout behavior before the final stylesheet.

- [ ] **Step 3: Implement the complete token, layout, and state stylesheet**

Replace `src/styles.css` with a stylesheet that contains these exact foundations and component contracts:

```css
:root {
  font-family: Inter, "Noto Sans SC", "Microsoft YaHei", sans-serif;
  color: #1c3133;
  background: #edf1ec;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  --paper: #f6f7f2;
  --mist: #e4ece8;
  --cyan: #c9e1df;
  --blue: #315f73;
  --ink: #1c3133;
  --muted: #566d6f;
  --coral: #d96f64;
  --line: rgba(49, 95, 115, 0.2);
  --shadow: 0 28px 70px rgba(35, 66, 67, 0.12);
  --serif: "Noto Serif SC", "Source Han Serif SC", STSong, SimSun, serif;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 88px; }
body { margin: 0; min-width: 320px; min-height: 100vh; overflow-x: hidden; }
body::before {
  position: fixed;
  inset: 0;
  z-index: -1;
  content: "";
  opacity: 0.22;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.12'/%3E%3C/svg%3E");
}
a { color: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
button:focus-visible, a:focus-visible {
  outline: 3px solid rgba(217, 111, 100, 0.42);
  outline-offset: 4px;
}
h1, h2, h3, p { margin-top: 0; }
h1, h2, h3 { font-family: var(--serif); font-weight: 500; text-wrap: balance; }
.skip-link {
  position: fixed;
  z-index: 100;
  left: 1rem;
  top: 1rem;
  transform: translateY(-180%);
  padding: 0.75rem 1rem;
  background: var(--ink);
  color: white;
}
.skip-link:focus { transform: translateY(0); }

.site-header {
  position: fixed;
  z-index: 50;
  top: 14px;
  left: max(14px, env(safe-area-inset-left));
  right: max(14px, env(safe-area-inset-right));
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 0.55rem 0.7rem 0.55rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  background: rgba(246, 247, 242, 0.86);
  box-shadow: 0 12px 38px rgba(35, 66, 67, 0.08);
  backdrop-filter: blur(18px);
}
.brand { display: flex; align-items: baseline; gap: 0.55rem; text-decoration: none; }
.brand span { font-family: var(--serif); font-size: 1.15rem; letter-spacing: 0.12em; }
.brand small { color: var(--muted); font-size: 0.64rem; letter-spacing: 0.12em; text-transform: uppercase; }
.site-nav { display: flex; align-items: center; gap: 0.25rem; }
.site-nav a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  padding: 0 1rem;
  border-radius: 999px;
  color: var(--muted);
  text-decoration: none;
  transition: color 220ms ease, background 220ms ease;
}
.site-nav a:hover { color: var(--ink); background: rgba(201, 225, 223, 0.45); }
.menu-button {
  display: none;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  color: var(--ink);
  background: transparent;
  cursor: pointer;
}

main { overflow: clip; }
#top { position: absolute; top: 0; }
.hero, .feature-story, .tutorial, .download-cta, .site-footer {
  width: min(1180px, calc(100% - 40px));
  margin-inline: auto;
}
.hero {
  min-height: 100svh;
  padding: 150px 0 86px;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.72fr);
  align-items: center;
  gap: clamp(2rem, 7vw, 7rem);
  position: relative;
}
.hero::before, .hero::after {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  content: "";
  filter: blur(8px);
}
.hero::before {
  width: 62vw;
  height: 62vw;
  max-width: 780px;
  max-height: 780px;
  left: -22vw;
  top: 2vh;
  background: radial-gradient(circle, rgba(201, 225, 223, 0.78), transparent 68%);
}
.hero::after {
  width: 420px;
  height: 420px;
  right: -160px;
  bottom: 5vh;
  background: radial-gradient(circle, rgba(224, 196, 190, 0.42), transparent 70%);
}
.eyebrow {
  margin-bottom: 1.1rem;
  color: var(--blue);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.hero h1 {
  max-width: 8.2em;
  margin-bottom: 1.5rem;
  font-size: clamp(3.25rem, 7vw, 6.9rem);
  line-height: 0.98;
  letter-spacing: -0.055em;
}
.hero__lead {
  max-width: 35rem;
  margin-bottom: 2rem;
  color: var(--muted);
  font-size: clamp(1rem, 1.5vw, 1.18rem);
  line-height: 1.9;
}
.hero__actions { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 0.8rem; }
.button {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0 1.25rem;
  border: 1px solid transparent;
  border-radius: 999px;
  text-decoration: none;
  cursor: pointer;
  transition: color 240ms ease, background 240ms ease, border-color 240ms ease, box-shadow 240ms ease;
}
.button--primary { color: #fff; background: var(--ink); box-shadow: 0 12px 30px rgba(28, 49, 51, 0.18); }
.button--primary:hover { background: var(--blue); box-shadow: 0 14px 34px rgba(49, 95, 115, 0.24); }
.button--secondary, .button--quiet { border-color: var(--line); background: rgba(255, 255, 255, 0.38); }
.button--secondary:hover, .button--quiet:hover { border-color: rgba(49, 95, 115, 0.42); background: rgba(255, 255, 255, 0.76); }
.button--loading { cursor: progress; }
.loading-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--coral); animation: pulse 1.2s ease-in-out infinite; }
.download-panel { display: flex; align-items: center; flex-wrap: wrap; gap: 0.8rem; }
.release-meta, .release-message { margin: 0; color: var(--muted); font-size: 0.78rem; }
.text-link { min-height: 44px; display: inline-flex; align-items: center; gap: 0.2rem; color: var(--blue); }
.hero__visual { position: relative; display: grid; place-items: center; }
.hero__stamp {
  position: absolute;
  z-index: -1;
  right: -1.4rem;
  top: 12%;
  writing-mode: vertical-rl;
  color: rgba(49, 95, 115, 0.22);
  font-size: clamp(1.4rem, 3vw, 2.6rem);
  letter-spacing: 0.22em;
}

.media-frame {
  width: 100%;
  aspect-ratio: 4 / 3;
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(49, 95, 115, 0.18);
  border-radius: 32px 18px 34px 22px;
  background:
    linear-gradient(145deg, rgba(255,255,255,.62), rgba(201,225,223,.36)),
    repeating-radial-gradient(circle at 20% 20%, transparent 0 18px, rgba(49,95,115,.05) 19px 20px);
  box-shadow: var(--shadow);
}
.media-frame--portrait { width: min(100%, 350px); aspect-ratio: 1 / 2; border-radius: 48px; }
.media-frame img { display: block; width: 100%; height: 100%; object-fit: cover; }
.media-frame__fallback {
  height: 100%;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.65rem;
  padding: 2rem;
  color: var(--blue);
  text-align: center;
}
.media-frame__fallback strong { font-family: var(--serif); font-size: 1.1rem; }
.media-frame__fallback span { color: var(--muted); font-size: 0.74rem; letter-spacing: 0.08em; }

.feature-story { padding: 120px 0; }
.section-intro { max-width: 720px; margin-bottom: clamp(4rem, 9vw, 8rem); }
.section-intro h2, .download-cta h2 {
  margin-bottom: 1rem;
  font-size: clamp(2.5rem, 5vw, 5rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
}
.section-intro > p:last-child { color: var(--muted); line-height: 1.8; }
.feature-story__list { display: grid; gap: clamp(6rem, 12vw, 12rem); }
.feature {
  display: grid;
  grid-template-columns: 0.25fr 0.75fr 1.2fr;
  align-items: center;
  gap: clamp(1.5rem, 5vw, 5rem);
}
.feature:nth-child(even) { grid-template-columns: 1.2fr 0.75fr 0.25fr; }
.feature:nth-child(even) .feature__number { grid-column: 3; grid-row: 1; }
.feature:nth-child(even) .feature__copy { grid-column: 2; grid-row: 1; }
.feature:nth-child(even) .media-frame { grid-column: 1; grid-row: 1; }
.feature:last-child { max-width: 760px; grid-template-columns: 0.3fr 1fr; margin-left: auto; }
.feature__number { color: rgba(49, 95, 115, 0.28); font-family: var(--serif); font-size: clamp(4rem, 9vw, 8rem); line-height: 1; }
.feature__copy h3 { margin-bottom: 1rem; font-size: clamp(1.8rem, 3vw, 3rem); }
.feature__copy p { margin-bottom: 0; color: var(--muted); line-height: 1.9; }

.tutorial {
  padding: 130px 0;
  border-top: 1px solid var(--line);
}
.section-intro--guide { margin-left: auto; text-align: right; }
.tutorial__list { list-style: none; margin: 0; padding: 0; display: grid; gap: clamp(5rem, 10vw, 10rem); }
.tutorial-step { display: grid; grid-template-columns: minmax(220px, .62fr) minmax(0, 1.38fr); align-items: center; gap: clamp(2rem, 7vw, 7rem); }
.tutorial-step:nth-child(even) { grid-template-columns: minmax(0, 1.38fr) minmax(220px, .62fr); }
.tutorial-step:nth-child(even) .tutorial-step__copy { grid-column: 2; grid-row: 1; }
.tutorial-step:nth-child(even) .media-frame { grid-column: 1; grid-row: 1; }
.tutorial-step__copy > span { color: var(--coral); font-size: 0.78rem; letter-spacing: 0.18em; }
.tutorial-step__copy h3 { margin: .8rem 0 1rem; font-size: clamp(1.8rem, 3.2vw, 3.25rem); }
.tutorial-step__copy p { margin-bottom: 0; color: var(--muted); line-height: 1.9; }

.download-cta {
  position: relative;
  margin-bottom: 54px;
  padding: clamp(3rem, 8vw, 7rem);
  overflow: hidden;
  border-radius: 56px 24px 56px 24px;
  background: linear-gradient(135deg, #dbe9e4, #f4eee9 68%, #e8d8d2);
}
.download-cta::after {
  position: absolute;
  right: -8%;
  bottom: -55%;
  width: 440px;
  height: 440px;
  border: 1px solid rgba(49,95,115,.22);
  border-radius: 50%;
  box-shadow: 0 0 0 42px rgba(49,95,115,.05), 0 0 0 88px rgba(49,95,115,.035);
  content: "";
}
.download-cta > * { position: relative; z-index: 1; }
.download-cta > p:not(.eyebrow) { max-width: 560px; color: var(--muted); line-height: 1.8; }
.download-panel--footer { margin-top: 2rem; }
.site-footer { min-height: 96px; display: flex; align-items: center; justify-content: space-between; color: var(--muted); font-size: .8rem; letter-spacing: .06em; }

@keyframes pulse { 50% { opacity: .45; transform: scale(.78); } }

@media (max-width: 760px) {
  html { scroll-padding-top: 80px; }
  .site-header { top: 10px; left: 10px; right: 10px; }
  .menu-button { display: grid; place-items: center; }
  .site-nav {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 180px;
    display: none;
    padding: .6rem;
    border: 1px solid rgba(255,255,255,.74);
    border-radius: 24px;
    background: rgba(246,247,242,.96);
    box-shadow: var(--shadow);
  }
  .site-nav.is-open { display: grid; }
  .site-nav a { width: 100%; }
  .hero, .feature-story, .tutorial, .download-cta, .site-footer { width: min(100% - 28px, 680px); }
  .hero {
    min-height: auto;
    padding: 130px 0 84px;
    grid-template-columns: 1fr;
    gap: 4.5rem;
  }
  .hero h1 { font-size: clamp(3rem, 15vw, 5rem); }
  .hero__actions { align-items: stretch; flex-direction: column; }
  .download-panel { align-items: stretch; flex-direction: column; }
  .button { width: 100%; }
  .hero__stamp { right: 0; }
  .feature-story, .tutorial { padding: 88px 0; }
  .section-intro, .section-intro--guide { margin-bottom: 4.5rem; text-align: left; }
  .feature-story__list, .tutorial__list { gap: 6rem; }
  .feature, .feature:nth-child(even), .feature:last-child,
  .tutorial-step, .tutorial-step:nth-child(even) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-left: 0;
  }
  .feature:nth-child(even) .feature__number,
  .feature:nth-child(even) .feature__copy,
  .feature:nth-child(even) .media-frame,
  .tutorial-step:nth-child(even) .tutorial-step__copy,
  .tutorial-step:nth-child(even) .media-frame {
    grid-column: 1;
    grid-row: auto;
  }
  .feature__number { font-size: 4.5rem; }
  .tutorial-step .tutorial-step__copy { order: 1; }
  .tutorial-step .media-frame { order: 2; }
  .download-cta { padding: 3rem 1.4rem 4rem; border-radius: 34px 18px; }
  .site-footer { min-height: 120px; align-items: flex-start; justify-content: center; flex-direction: column; gap: .5rem; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Add a lightweight SVG favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="18" fill="#eef2ed"/>
  <path d="M12 34c8-12 15 12 24 0s12-7 16-2" fill="none" stroke="#315f73" stroke-width="4" stroke-linecap="round"/>
  <circle cx="44" cy="20" r="5" fill="#d96f64"/>
</svg>
```

- [ ] **Step 5: Run all unit, build, and browser checks**

Run:

```bash
pnpm test:run
pnpm build
pnpm test:e2e
```

Expected: unit tests PASS, production build succeeds, all 6 Playwright checks PASS.

- [ ] **Step 6: Commit the responsive visual system**

```bash
git add src/styles.css public/favicon.svg playwright.config.ts e2e
git commit -m "Style the poetic Dreamtide product story"
```

---

### Task 6: Deploy GitHub Pages and document public APK publishing

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Create: `docs/releasing.md`
- Create: `README.md`
- Create: `eslint.config.js`
- Modify: `package.json`

**Interfaces:**
- Produces: GitHub Pages artifact from `dist/` on each push to `main`.
- Produces: a credential-safe process for publishing APK assets to this public repository.

- [ ] **Step 1: Add the Pages deployment workflow**

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:run
      - run: pnpm build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Document public release publishing without frontend secrets**

Create `docs/releasing.md`:

```md
# 发布 Android APK

官网只读取公开仓库 `SpringSpiritSecond/dreamtide-website` 的 Latest Release。
私有 App 仓库的 Token 不得写入网页源码、Vite 环境变量或 Pages 配置。

## 首次准备

1. 在私有 App 仓库完成构建与签名。
2. 将安装包命名为 `DreamTide-v<版本号>.apk`。
3. 在本机登录 GitHub CLI：`gh auth login`。

## 发布

在 APK 所在目录执行：

```bash
gh release create v0.3.0 "DreamTide-v0.3.0.apk#DreamTide Android v0.3.0" \
  --repo SpringSpiritSecond/dreamtide-website \
  --title "DreamTide v0.3.0" \
  --notes "梦潮 Android v0.3.0"
```

发布完成后，访问以下接口确认 `assets` 中存在 `.apk`：

`https://api.github.com/repos/SpringSpiritSecond/dreamtide-website/releases/latest`

官网无需重新构建，会在访客打开页面时自动读取最新公开版本。

## 后续自动同步

若在私有 App 仓库增加发布工作流，应使用只拥有
`dreamtide-website` Releases 写权限的 fine-grained token，并只把该 token
保存在私有 App 仓库的 Actions Secrets。公开仓库和前端构建不得持有该 token。
```

- [ ] **Step 3: Add project and media documentation**

Create `README.md`:

```md
# 梦潮产品官网

梦潮（Dreamtide）的公开产品介绍与新手教程网站。

- 官网部署：GitHub Pages
- 产品平台：Android
- App 源码：位于独立私有仓库，不包含在本仓库
- 下载来源：本仓库公开 GitHub Releases

## 本地开发

```bash
pnpm install
pnpm dev
```

## 验证

```bash
pnpm test:run
pnpm build
pnpm test:e2e
```

## 替换截图与动图

完整文件名、尺寸和格式要求见 [`public/media/README.md`](public/media/README.md)。
将正式素材按同名路径放入后即可生效。没有素材时，页面显示固定比例占位画面。

## 发布 Android 版

见 [`docs/releasing.md`](docs/releasing.md)。APK 必须发布到本公开仓库的
Releases，官网不会也不能匿名读取私有 App 仓库。
```

- [ ] **Step 4: Add lint configuration and run the final local verification**

Create `eslint.config.js`:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'playwright-report', 'test-results'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
);
```

Run:

```bash
pnpm lint
pnpm test:run
pnpm build
pnpm test:e2e
git status --short
```

Expected:

- lint exits 0;
- all Vitest and Playwright tests pass;
- `dist/index.html` exists and references `/dreamtide-website/assets/...`;
- only intended source files are pending before commit.

- [ ] **Step 5: Commit deployment and release documentation**

```bash
git add .github README.md docs/releasing.md package.json pnpm-lock.yaml eslint.config.js
git commit -m "Deploy the Dreamtide website with public releases"
```

- [ ] **Step 6: Push and verify GitHub Pages**

Run:

```bash
git push origin main
gh run watch --repo SpringSpiritSecond/dreamtide-website
gh api repos/SpringSpiritSecond/dreamtide-website/pages
```

Expected: the deployment workflow succeeds and the Pages API reports a published URL beneath `https://springspiritsecond.github.io/dreamtide-website/`.

Open the published page and verify:

1. the hero and four tutorial steps are readable without media files;
2. the latest release state falls back safely when no APK has been published;
3. after publishing an APK Release, the main button links directly to its `browser_download_url`;
4. navigation and download controls remain usable at 375px.
