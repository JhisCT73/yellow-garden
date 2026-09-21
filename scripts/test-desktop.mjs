import { _electron as electron, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const executablePath = process.env.DESKTOP_EXECUTABLE;
const application = await electron.launch({
  ...(executablePath
    ? { executablePath: path.resolve(executablePath), args: ['--smoke-test'] }
    : { args: ['.', '--smoke-test'] }),
  timeout: 60000,
});
try {
  const page = await application.firstWindow();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.context().setOffline(true);
  await page.reload();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page
    .getByRole('button', { name: 'Plantar mi semilla' })
    .waitFor({ timeout: 60000 });
  assert.equal(await page.locator('.brand-name').textContent(), 'ZyXer Labs');
  assert.equal(await page.evaluate(() => typeof window.require), 'undefined');
  assert.equal(
    await page
      .locator('.brand-mark')
      .evaluate((img) => img.complete && img.naturalWidth > 0),
    true,
  );
  await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
  await page.locator('main[data-stage="GARDEN"]').waitFor({ timeout: 60000 });
  assert.equal(await page.locator('canvas').count(), 1);
  const preferences = await application.evaluate(({ BrowserWindow }) => {
    const { nodeIntegration, contextIsolation, sandbox, webSecurity } =
      BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences();
    return { nodeIntegration, contextIsolation, sandbox, webSecurity };
  });
  assert.deepEqual(preferences, {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    webSecurity: true,
  });
  await page.getByRole('button', { name: 'Abrir tu recorrido' }).click();
  await page.getByRole('heading', { name: 'Tu recorrido' }).waitFor();
  await page.getByRole('button', { name: 'Cerrar recorrido' }).click();
  await page
    .getByRole('button', { name: 'Activar sonido', exact: true })
    .click();
  const soundtrack = page.locator('audio[data-soundtrack]');
  await expect
    .poll(() => soundtrack.evaluate((audio) => audio.currentTime), {
      timeout: 30000,
    })
    .toBeGreaterThan(0.5);
  assert.equal(
    await soundtrack.evaluate(
      (audio) => audio.loop && audio.duration > 60 && !audio.paused,
    ),
    true,
  );
  await page
    .getByRole('button', { name: 'Silenciar sonido', exact: true })
    .click();
  assert.equal(await soundtrack.evaluate((audio) => audio.paused), true);
  const pausedAt = await soundtrack.evaluate((audio) => audio.currentTime);
  await page
    .getByRole('button', { name: 'Activar sonido', exact: true })
    .click();
  await expect
    .poll(() => soundtrack.evaluate((audio) => audio.currentTime))
    .toBeGreaterThan(pausedAt + 0.3);
  await page
    .getByRole('button', { name: 'Silenciar sonido', exact: true })
    .click();
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/desktop-app.png' });
  await page.getByRole('button', { name: 'Ajustes del jardín' }).click();
  await page
    .getByText('Acerca del proyecto · ZyXer Labs', { exact: true })
    .click();
  await page
    .getByText('Un jardín para disfrutar en tu navegador', { exact: false })
    .waitFor();
  await page.screenshot({ path: 'test-results/desktop-about.png' });
  assert.deepEqual(errors, []);
  console.log(
    'Desktop smoke passed: local assets, WebGL garden, brand, navigation, isolated renderer.',
  );
} finally {
  await application.close();
}
