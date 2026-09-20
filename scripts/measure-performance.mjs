import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const report = {
  measuredAt: new Date().toISOString(),
  note: 'Local headless Chromium frame timing. Mobile is viewport emulation, not physical hardware. These results are not a phone FPS guarantee.',
  samples: [],
};
try {
  for (const device of [
    { name: 'desktop', width: 1013, height: 761, dpr: 1 },
    { name: 'mobile-emulated', width: 390, height: 844, dpr: 3 },
  ]) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: device.dpr,
    });
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5173/?seed=primavera');
    await page.getByRole('button', { name: 'Plantar mi semilla' }).click();
    await page.locator('main[data-stage="GARDEN"]').waitFor({ timeout: 30000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const mode of ['low', 'high']) {
      await page.getByRole('button', { name: 'Ajustes del jardín' }).click();
      await page
        .getByLabel('Calidad del jardín', { exact: true })
        .selectOption(mode);
      await page.getByRole('button', { name: 'Cerrar ajustes' }).click();
      await page.waitForTimeout(3000);
      const result = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const samples = [];
            let previous = performance.now();
            const start = previous;
            function frame(now) {
              samples.push(now - previous);
              previous = now;
              if (now - start < 6000) {
                requestAnimationFrame(frame);
                return;
              }
              const sorted = [...samples].sort((a, b) => a - b);
              const canvas = document.querySelector('canvas');
              const gl = canvas.getContext('webgl2');
              const debug = gl?.getExtension('WEBGL_debug_renderer_info');
              resolve({
                frames: samples.length,
                durationMs: now - start,
                averageFps: (1000 * samples.length) / (now - start),
                medianFrameMs: sorted[Math.floor(sorted.length * 0.5)],
                p95FrameMs: sorted[Math.floor(sorted.length * 0.95)],
                buffer: [canvas.width, canvas.height],
                renderer: debug
                  ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
                  : 'unavailable',
              });
            }
            requestAnimationFrame(frame);
          }),
      );
      report.samples.push({ device: device.name, mode, ...result });
    }
    await context.close();
  }
} finally {
  await browser.close();
}
await writeFile(
  'docs/performance-local.json',
  JSON.stringify(report, null, 2) + '\n',
);
console.log(JSON.stringify(report, null, 2));
