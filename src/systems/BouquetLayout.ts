import { seededRandom } from '../utils/random';

/** Offset focal flowers give the hand-tied bouquet an asymmetric silhouette. */
export function bouquetLayout(seed: string, count: number) {
  const random = seededRandom(seed + '-bouquet');
  return Array.from({ length: count }, (_, index) => {
    const angle = index * 2.399963;
    const radius = index === 0 ? 0 : 0.58 + Math.sqrt(index) * 0.22;
    const focalHeads: Record<number, [number, number, number]> = {
      0: [0.42, 3.5, 0.1],
      3: [-0.68, 2.65, 0.65],
      6: [0.78, 2.22, 0.52],
      9: [-0.44, 3.05, -0.42],
    };
    return {
      base: [(random() - 0.5) * 0.14, 0.55, (random() - 0.5) * 0.12] as [
        number,
        number,
        number,
      ],
      head:
        focalHeads[index] ??
        ([
          Math.cos(angle) * radius,
          index === 0 ? 3.4 : 2.35 + Math.sin(angle) * 0.5 + random() * 0.15,
          index === 0 ? 0.65 : Math.sin(angle) * 0.25,
        ] as [number, number, number]),
    };
  });
}
