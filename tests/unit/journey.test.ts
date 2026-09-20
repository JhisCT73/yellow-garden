import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import {
  gardenMachine,
  type GardenStage,
} from '../../src/machines/garden.machine';
import { journey, journeyIndex } from '../../src/content/journey';

describe('journey navigation', () => {
  it('revisits all twelve chapters and cancels stale completion events', () => {
    const actor = createActor(gardenMachine).start();
    for (const chapter of journey) {
      actor.send({ type: 'NAVIGATE', stage: chapter.stage });
      expect(actor.getSnapshot().value).toBe(chapter.stage);
    }
    actor.send({ type: 'NAVIGATE', stage: 'INTRO' });
    actor.send({ type: 'GROWN' });
    actor.send({ type: 'SURPRISE_READY' });
    expect(actor.getSnapshot().value).toBe('INTRO');
    actor.stop();
  });
  it('returns a visited letter to the correct scene when closed', () => {
    const actor = createActor(gardenMachine).start();
    actor.send({ type: 'NAVIGATE', stage: 'CARD_READY' });
    actor.send({ type: 'OPEN_CARD' });
    actor.send({ type: 'CLOSE_CARD' });
    expect(actor.getSnapshot().value).toBe('CARD_READY');
    actor.stop();
  });
  it('maps transitional and interactive states onto a visible chapter', () => {
    const stages = Object.keys(gardenMachine.states) as GardenStage[];
    for (const stage of stages)
      expect(journeyIndex(stage)).toBeGreaterThanOrEqual(0);
    expect(journeyIndex('HEART')).toBe(journeyIndex('CELEBRATION'));
    expect(journeyIndex('FINALE')).toBe(journeyIndex('CARD_READY'));
  });
});
