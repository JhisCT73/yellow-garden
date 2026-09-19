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

/** Wide garden and close gift shots share the same lower text-safe area. */
export function gardenFrame(
  stage: GardenStage,
  gather: number,
  mobile: boolean,
) {
  if (stage === 'CARD_READY' || stage === 'FINALE')
    return {
      position: [0.2, 2.8, mobile ? 10 : 7.8] as const,
      focus: [0, 1.95, 2.1] as const,
      fov: mobile ? 44 : 39,
    };
  if (
    ![
      'GARDEN',
      'GATHERING',
      'BOUQUET',
      'UNWRAPPING',
      'CARD_READY',
      'FINALE',
    ].includes(stage)
  )
    return null;
  const t = stage === 'GARDEN' ? 0 : stage === 'GATHERING' ? gather : 1;
  return {
    position: [
      0.35 * t,
      3.2,
      (mobile ? 12 : 10) - t * (mobile ? 0.2 : 0.6),
    ] as const,
    focus: [0, 1.5 + t * 0.7, -1.5 + t * 1.5] as const,
    fov: mobile ? 44 : 39,
  };
}

export function finaleFrame(stage: GardenStage, mobile: boolean) {
  if (stage === 'FREE_EXPLORE') return gardenFrame('GARDEN', 0, mobile);
  if (
    ![
      'WIND',
      'BURST',
      'HEART',
      'CELEBRATION',
      'TEXT_FORMING',
      'TEXT_READY',
      'SECRET_BLOOM',
      'SECRET_READY',
    ].includes(stage)
  )
    return null;
  const message = stage === 'TEXT_FORMING' || stage === 'TEXT_READY';
  const secret = stage === 'SECRET_BLOOM' || stage === 'SECRET_READY';
  return {
    position: [
      secret ? -1.65 : 0,
      3.1,
      mobile ? (message ? 13 : 11.8) : 9.2,
    ] as const,
    focus: [secret ? -1.65 : 0, 1.9, 0] as const,
    fov: mobile ? 44 : 39,
  };
}
