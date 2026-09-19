export type FlowerSpecies = 'sunflower' | 'daisy' | 'buttercup';

export function flowerSpecies(index: number): FlowerSpecies {
  if (index === 0 || index % 3 === 0) return 'sunflower';
  return index % 3 === 1 ? 'daisy' : 'buttercup';
}

export const speciesProfiles = {
  sunflower: { count: 34, ring: 17, radius: 0.2, center: 1, size: 1 },
  daisy: { count: 16, ring: 16, radius: 0.11, center: 0.55, size: 0.82 },
  buttercup: { count: 8, ring: 8, radius: 0.075, center: 0.38, size: 0.72 },
} as const;
