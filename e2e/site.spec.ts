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
    await expect(page.getByRole('heading', { level: 1, name: /梦醒以后，\s*仍有迹可循/ })).toBeVisible();
  });
}

test('navigation opens the combined App page', async ({ page }) => {
  await page.goto('');
  await page.getByRole('button', { name: '前往下载' }).click();
  await page.getByRole('link', { name: '功能与使用说明' }).click();
  await expect(page.getByRole('heading', { name: /记录梦境，.*随时回来看看。/ })).toBeVisible();
  await expect(page.locator('.app-deck')).toBeVisible();
  await expect(page.locator('.app-section')).toHaveCount(7);
  await page.mouse.move(400, 400);
  await page.mouse.wheel(0, 650);
  await expect.poll(() => page.locator('.app-deck').evaluate((deck) =>
    Math.round(deck.scrollLeft / deck.clientWidth))).toBe(1);
  await expect(page.getByRole('heading', { name: '下载并安装梦潮' })).toBeVisible();
});

test('each App area keeps its media and guide together', async ({ page }) => {
  await page.goto('#/app');
  await expect(page.locator('.app-section')).toHaveCount(7);
  await expect(page.locator('.app-section__media--single')).toHaveCount(1);
  await expect(page.locator('.app-section__gallery')).toHaveCount(6);

  await expect(page.locator('.app-section video')).toHaveCount(0);
  const writing = page.locator('#app-section-02');
  await writing.getByRole('tab', { name: /恢复暂存/ }).click();
  await expect(writing.locator('img[src$="/media/app/write-restore.webp"]')).toBeVisible();

  const detail = page.locator('#app-section-03');

  await detail.locator('summary').click();
  await expect(detail.getByRole('heading', { name: '「注记」与 AI 释梦' })).toBeVisible();
});

test('legacy feature and guide hashes resolve to the combined App page', async ({ page }) => {
  for (const route of ['#/features', '#/guide']) {
    await page.goto(route);
    await expect(page.locator('.app-section')).toHaveCount(7);
  }
});
