import { test, expect, type Page } from '@playwright/test';

test('the bouquet can reach the finale and restarting cancels a particle transition', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await page.getByRole('button', { name: 'Crear mi ramo' }).click();
  await page.getByRole('button', { name: 'Desatar sin arrastrar' }).click();
  await page.getByRole('button', { name: 'Leer mi carta' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Un último deseo' }).click();
  await page
    .getByRole('button', { name: 'Continuar sin mantener pulsado' })
    .click();
  await page.getByRole('button', { name: 'Quedarme en el jardín' }).click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'FREE_EXPLORE',
  );
  await page.getByRole('button', { name: 'Pedir otro deseo' }).click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page
    .getByRole('button', { name: 'Continuar sin mantener pulsado' })
    .click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'BURST');
  await page.getByRole('button', { name: 'Volver a florecer' }).click();
  await page.waitForTimeout(2500);
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
});

async function windScene(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?seed=primavera');
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await page.getByRole('button', { name: 'Un último deseo' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'WIND');
}

test('holding and releasing makes a heart, then restores the interactive garden', async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await windScene(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const hold = page.getByRole('button', { name: 'Mantener para crear viento' });
  const box = (await hold.boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  if (isMobile) {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }],
    });
    await expect(hold).toHaveClass(/holding/);
    await page.waitForTimeout(500);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    await session.detach();
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await expect(hold).toHaveClass(/holding/);
    await page.waitForTimeout(500);
    await page.mouse.up();
  }
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'BURST');
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'CELEBRATION',
    { timeout: 12000 },
  );
  await page.screenshot({
    path: `test-results/heart-${test.info().project.name}.png`,
    fullPage: true,
  });
  await expect(
    page.getByRole('button', { name: 'Quedarme en el jardín' }),
  ).toBeFocused();
  await page.getByRole('button', { name: 'Quedarme en el jardín' }).click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'FREE_EXPLORE',
  );
  await page.getByRole('button', { name: 'Descubrir una flor' }).click();
  await expect(page.getByRole('status')).toContainText('Las cosas bonitas');
  await page.getByRole('button', { name: 'Pedir otro deseo' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'WIND');
  expect(errors).toEqual([]);
});

test('keyboard cancellation and reduced-motion completion work without a pointer', async ({
  page,
}) => {
  await windScene(page);
  const hold = page.getByRole('button', { name: 'Mantener para crear viento' });
  await expect(hold).toBeFocused();
  await page.keyboard.down('Space');
  await expect(hold).toHaveClass(/holding/);
  await page.keyboard.press('Escape');
  await page.keyboard.up('Space');
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'WIND');
  await expect(hold).not.toHaveClass(/holding/);
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'CELEBRATION',
  );
  await page.getByRole('button', { name: 'Volver a florecer' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
});

test('a cancelled pointer does not release wind and the single-action alternative works', async ({
  page,
}) => {
  await windScene(page);
  const hold = page.getByRole('button', { name: 'Mantener para crear viento' });
  const box = (await hold.boundingBox())!;
  await page.mouse.move(box.x + 30, box.y + 20);
  await page.mouse.down();
  await hold.dispatchEvent('pointercancel');
  await page.mouse.up();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'WIND');
  await page
    .getByRole('button', { name: 'Continuar sin mantener pulsado' })
    .click();
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'CELEBRATION',
  );
});
