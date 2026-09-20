import { test, expect } from '@playwright/test';

test('automatic story waits for reading, reaches the bench, and can revisit chapters', async ({
  page,
}) => {
  test.setTimeout(100000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('radio', { name: /^Ver la historia/ }).check();
  await page.getByRole('button', { name: 'Comenzar la historia' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Estas flores son para ti.' }),
  ).toBeVisible({ timeout: 35000 });
  await page.waitForTimeout(5000);
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'FINALE');
  await page.getByRole('button', { name: 'Continuar la historia' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'BENCH', {
    timeout: 40000,
  });
  await page.getByRole('button', { name: 'Abrir tu recorrido' }).click();
  await expect(
    page.getByRole('button', { name: /12 · Un momento más/ }),
  ).toHaveAttribute('aria-current', 'step');
  await page.getByLabel('Modo de recorrido').selectOption('guided');
  await page.getByRole('button', { name: /07 · La carta/ }).click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'CARD_READY',
  );
  await page.getByRole('button', { name: 'Leer mi carta' }).click();
  await page.getByRole('button', { name: 'Cerrar nota' }).click();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'WIND');
  expect(errors).toEqual([]);
});

test('pause holds an animation and the guided route exposes clear navigation', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  const stage = await page.locator('main').getAttribute('data-stage');
  await page.waitForTimeout(6500);
  await expect(page.locator('main')).toHaveAttribute('data-stage', stage!);
  await expect(page.locator('main')).toHaveAttribute('data-paused', 'true');
  await page.getByRole('button', { name: 'Reanudar', exact: true }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GARDEN', {
    timeout: 20000,
  });
  await page.getByRole('button', { name: 'Abrir tu recorrido' }).click();
  await expect(
    page.getByRole('button', { name: /12 · Un momento más/ }),
  ).toBeDisabled();
  await page.getByRole('button', { name: /02 · Crecimiento/ }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GROWING');
  await page.getByRole('button', { name: 'Anterior', exact: true }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
  await page.waitForTimeout(5500);
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
  await expect(
    page.getByRole('button', { name: 'Plantar mi semilla' }),
  ).toBeEnabled();
});

test('pausing automatic advance and switching modes cancels the pending step', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('radio', { name: /^Ver la historia/ }).check();
  await page.getByRole('button', { name: 'Comenzar la historia' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GARDEN');
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.waitForTimeout(5500);
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GARDEN');
  await page.getByRole('button', { name: 'Abrir tu recorrido' }).click();
  await page.getByLabel('Modo de recorrido').selectOption('guided');
  await page.getByRole('button', { name: 'Cerrar recorrido' }).click();
  await expect(
    page.getByRole('button', { name: 'Abrir tu recorrido' }),
  ).toBeFocused();
  await page.getByRole('button', { name: 'Reanudar', exact: true }).click();
  await page.waitForTimeout(5500);
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GARDEN');
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'BOUQUET');
  await page.getByRole('button', { name: 'Abrir tu recorrido' }).click();
  await page.getByRole('button', { name: 'Reiniciar recorrido' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
});
