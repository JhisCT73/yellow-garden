import type { GardenStage } from '../machines/garden.machine';

export const journey = [
  {
    title: 'La semilla',
    stage: 'INTRO',
    hint: 'Elige cómo vivir tu jardín y comienza.',
  },
  {
    title: 'Crecimiento',
    stage: 'GROWING',
    hint: 'Tu semilla está echando raíces.',
  },
  {
    title: 'La primera flor',
    stage: 'BLOOMING',
    hint: 'Los pétalos se abren para ti.',
  },
  {
    title: 'El jardín',
    stage: 'GARDEN',
    hint: 'Explora las flores o continúa para crear tu ramo.',
  },
  {
    title: 'El ramo',
    stage: 'GATHERING',
    hint: 'Las flores se reúnen en un ramo.',
  },
  {
    title: 'La cinta',
    stage: 'BOUQUET',
    hint: 'Tira de la cinta o pulsa Siguiente.',
  },
  {
    title: 'La carta',
    stage: 'CARD_READY',
    hint: 'Lee tu carta sin prisa. Continúa cuando quieras.',
  },
  {
    title: 'El viento',
    stage: 'WIND',
    hint: 'Suelta un deseo o pulsa Siguiente.',
  },
  {
    title: 'El corazón',
    stage: 'BURST',
    hint: 'Las luces se unen para formar un corazón.',
  },
  {
    title: 'El mensaje',
    stage: 'TEXT_FORMING',
    hint: 'Un deseo escrito con luz.',
  },
  {
    title: 'La gran flor',
    stage: 'SECRET_BLOOM',
    hint: 'Todavía queda una última sorpresa.',
  },
  {
    title: 'Un momento más',
    stage: 'BENCH',
    hint: 'Llegaste al final. Puedes volver a cualquier etapa.',
  },
] as const satisfies readonly {
  title: string;
  stage: GardenStage;
  hint: string;
}[];
export type JourneyStage = (typeof journey)[number]['stage'];
export function journeyIndex(stage: GardenStage) {
  const aliases: Partial<Record<GardenStage, GardenStage>> = {
    UNWRAPPING: 'CARD_READY',
    FINALE: 'CARD_READY',
    HEART: 'BURST',
    CELEBRATION: 'BURST',
    TEXT_READY: 'TEXT_FORMING',
    FREE_EXPLORE: 'SECRET_BLOOM',
    SECRET_READY: 'SECRET_BLOOM',
  };
  return journey.findIndex((step) => step.stage === (aliases[stage] ?? stage));
}
