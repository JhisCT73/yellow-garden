import { seededRandom } from '../utils/random';

/** Area sampling with a soft edge bias avoids seams from radial sampling. */
export function heartCloud(seed: string, count: number) {
  const random = seededRandom(seed + '-heart');
  const points = new Float32Array(count * 3);
  const outline = Array.from({ length: 128 }, (_, i) => {
    const a = (i / 128) * Math.PI * 2;
    return [
      16 * Math.sin(a) ** 3 * 0.095,
      (13 * Math.cos(a) -
        5 * Math.cos(2 * a) -
        2 * Math.cos(3 * a) -
        Math.cos(4 * a)) *
        0.095,
    ];
  });
  function density(x: number, y: number) {
    let hit = false;
    let distanceSquared = Infinity;
    for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
      const [ax, ay] = outline[i],
        [bx, by] = outline[j];
      if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax)
        hit = !hit;
      const dx = bx - ax,
        dy = by - ay;
      const lengthSquared = dx * dx + dy * dy;
      const t = lengthSquared
        ? Math.max(
            0,
            Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lengthSquared),
          )
        : 0;
      distanceSquared = Math.min(
        distanceSquared,
        (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2,
      );
    }
    // A broad band, rather than a hard outline, keeps individual sparks irregular.
    return hit ? 0.09 + 0.91 * Math.exp(-distanceSquared / 0.045) : 0;
  }
  for (let i = 0; i < count; i++) {
    let x: number, y: number;
    do {
      x = (random() * 2 - 1) * 1.52;
      y = -1.615 + random() * 2.75;
    } while (random() >= density(x, y));
    points.set([x, y + 2.4, (random() - 0.5) * 0.6], i * 3);
  }
  return points;
}
