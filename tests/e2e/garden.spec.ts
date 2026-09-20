import { expect, test } from '@playwright/test';

test('complete gift, discovery, accessible note and replay', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?seed=ana');
  await expect(
    page.getByRole('button', { name: 'Plantar mi semilla' }),
  ).toBeEnabled();
  await page.screenshot({
    path: `test-results/intro-${test.info().project.name}.png`,
  });
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GROWING');
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GARDEN', {
    timeout: 20000,
  });
  await page.screenshot({
    path: `test-results/garden-${test.info().project.name}.png`,
  });
  await page.getByRole('button', { name: 'Descubrir una flor' }).click();
  await expect(page.getByRole('status')).toContainText('Las cosas bonitas');
  await page.getByRole('button', { name: 'Una nota para ti' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Una nota para ti' }),
  ).toBeFocused();
  await page.getByRole('link', { name: 'Yellow Garden, inicio' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test('reduced motion can complete the story without waiting for animations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GARDEN', {
    timeout: 5000,
  });
});

test('a browser without WebGL still receives the gift', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith('webgl')) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto('/');
  await expect(
    page.getByText('Este dispositivo no pudo abrir el jardín 3D.'),
  ).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: 'Tu jardín' })
      .getByText('Que nunca te falten motivos para florecer.'),
  ).toBeVisible();
});
