import { audioFixture } from '../../scripts/audio-fixture.mjs';
import { test, expect } from '@playwright/test';

test('local soundtrack starts on demand, pauses and resumes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('audio[data-soundtrack]')).toHaveCount(0);
  await page.getByLabel('Elegir música', { exact: true }).click();
  await page
    .getByLabel('Elegir archivo de audio')
    .setInputFiles(audioFixture());
  await page.getByLabel('Elegir música', { exact: true }).click();
  await page
    .getByRole('button', { name: 'Activar sonido', exact: true })
    .click();
  const audio = page.locator('audio[data-soundtrack]');
  await expect
    .poll(
      () => audio.evaluate((element: HTMLAudioElement) => element.currentTime),
      { timeout: 30000 },
    )
    .toBeGreaterThan(0.5);
  expect(
    await audio.evaluate(
      (element: HTMLAudioElement) => element.duration >= 4 && element.loop,
    ),
  ).toBe(true);
  await page
    .getByRole('button', { name: 'Silenciar sonido', exact: true })
    .click();
  expect(
    await audio.evaluate((element: HTMLAudioElement) => element.paused),
  ).toBe(true);
  const pausedAt = await audio.evaluate(
    (element: HTMLAudioElement) => element.currentTime,
  );
  await page.waitForTimeout(500);
  expect(
    await audio.evaluate((element: HTMLAudioElement) => element.currentTime),
  ).toBe(pausedAt);
  await page
    .getByRole('button', { name: 'Activar sonido', exact: true })
    .click();
  await expect
    .poll(() =>
      audio.evaluate((element: HTMLAudioElement) => element.currentTime),
    )
    .toBeGreaterThan(pausedAt + 0.3);
  await page
    .getByRole('button', { name: 'Silenciar sonido', exact: true })
    .click();
  await page.getByLabel('Elegir música', { exact: true }).click();
  await page.getByRole('button', { name: 'Quitar música' }).click();
  await expect(audio).toHaveCount(0);
  await page.reload();
  await expect(page.locator('audio[data-soundtrack]')).toHaveCount(0);
});
