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
    await expect(page.getByRole('heading', { level: 1, name: /潮落有迹.*梦醒留痕。/ })).toBeVisible();
  });
}

test('navigation opens the combined App page', async ({ page }) => {
  await page.goto('');
  await page.getByRole('link', { name: '走进梦潮', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: /从梦醒的一刻.*到再次遇见。/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: '下载并安装梦潮' })).toBeVisible();
  await expect(page.locator('a[href="#/features"], a[href="#/guide"]')).toHaveCount(0);
});

test('each App area keeps its media and guide together', async ({ page }) => {
  await page.goto('#/app');
  await expect(page.locator('.app-section')).toHaveCount(6);
  await expect(page.locator('.app-section__media--single')).toHaveCount(4);
  await expect(page.locator('.app-section__gallery')).toHaveCount(2);

  const detail = page.locator('#app-section-03');
  await detail.getByRole('tab', { name: /春梦了无痕/ }).click();
  await expect(detail.locator('video[aria-label="隐藏与恢复私密片段的演示"]')).toBeVisible();

  await detail.locator('summary').click();
  await expect(detail.getByRole('heading', { name: '“注”与 AI 释梦' })).toBeVisible();
});

test('legacy feature and guide hashes resolve to the combined App page', async ({ page }) => {
  for (const route of ['#/features', '#/guide']) {
    await page.goto(route);
    await expect(page.locator('.app-section')).toHaveCount(6);
  }
});
