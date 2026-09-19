import { expect, test, type Page } from '@playwright/test';

async function garden(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?seed=primavera');
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GARDEN');
}

test('flowers gather, a short pull resets, and a full pull reveals a readable card', async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await garden(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Crear mi ramo' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'GATHERING');
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'BOUQUET', {
    timeout: 10000,
  });
  await page.screenshot({
    path: `test-results/bouquet-${test.info().project.name}.png`,
    fullPage: true,
  });
  const handle = page.getByRole('button', {
    name: 'Tirar de la cinta',
    exact: true,
  });
  await handle.scrollIntoViewIfNeeded();
  let box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2, {
    steps: 4,
  });
  await page.mouse.up();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'BOUQUET');
  box = (await handle.boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  if (isMobile) {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }],
    });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x + 100, y }],
    });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    await session.detach();
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 110, y, { steps: 10 });
    await page.mouse.up();
  }
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'CARD_READY',
    { timeout: 10000 },
  );
  await page.screenshot({
    path: `test-results/card-revealed-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Leer mi carta' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'CARD_READY',
  );
  await expect(
    page.getByRole('button', { name: 'Leer mi carta' }),
  ).toBeFocused();
  await page.getByRole('button', { name: 'Volver a florecer' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
  expect(errors).toEqual([]);
});

test('keyboard and reduced motion complete the bouquet without a drag', async ({
  page,
}) => {
  await garden(page);
  await page.getByRole('button', { name: 'Crear mi ramo' }).click();
  await expect(
    page.getByRole('button', { name: 'Desatar sin arrastrar' }),
  ).toBeFocused();
  const handle = page.getByRole('button', {
    name: 'Tirar de la cinta',
    exact: true,
  });
  await handle.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toHaveAttribute(
    'data-stage',
    'CARD_READY',
  );
  await page.getByRole('button', { name: 'Leer mi carta' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('restart cancels an in-flight bouquet and ignores its old completion', async ({
  page,
}) => {
  await garden(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Crear mi ramo' }).click();
  await page.getByRole('button', { name: 'Volver a florecer' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
  // Cover the original animation's completion window to detect a stale callback.
  await page.waitForTimeout(4000);
  await expect(page.locator('main')).toHaveAttribute('data-stage', 'INTRO');
});
