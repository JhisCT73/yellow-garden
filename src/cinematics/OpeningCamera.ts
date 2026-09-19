import type { GardenStage } from '../machines/garden.machine';

export function openingFrame(
  stage: GardenStage,
  growth: number,
  mobile: boolean,
) {
  if (stage === 'INTRO')
    return {
      position: [0.3, 0.65, mobile ? 3.1 : 2.25] as const,
      focus: [0, 0.18, 0] as const,
      fov: mobile ? 44 : 39,
    };
  if (stage === 'GROWING')
    return {
      position: [0.65, 1 + growth * 2.7, mobile ? 6 : 5.2] as const,
      focus: [0, 0.3 + growth * 1.9, 0] as const,
      fov: mobile ? 44 : 39,
    };
  if (stage === 'BLOOMING')
    return {
      position: [1.5, 3.9, mobile ? 5.5 : 3.8] as const,
      focus: [0, 3.05, -0.2] as const,
      fov: mobile ? 44 : 39,
    };
  return null;
}
