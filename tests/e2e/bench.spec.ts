import { test, expect } from '@playwright/test';

test('the closing bench is reachable, returns focus, and can restart', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?seed=primavera');
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await page.getByRole('button', { name: 'Un último deseo' }).click();
  await page
    .getByRole('button', { name: 'Continuar sin mantener pulsado' })
    .click();
  await page.getByRole('button', { name: 'Quedarme en el jardín' }).click();
  await page.getByRole('button', { name: '¿Una última sorpresa?' }).click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'SECRET_READY',
  );
  await page.getByRole('button', { name: 'Un momento más' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'BENCH');
  await expect(
    page.getByRole('button', { name: 'Volver a mi primavera' }),
  ).toBeFocused();
  await page.getByRole('button', { name: 'Volver a mi primavera' }).click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'FREE_EXPLORE',
  );
  await page.getByRole('button', { name: 'Descansar en el jardín' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'BENCH');
  await page.getByRole('link', { name: 'Yellow Garden, inicio' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
  expect(errors).toEqual([]);
});
