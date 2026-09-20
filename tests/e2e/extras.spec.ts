import { test, expect, type Page } from '@playwright/test';

async function heart(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?seed=primavera');
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await page.getByRole('button', { name: 'Un último deseo' }).click();
  await page
    .getByRole('button', { name: 'Continuar sin mantener pulsado' })
    .click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'CELEBRATION',
  );
}

test('heart particles form a readable message and can return to the garden', async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  if (isMobile)
    await page.addInitScript(() =>
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 }),
    );
  await heart(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page
    .getByRole('button', { name: 'Un mensaje entre las luces' })
    .click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'TEXT_FORMING',
  );
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'TEXT_READY',
    { timeout: 7000 },
  );
  await expect(
    page.getByText('Feliz primavera. 21 · 09', { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/text-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Quedarme en el jardín' }).click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'FREE_EXPLORE',
  );
  await page.screenshot({
    path: `test-results/flowers-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test('the message supports reduced motion and a transition can be cancelled', async ({
  page,
}) => {
  await heart(page);
  await page
    .getByRole('button', { name: 'Un mensaje entre las luces' })
    .click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'TEXT_READY',
  );
  await page.getByRole('button', { name: 'Quedarme en el jardín' }).click();
  await page.getByRole('button', { name: 'Pedir otro deseo' }).click();
  await page
    .getByRole('button', { name: 'Continuar sin mantener pulsado' })
    .click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page
    .getByRole('button', { name: 'Un mensaje entre las luces' })
    .click();
  await page.getByRole('link', { name: 'Yellow Garden, inicio' }).click();
  await page.waitForTimeout(3200);
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
});

test('the optional secret works by keyboard and preserves story state and focus', async ({
  page,
}) => {
  await page.goto('/?seed=ana');
  const trigger = page.getByRole('button', {
    name: 'Descubrir el secreto del jardín',
  });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'La raíz de todo.' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('seed ............. ana');
  await page.getByRole('button', { name: '> execute happiness' }).click();
  await expect(dialog.getByRole('status')).toContainText('SUCCESS');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GROWING');
});
