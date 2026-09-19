import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { gardenLayout, seededRandom } from '../../src/utils/random';
import { gardenMachine } from '../../src/machines/garden.machine';

describe('reproducible gardens', () => {
  it('reproduces a shared seed and varies different seeds', () => {
    expect(gardenLayout('ana', 12)).toEqual(gardenLayout('ana', 12));
    expect(gardenLayout('ana', 12)).not.toEqual(gardenLayout('luz', 12));
  });
  it('keeps random values and flower counts within bounds', () => {
    const random = seededRandom('🌻');
    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    expect(gardenLayout('x', 100)).toHaveLength(24);
    expect(gardenLayout('x', -1)).toHaveLength(1);
  });
});
describe('story progression', () => {
  it('requires growth and bloom, supports the note, and resets from the finale', () => {
    const actor = createActor(gardenMachine).start();
    actor.send({ type: 'OPEN_CARD' });
    expect(actor.getSnapshot().value).toBe('INTRO');
    for (const type of ['PLANT', 'GROWN', 'BLOOMED', 'OPEN_CARD'] as const)
      actor.send({ type });
    expect(actor.getSnapshot().value).toBe('FINALE');
    actor.send({ type: 'CLOSE_CARD' });
    expect(actor.getSnapshot().value).toBe('GARDEN');
    actor.send({ type: 'RESTART' });
    expect(actor.getSnapshot().value).toBe('INTRO');
    actor.stop();
  });
});
