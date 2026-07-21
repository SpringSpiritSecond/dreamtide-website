# Dreamtide Feature Usage Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the two privacy-video placements and explain each feature through concrete entry, action, and result steps.

**Architecture:** Extend existing feature content with step lists and media arrays. Reuse `MediaFrame`; do not add dependencies or a new page section.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Playwright

## Global Constraints

- `不谈人间事.mp4` and `春梦了无痕.mp4` belong to privacy browsing.
- Keep all nine supplied assets visible.
- Preserve missing-media placeholders where no correct demo exists.
- Preserve unrelated `README.md` and `COMMITS.md` changes.

---

### Task 1: Correct content structure and media placement

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/content/siteContent.ts`
- Modify: `src/components/FeatureStory.tsx`
- Modify: `src/styles.css`
- Modify: `public/media/README.md`

**Interfaces:**
- Change `Feature.media?: Media` to `Feature.media?: Media[]`
- Add `Feature.steps: string[]`

- [ ] **Step 1: Add failing tests**

Add an App test that finds the article headed `隐私浏览时，决定哪些内容被看见`, verifies both privacy video sources are inside it, and checks the visible instructions `显、隐、化` and `删除动画隐藏，打字动画恢复`.

```tsx
const privacyHeading = screen.getByRole('heading', {
  name: '隐私浏览时，决定哪些内容被看见',
});
const privacyArticle = privacyHeading.closest('article');
expect(privacyArticle).not.toBeNull();
expect(
  privacyArticle?.querySelector('video[src$="/media/不谈人间事.mp4"]'),
).toBeInTheDocument();
expect(
  privacyArticle?.querySelector('video[src$="/media/春梦了无痕.mp4"]'),
).toBeInTheDocument();
expect(screen.getByText(/显、隐、化/)).toBeVisible();
expect(screen.getByText(/删除动画隐藏，打字动画恢复/)).toBeVisible();
```

Run `corepack pnpm exec vitest run src/App.test.tsx`; expect failure because privacy browsing has no dedicated article.

- [ ] **Step 2: Replace feature data**

Create five features with concise descriptions plus exact operation steps:

1. `写下并保存一场梦`：首页点“新增/刻梦” → 写正文 → 暂存或正式保存；use missing `media/features/record.webp`.
2. `用标签和注记整理梦`：保存后点“标/注” → 添加情绪、场景、内容、分类、人物标签 → 全文或划选片段注记；use `编辑-隐.jpg`.
3. `隐私浏览时，决定哪些内容被看见`：点“隐”并选择模式、划选正文、确认；`不谈人间事` cycles `显、隐、化`; `春梦了无痕` uses `删除动画隐藏，打字动画恢复`; use both privacy videos.
4. `从档案和词云重新找到梦`：进入档案 → 搜索或筛选 → 打开正文；也可点击词云进入相关梦境；use `档案.jpg`.
5. `数据留在本机`：设置中导出 JSON → 自行保管；state no cloud sync or restore; no media.

Restore tutorial step 02 to missing `media/tutorial/02-record.gif`; the two privacy videos must appear only in feature 03.

- [ ] **Step 3: Render steps and media arrays**

In `FeatureStory.tsx`, render:

```tsx
<ol className="feature__steps">
  {feature.steps.map((step) => <li key={step}>{step}</li>)}
</ol>
```

Render media through `.feature__media`, mapping every `Media` to `MediaFrame`.

- [ ] **Step 4: Add minimal responsive styles**

Style `.feature__steps` as readable numbered instructions and `.feature__media` as a centered grid. Use two columns only for multiple media on wide screens; collapse to one column below 760px. Update even-feature grid selectors from `.media-frame` to `.feature__media`.

- [ ] **Step 5: Update media documentation and verify**

Describe both videos as privacy browsing in `public/media/README.md`.

Run:

```powershell
corepack pnpm lint
corepack pnpm test:run
corepack pnpm build
corepack pnpm test:e2e
```

Expected: all commands exit 0; 375–1440px E2E overflow checks pass.
