# Dreamtide Media Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display all nine supplied image and MP4 assets in context while preserving a fallback for the missing installation demo.

**Architecture:** Keep media metadata in `siteContent.ts`, extend the shared `MediaFrame` to render either images or videos, and let tutorial steps contain one or more media items. The archive review step uses a responsive three-item sequence; all other sections retain the existing editorial layout.

**Tech Stack:** React 19, TypeScript 6, Vite 8, CSS, Vitest, Testing Library, Playwright

## Global Constraints

- Every file currently in `public/media/` must be referenced by the page at least once.
- Keep the missing installation demonstration as a fixed-ratio fallback.
- Preserve MP4 files instead of converting them to GIF.
- Videos are muted, looping, inline, and lazy by default; the Hero video may preload metadata.
- Do not autoplay videos when `prefers-reduced-motion: reduce` matches.
- Preserve all unrelated user modifications in the working tree.
- Do not create git commits unless the user explicitly requests them.

---

### Task 1: Add native video rendering to MediaFrame

**Files:**
- Modify: `src/components/MediaFrame.test.tsx`
- Modify: `src/components/MediaFrame.tsx`
- Modify: `src/styles.css:346-377`

**Interfaces:**
- Consumes: existing `MediaFrameProps`
- Produces: `MediaFrame({ src, alt, label, eager?, portrait? })` that selects `<video>` for `.mp4` sources and `<img>` otherwise

- [ ] **Step 1: Write failing video tests**

Add `vi` to the existing Vitest import. Add `afterEach(() => vi.unstubAllGlobals())`, then write tests that render `media/首页.mp4`, assert the base-prefixed source, and verify `muted`, `loop`, `playsInline`, `preload="metadata"`, and accessible labeling. Stub `window.matchMedia` once with `matches: false`, then add a reduced-motion test with `matches: true` that expects `autoplay` to be absent and controls to be present.

```tsx
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
  expect(video).toHaveAttribute('src', '/dreamtide-website/media/首页.mp4');
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
    <MediaFrame src="media/词云.mp4" alt="词云回看演示" label="词云" />,
  );

  const video = container.querySelector('video');
  expect(video).not.toHaveAttribute('autoplay');
  expect(video).toHaveAttribute('controls');
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```powershell
corepack pnpm test:run -- src/components/MediaFrame.test.tsx
```

Expected: FAIL because `MediaFrame` currently renders MP4 sources as `<img>`.

- [ ] **Step 3: Implement minimal video support**

In `MediaFrame.tsx`, import `VideoIcon` beside `ImageIcon`, detect MP4 case-insensitively, and render:

```tsx
const isVideo = /\.mp4(?:$|[?#])/i.test(src);
const reduceMotion =
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

{!failed && isVideo && (
  <video
    src={url}
    aria-label={alt}
    autoPlay={!reduceMotion}
    controls={reduceMotion}
    muted
    loop
    playsInline
    preload={eager ? 'metadata' : 'none'}
    onError={() => setFailed(true)}
  />
)}
{!failed && !isVideo && (
  <img
    src={url}
    alt={alt}
    loading={eager ? 'eager' : 'lazy'}
    fetchPriority={eager ? 'high' : 'auto'}
    onError={() => setFailed(true)}
  />
)}
```

Use `VideoIcon` for a failed MP4, retain `ImageIcon` for failed images, and change the fallback text to `媒体素材待补充`.

- [ ] **Step 4: Apply shared image/video sizing**

Replace `.media-frame img` with:

```css
.media-frame img,
.media-frame video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

- [ ] **Step 5: Run the focused test**

Run:

```powershell
corepack pnpm test:run -- src/components/MediaFrame.test.tsx
```

Expected: PASS.

---

### Task 2: Map all assets and render the archive sequence

**Files:**
- Modify: `src/content/siteContent.ts`
- Modify: `src/components/Hero.tsx:25-31`
- Modify: `src/components/Tutorial.tsx`
- Modify: `src/styles.css:496-515, 678-708`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Produces: exported `Media` type with `{ src: string; alt: string; label: string; portrait?: boolean }`
- Produces: `TutorialStep.media: Media[]`
- Consumes: `MediaFrame` video support from Task 1

- [ ] **Step 1: Write a failing page-content test**

In `src/App.test.tsx`, add a test that renders `App`, gathers all image and video `src` attributes, decodes each URL, and verifies every supplied filename:

```tsx
it('uses every supplied product media asset', () => {
  const { container } = render(<App />);
  const sources = Array.from(
    container.querySelectorAll<HTMLImageElement | HTMLVideoElement>('img, video'),
    (element) => decodeURI(element.getAttribute('src') ?? ''),
  );

  for (const filename of [
    '首页.mp4',
    '不谈人间事.mp4',
    '春梦了无痕.mp4',
    '编辑-隐.jpg',
    '档案.jpg',
    '档案 筛选.jpg',
    '档案 正文.mp4',
    '词云.mp4',
    '分享.png',
  ]) {
    expect(sources.some((src) => src.endsWith(`/media/${filename}`))).toBe(true);
  }
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```powershell
corepack pnpm test:run -- src/App.test.tsx
```

Expected: FAIL because none of the new filenames are referenced yet.

- [ ] **Step 3: Define reusable media metadata and exact mappings**

Refactor `siteContent.ts` to export:

```ts
export type Media = {
  src: string;
  alt: string;
  label: string;
  portrait?: boolean;
};
```

Use `media: Media[]` for every tutorial step. Apply these exact mappings:

```ts
// Feature 01
{ src: 'media/不谈人间事.mp4', alt: '在梦潮中写下梦境正文的操作演示', label: '刻梦 · 记录', portrait: true }

// Feature 02
{ src: 'media/编辑-隐.jpg', alt: '梦潮梦境详情中的隐私标记界面', label: '标 · 隐 · 注', portrait: true }

// Feature 03
{ src: 'media/档案.jpg', alt: '梦潮档案中的梦境记录列表', label: '梦潮 · 档案', portrait: true }

// Tutorial 01: retain media/tutorial/01-install.gif so it falls back
// Tutorial 02
{ src: 'media/春梦了无痕.mp4', alt: '在梦潮中写下第一场梦的步骤演示', label: '02 · 开始刻梦', portrait: true }

// Tutorial 03
{ src: 'media/分享.png', alt: '梦潮生成的梦境分享卡片', label: '03 · 保存、整理与分享' }

// Tutorial 04
[
  { src: 'media/档案 筛选.jpg', alt: '梦潮档案筛选界面', label: '04 · 筛选档案', portrait: true },
  { src: 'media/档案 正文.mp4', alt: '从梦潮档案打开梦境正文的步骤演示', label: '04 · 阅读正文', portrait: true },
  { src: 'media/词云.mp4', alt: '通过梦潮词云回看相关梦境的步骤演示', label: '04 · 词云回看', portrait: true },
]
```

Change tutorial step 03 title to `保存、整理与分享` and mention generating a share card without removing the current saving and tagging guidance.

- [ ] **Step 4: Point the Hero at the supplied home video**

In `Hero.tsx`, change only the media values:

```tsx
<MediaFrame
  src="media/首页.mp4"
  alt="梦潮 App 首页操作演示"
  label="梦潮首页"
  eager
  portrait
/>
```

Do not alter the user’s current Hero heading or other copy.

- [ ] **Step 5: Render tutorial media arrays**

Replace the single `MediaFrame` in `Tutorial.tsx` with:

```tsx
<div
  className={`tutorial-step__media${
    step.media.length > 1 ? ' tutorial-step__media--sequence' : ''
  }`}
>
  {step.media.map((media) => (
    <MediaFrame
      key={media.src}
      src={media.src}
      alt={media.alt}
      label={media.label}
      portrait={media.portrait}
    />
  ))}
</div>
```

Also pass `portrait={feature.media.portrait}` from `FeatureStory.tsx`.

- [ ] **Step 6: Style single and sequence media layouts**

Add:

```css
.tutorial-step__media {
  min-width: 0;
  display: grid;
  gap: 1.25rem;
  justify-items: center;
}

.tutorial-step__media--sequence {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
}

.tutorial-step__media--sequence .media-frame--portrait {
  width: 100%;
}
```

Update even-step placement selectors to target `.tutorial-step__media` instead of `.media-frame`. Under `max-width: 760px`, reset `.tutorial-step__media` to the normal flow, order it after copy, and collapse the sequence to one column:

```css
.tutorial-step__media--sequence {
  grid-template-columns: 1fr;
}
```

- [ ] **Step 7: Run content and component tests**

Run:

```powershell
corepack pnpm test:run -- src/App.test.tsx src/components/MediaFrame.test.tsx
```

Expected: PASS.

---

### Task 3: Update maintenance docs and end-to-end expectations

**Files:**
- Modify: `public/media/README.md`
- Modify: `e2e/site.spec.ts`

**Interfaces:**
- Consumes: final mappings and fallback text from Tasks 1–2
- Produces: accurate asset-maintenance documentation and browser-level coverage

- [ ] **Step 1: Update the E2E media assertions**

Replace the old test that assumes the Hero is missing with assertions that the home video is present and the installation placeholder remains:

```ts
test('uses supplied media while preserving the missing install fallback', async ({
  page,
}) => {
  await page.goto('');

  await expect(
    page.locator('video[aria-label="梦潮 App 首页操作演示"]'),
  ).toBeVisible();
  await expect(page.getByText('01 · 下载与安装')).toBeVisible();
  await expect(page.getByText('媒体素材待补充')).toBeVisible();
});
```

- [ ] **Step 2: Document all actual media files**

Replace the obsolete all-English placeholder-only list in `public/media/README.md` with the nine actual root-level filenames, their page placements, and the remaining expected placeholder `tutorial/01-install.gif`. State that MP4 is preferred over GIF for operation demos and that filenames containing spaces or Chinese characters are supported through Vite’s public asset URL handling.

- [ ] **Step 3: Run all unit tests, lint, and production build**

Run:

```powershell
corepack pnpm lint
corepack pnpm test:run
corepack pnpm build
```

Expected: all commands exit with code 0.

- [ ] **Step 4: Run responsive E2E tests**

Run:

```powershell
corepack pnpm test:e2e
```

Expected: all tests pass at 375px, 768px, 1024px, and 1440px with no horizontal overflow.

- [ ] **Step 5: Inspect final working-tree scope**

Run:

```powershell
git status --short
git diff -- src/components/MediaFrame.tsx src/components/MediaFrame.test.tsx src/components/FeatureStory.tsx src/components/Hero.tsx src/components/Tutorial.tsx src/content/siteContent.ts src/styles.css src/App.test.tsx e2e/site.spec.ts public/media/README.md docs/superpowers/specs/2026-07-21-media-replacement-design.md docs/superpowers/plans/2026-07-21-media-replacement.md
```

Expected: only the requested media implementation, tests, documentation, the supplied assets, and pre-existing user modifications are present; no commit is created.
