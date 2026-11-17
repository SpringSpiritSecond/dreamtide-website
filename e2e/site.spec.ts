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

test('download chapter offers the latest Android build', async ({ page }) => {
  await page.goto('');
  await page.getByRole('button', { name: '前往下载' }).click();
  await expect(page.getByRole('heading', { name: '下载梦潮' })).toBeVisible();
  await expect(page.getByRole('link', { name: /下载 Android 版/ })).toHaveAttribute('href', /download\/DreamTide\.apk$|github\.com\/SpringSpiritSecond\/dreamtide-website\/releases/);
});

test('old features, guide and download addresses land on the home page', async ({ page }) => {
  for (const route of ['#/app', '#/features', '#/guide']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1, name: /梦醒以后，\s*仍有迹可循/ })).toBeVisible();
  }
  await page.goto('#/download');
  await expect(page.getByRole('heading', { name: '下载梦潮' })).toBeVisible();
});
