import { seededRandom } from '../utils/random';

export function heartCloud(seed: string, count: number) {
  const random = seededRandom(seed + '-heart');
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    // Keep a defined silhouette while filling its interior and depth.
    const radius = i % 3 === 0 ? 0.95 + random() * 0.05 : Math.sqrt(random());
    points[i * 3] = 16 * Math.sin(angle) ** 3 * radius * 0.095;
    points[i * 3 + 1] =
      (13 * Math.cos(angle) -
        5 * Math.cos(2 * angle) -
        2 * Math.cos(3 * angle) -
        Math.cos(4 * angle)) *
        radius *
        0.095 +
      2.4;
    points[i * 3 + 2] =
      (random() - 0.5) * 0.65 * Math.sqrt(1 - radius * radius);
  }
  return points;
}
