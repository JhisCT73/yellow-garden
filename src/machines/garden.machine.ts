import { setup } from 'xstate';

export const gardenMachine = setup({
  types: {
    events: {} as {
      type:
        'PLANT' | 'GROWN' | 'BLOOMED' | 'OPEN_CARD' | 'CLOSE_CARD' | 'RESTART';
    },
  },
}).createMachine({
  id: 'garden',
  initial: 'INTRO',
  on: { RESTART: '.INTRO' },
  states: {
    INTRO: { on: { PLANT: 'GROWING' } },
    GROWING: { on: { GROWN: 'BLOOMING' } },
    BLOOMING: { on: { BLOOMED: 'GARDEN' } },
    GARDEN: { on: { OPEN_CARD: 'FINALE' } },
    FINALE: { on: { CLOSE_CARD: 'GARDEN' } },
  },
});
export type GardenStage =
  'INTRO' | 'GROWING' | 'BLOOMING' | 'GARDEN' | 'FINALE';
