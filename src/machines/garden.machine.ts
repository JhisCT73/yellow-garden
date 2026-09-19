import { assign, setup } from 'xstate';

export const gardenMachine = setup({
  types: {
    context: {} as { cardOrigin: 'GARDEN' | 'CARD_READY' },
    events: {} as {
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
        | 'RESTART';
    },
  },
}).createMachine({
  id: 'garden',
  initial: 'INTRO',
  context: { cardOrigin: 'GARDEN' },
  on: {
    RESTART: { target: '.INTRO', actions: assign({ cardOrigin: 'GARDEN' }) },
  },
  states: {
    INTRO: { on: { PLANT: 'GROWING' } },
    GROWING: { on: { GROWN: 'BLOOMING' } },
    BLOOMING: { on: { BLOOMED: 'GARDEN' } },
    GARDEN: {
      on: {
        GATHER: 'GATHERING',
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
        OPEN_CARD: {
          target: 'FINALE',
          actions: assign({ cardOrigin: 'CARD_READY' }),
        },
      },
    },
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
  | 'FINALE';
