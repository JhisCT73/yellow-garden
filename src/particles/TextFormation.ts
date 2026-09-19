import { seededRandom } from '../utils/random';

/** Samples local system-font glyphs; no font downloads or text textures at runtime. */
export function textCloud(seed: string, count: number, date: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 340;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const points = new Float32Array(count * 3);
  if (!context) return points;
  context.fillStyle = '#fff';
  context.textAlign = 'center';
  context.font = 'bold 76px Arial';
  context.fillText('FELIZ', 300, 105);
  context.fillText('PRIMAVERA', 300, 205);
  context.font = 'bold 52px Arial';
  context.fillText(date, 300, 290, 540);
  const pixels = context.getImageData(0, 0, 600, 340).data;
  const candidates: [number, number][] = [];
  for (let y = 0; y < 340; y += 3)
    for (let x = 0; x < 600; x += 3) {
      if (pixels[(y * 600 + x) * 4 + 3] > 100) candidates.push([x, y]);
    }
  if (!candidates.length) return points;
  const random = seededRandom(seed + '-letter');
  // Randomize the mapping so heart particles travel across different letters.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const lines = [
    candidates.filter(([, y]) => y < 130),
    candidates.filter(([, y]) => y >= 130 && y < 225),
    candidates.filter(([, y]) => y >= 225),
  ];
  for (let i = 0; i < count; i++) {
    const fraction = i / count;
    const line = lines[fraction < 0.25 ? 0 : fraction < 0.75 ? 1 : 2];
    const [x, y] = (line.length ? line : candidates)[
      i % (line.length || candidates.length)
    ];
    points.set(
      [(x - 300) * 0.0068, (170 - y) * 0.0068 + 2.4, (random() - 0.5) * 0.05],
      i * 3,
    );
  }
  return points;
}
