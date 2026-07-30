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
    await expect(page.getByRole('heading', { level: 1, name: '潮落有迹，梦醒留痕。' })).toBeVisible();
  });
}

test('navigation opens focused subpages', async ({ page }) => {
  await page.goto('');
  await page.getByRole('link', { name: '功能' }).click();
  await expect(page.getByRole('heading', { name: '从一段刚醒的记忆，到一份完整的梦境档案。' })).toBeVisible();
  await page.getByRole('link', { name: '使用指南' }).click();
  await expect(page.getByRole('heading', { name: '下载并安装梦潮' })).toBeVisible();
});

test('gallery switches to the supplied word cloud video', async ({ page }) => {
  await page.goto('#/features');
  await page.getByRole('tab', { name: /词云回看/ }).click();
  await expect(page.locator('video[aria-label="通过词云回看相关梦境"]')).toBeVisible();
  await expect(page.locator('.feature-card img, .feature-card video')).toHaveCount(0);
});

test('install section uses a download control and no media placeholder', async ({ page }) => {
  await page.goto('#/guide');
  const install = page.getByRole('heading', { name: '下载并安装梦潮' }).locator('..').locator('..');
  await expect(install.locator('.download-panel')).toBeVisible();
  await expect(install.locator('img, video')).toHaveCount(0);
});
