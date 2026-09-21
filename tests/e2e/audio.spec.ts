import { audioFixture } from '../../scripts/audio-fixture.mjs';
import { test, expect } from '@playwright/test';

test('local soundtrack starts on demand, pauses and resumes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('audio[data-soundtrack]')).toHaveCount(0);
  await page.getByLabel('Elegir música', { exact: true }).click();
  const zone = page.getByRole('button', { name: /Arrastra tu canción aquí/ });
  const invalidDrop = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.items.add(new File(['text'], 'notes.txt', { type: 'text/plain' }));
    return data;
  });
  await zone.dispatchEvent('drop', { dataTransfer: invalidDrop });
  await expect(page.getByRole('alert')).toContainText('no es de audio');
  await expect(page.locator('audio[data-soundtrack]')).toHaveCount(0);
  const fixture = audioFixture();
  const dataTransfer = await page.evaluateHandle(
    (bytes) => {
      const data = new DataTransfer();
      data.items.add(
        new File([new Uint8Array(bytes)], 'test.wav', { type: 'audio/wav' }),
      );
      return data;
    },
    [...fixture.buffer],
  );
  await zone.dispatchEvent('drop', { dataTransfer });
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.filename')).toHaveText('test.wav');
  await invalidDrop.dispose();
  await dataTransfer.dispose();
  await page.screenshot({
    path: `test-results/music-picker-${test.info().project.name}.png`,
  });
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
