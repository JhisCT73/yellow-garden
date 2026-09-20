import { seededRandom } from '../utils/random';

/** Uniform area sampling avoids the vertical seam caused by radial sampling. */
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
  function inside(x: number, y: number) {
    let hit = false;
    for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
      const [ax, ay] = outline[i],
        [bx, by] = outline[j];
      if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax)
        hit = !hit;
    }
    return hit;
  }
  for (let i = 0; i < count; i++) {
    let x: number, y: number;
    do {
      x = (random() * 2 - 1) * 1.52;
      y = -1.615 + random() * 2.75;
    } while (!inside(x, y));
    points.set([x, y + 2.4, (random() - 0.5) * 0.6], i * 3);
  }
  return points;
}
