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
  await page.getByRole('button', { name: 'Abrir tu recorrido' }).click();
  await page.getByRole('button', { name: 'Reiniciar recorrido' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
  expect(errors).toEqual([]);
});

test('the final landscape freezes on pause and animates again on resume', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await page.getByRole('button', { name: 'Un último deseo' }).click();
  await page
    .getByRole('button', { name: 'Continuar sin mantener pulsado' })
    .click();
  await page.getByRole('button', { name: 'Quedarme en el jardín' }).click();
  await page.getByRole('button', { name: 'Descansar en el jardín' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'BENCH');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.waitForTimeout(300);
  const frozen = await page.locator('canvas').screenshot();
  await page.waitForTimeout(600);
  expect(await page.locator('canvas').screenshot()).toEqual(frozen);
  await page.getByRole('button', { name: 'Reanudar', exact: true }).click();
  await page.waitForTimeout(900);
  expect(await page.locator('canvas').screenshot()).not.toEqual(frozen);
  expect(errors).toEqual([]);
});
