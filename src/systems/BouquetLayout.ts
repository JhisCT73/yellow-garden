import { seededRandom } from '../utils/random';

/** Positions describe the tops of a hand-tied bouquet, with a taller hero flower. */
export function bouquetLayout(seed: string, count: number) {
  const random = seededRandom(seed + '-bouquet');
  return Array.from({ length: count }, (_, index) => {
    const angle = index * 2.399963;
    const radius = index === 0 ? 0 : 0.58 + Math.sqrt(index) * 0.22;
    return {
      base: [(random() - 0.5) * 0.14, 0.55, (random() - 0.5) * 0.12] as [
        number,
        number,
        number,
      ],
      head: [
        Math.cos(angle) * radius,
        index === 0 ? 3.4 : 2.35 + Math.sin(angle) * 0.5 + random() * 0.15,
        index === 0 ? 0.65 : Math.sin(angle) * 0.25,
      ] as [number, number, number],
    };
  });
}
