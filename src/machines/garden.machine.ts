import { assign, setup } from 'xstate';
import { journey, type JourneyStage } from '../content/journey';

export const gardenMachine = setup({
  types: {
    context: {} as { cardOrigin: 'GARDEN' | 'CARD_READY' },
    events: {} as
      | {
          type:
            | 'PLANT'
            | 'GROWN'
            | 'BLOOMED'
            | 'GATHER'
            | 'BOUQUET_READY'
            | 'UNTIE'
            | 'CARD_REVEALED'
            | 'OPEN_CARD'
            | 'CLOSE_CARD'
            | 'START_WIND'
            | 'RELEASE_WIND'
            | 'SCATTERED'
            | 'HEART_READY'
            | 'FORM_MESSAGE'
            | 'MESSAGE_READY'
            | 'EXPLORE'
            | 'LAST_SURPRISE'
            | 'SURPRISE_READY'
            | 'REST'
            | 'RESTART';
        }
      | { type: 'NAVIGATE'; stage: JourneyStage },
  },
}).createMachine({
  id: 'garden',
  initial: 'INTRO',
  context: { cardOrigin: 'GARDEN' },
  on: {
    NAVIGATE: journey.map((step) => ({
      guard: ({ event }) => event.stage === step.stage,
      target: `.${step.stage}`,
      actions: assign({ cardOrigin: 'CARD_READY' as const }),
    })),
    RESTART: { target: '.INTRO', actions: assign({ cardOrigin: 'GARDEN' }) },
  },
  states: {
    INTRO: { on: { PLANT: 'GROWING' } },
    GROWING: { on: { GROWN: 'BLOOMING' } },
    BLOOMING: { on: { BLOOMED: 'GARDEN' } },
    GARDEN: {
      on: {
        GATHER: 'GATHERING',
        START_WIND: 'WIND',
        OPEN_CARD: {
          target: 'FINALE',
          actions: assign({ cardOrigin: 'GARDEN' }),
        },
      },
    },
    GATHERING: { on: { BOUQUET_READY: 'BOUQUET' } },
    BOUQUET: { on: { UNTIE: 'UNWRAPPING' } },
    UNWRAPPING: { on: { CARD_REVEALED: 'CARD_READY' } },
    CARD_READY: {
      on: {
        START_WIND: 'WIND',
        OPEN_CARD: {
          target: 'FINALE',
          actions: assign({ cardOrigin: 'CARD_READY' }),
        },
      },
    },
    WIND: { on: { RELEASE_WIND: 'BURST' } },
    BURST: { on: { SCATTERED: 'HEART' } },
    HEART: { on: { HEART_READY: 'CELEBRATION' } },
    CELEBRATION: {
      on: { EXPLORE: 'FREE_EXPLORE', FORM_MESSAGE: 'TEXT_FORMING' },
    },
    TEXT_FORMING: { on: { MESSAGE_READY: 'TEXT_READY' } },
    TEXT_READY: { on: { EXPLORE: 'FREE_EXPLORE' } },
    FREE_EXPLORE: {
      on: { START_WIND: 'WIND', LAST_SURPRISE: 'SECRET_BLOOM', REST: 'BENCH' },
    },
    SECRET_BLOOM: { on: { SURPRISE_READY: 'SECRET_READY' } },
    SECRET_READY: { on: { EXPLORE: 'FREE_EXPLORE', REST: 'BENCH' } },
    BENCH: { on: { EXPLORE: 'FREE_EXPLORE' } },
    FINALE: {
      on: {
        CLOSE_CARD: [
          {
            target: 'CARD_READY',
            guard: ({ context }) => context.cardOrigin === 'CARD_READY',
          },
          { target: 'GARDEN' },
        ],
      },
    },
  },
});
export type GardenStage =
  | 'INTRO'
  | 'GROWING'
  | 'BLOOMING'
  | 'GARDEN'
  | 'GATHERING'
  | 'BOUQUET'
  | 'UNWRAPPING'
  | 'CARD_READY'
  | 'FINALE'
  | 'WIND'
  | 'BURST'
  | 'HEART'
  | 'CELEBRATION'
  | 'TEXT_FORMING'
  | 'TEXT_READY'
  | 'SECRET_BLOOM'
  | 'SECRET_READY'
  | 'BENCH'
  | 'FREE_EXPLORE';

export type SceneCompletion =
  | 'GROWN'
  | 'BLOOMED'
  | 'BOUQUET_READY'
  | 'CARD_REVEALED'
  | 'SCATTERED'
  | 'HEART_READY'
  | 'MESSAGE_READY'
  | 'SURPRISE_READY';
