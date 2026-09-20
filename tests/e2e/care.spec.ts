import { test, expect } from '@playwright/test';

test('care can be selected by keyboard and persists through planting and restart', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?seed=ana');
  await expect(
    page.getByRole('radio', { name: 'Luz', exact: true }),
  ).toBeChecked();
  await page.getByRole('radio', { name: 'Luz', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('radio', { name: 'Agua', exact: true }),
  ).toBeChecked();
  await expect(page.locator('main')).toHaveAttribute('data-care', 'water');
  await page.screenshot({
    path: `test-results/care-intro-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GARDEN');
  await expect(page.locator('main')).toHaveAttribute('data-care', 'water');
  await page.screenshot({
    path: `test-results/care-water-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Abrir tu recorrido' }).click();
  await page.getByRole('button', { name: 'Reiniciar recorrido' }).click();
  await expect(
    page.getByRole('radio', { name: 'Agua', exact: true }),
  ).toBeChecked();
  await page.getByRole('radio', { name: 'Música', exact: true }).check();
  await expect(
    page.getByRole('button', { name: 'Activar sonido' }),
  ).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Activar sonido' }).click();
  await expect(
    page.getByRole('button', { name: 'Silenciar sonido' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GARDEN');
  await page.getByRole('button', { name: 'Descubrir una flor' }).click();
  await page.getByRole('button', { name: 'Silenciar sonido' }).click();
  await expect(
    page.getByRole('button', { name: 'Activar sonido' }),
  ).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
});
