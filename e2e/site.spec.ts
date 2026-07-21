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
      page.getByRole('heading', {
        level: 1,
        name: '梦醒以后，仍有迹可循',
      }),
    ).toBeVisible();
  });
}

test('mobile navigation reaches the tutorial with a touch-sized control', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 760 });
  await page.goto('');

  const menu = page.getByRole('button', { name: '打开导航' });
  const bounds = await menu.boundingBox();
  expect(bounds?.width).toBeGreaterThanOrEqual(44);
  expect(bounds?.height).toBeGreaterThanOrEqual(44);

  await menu.click();
  await page.getByRole('link', { name: '使用方法' }).click();
  await expect(page.locator('#guide')).toBeInViewport();
});

test('missing media keeps a visible branded placeholder', async ({ page }) => {
  await page.goto('');
  await expect(page.getByText('梦潮首页主截图')).toBeVisible();
  await expect(page.getByText('截图 / GIF 待替换').first()).toBeVisible();
});

test('desktop hero uses the editorial two-column composition', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('');

  await expect(page.locator('.hero')).toHaveCSS('display', 'grid');
});
