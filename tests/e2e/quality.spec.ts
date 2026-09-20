import { test, expect } from '@playwright/test';

test('quality changes preserve the canvas, story and keyboard focus', async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?seed=ana');
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GARDEN');
  const canvas = page.locator('canvas');
  await canvas.evaluate((element) => {
    element.dataset.original = 'true';
  });
  const trigger = page.getByRole('button', { name: 'Ajustes del jardín' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'A tu ritmo.' });
  const select = page.getByLabel('Calidad del jardín', { exact: true });
  await select.selectOption('low');
  await expect(page.locator('main')).toHaveAttribute('data-quality', 'low');
  const low = await canvas.evaluate(
    (element) => (element as HTMLCanvasElement).width / element.clientWidth,
  );
  expect(low).toBeLessThanOrEqual(1.01);
  await expect(dialog.getByRole('status')).toContainText('Ligera');
  await page.screenshot({
    path: `test-results/quality-${test.info().project.name}.png`,
    fullPage: true,
  });
  await select.selectOption('high');
  await expect(page.locator('main')).toHaveAttribute('data-quality', 'high');
  const high = await canvas.evaluate(
    (element) => (element as HTMLCanvasElement).width / element.clientWidth,
  );
  if (isMobile) expect(high).toBeGreaterThan(low);
  expect(high).toBeLessThanOrEqual(1.76);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(dialog).not.toBeVisible();
  await expect(canvas).toHaveAttribute('data-original', 'true');
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GARDEN');
  await trigger.click();
  await select.selectOption('low');
  await page.getByRole('button', { name: 'Cerrar ajustes' }).click();
  await page.getByRole('button', { name: 'Un último deseo' }).click();
  await page
    .getByRole('button', { name: 'Continuar sin mantener pulsado' })
    .click();
  await page
    .getByRole('button', { name: 'Un mensaje entre las luces' })
    .click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'TEXT_READY',
  );
  await page.screenshot({
    path: `test-results/quality-text-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Abrir tu recorrido' }).click();
  await page.getByRole('button', { name: 'Reiniciar recorrido' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-quality', 'low');
  expect(errors).toEqual([]);
});
