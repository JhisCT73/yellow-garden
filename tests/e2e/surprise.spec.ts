import { test, expect, type Page } from '@playwright/test';

async function explore(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?seed=primavera');
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await page.getByRole('button', { name: 'Un último deseo' }).click();
  await page
    .getByRole('button', { name: 'Continuar sin mantener pulsado' })
    .click();
  await page.getByRole('button', { name: 'Quedarme en el jardín' }).click();
}

test('the last flower grows, returns to exploration and can be repeated without errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await explore(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: '¿Una última sorpresa?' }).click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'SECRET_BLOOM',
  );
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'SECRET_READY',
    { timeout: 7000 },
  );
  const back = page.getByRole('button', { name: 'Volver a mi primavera' });
  await expect(back).toBeFocused();
  await page.screenshot({
    path: `test-results/surprise-${test.info().project.name}.png`,
    fullPage: true,
  });
  await back.click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'FREE_EXPLORE',
  );
  await page.getByRole('button', { name: 'Descubrir una flor' }).click();
  await expect(page.locator('.flower-message')).toHaveClass(/visible/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const trigger = page.getByRole('button', { name: '¿Una última sorpresa?' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'SECRET_READY',
  );
  await expect(page.locator('.flower-message')).not.toHaveClass(/visible/);
  await page.getByRole('link', { name: 'Yellow Garden, inicio' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
  expect(errors).toEqual([]);
});

test('restart cancels the last flower animation and its completion', async ({
  page,
}) => {
  await explore(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: '¿Una última sorpresa?' }).click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'SECRET_BLOOM',
  );
  await page.getByRole('link', { name: 'Yellow Garden, inicio' }).click();
  await page.waitForTimeout(3800);
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GARDEN');
});
