import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { gardenLayout, seededRandom } from '../../src/utils/random';
import { gardenMachine } from '../../src/machines/garden.machine';
import { bouquetLayout } from '../../src/systems/BouquetLayout';

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
  it('keeps a bouquet note in its own scene and cannot skip ribbon reveal', () => {
    const actor = createActor(gardenMachine).start();
    for (const type of [
      'PLANT',
      'GROWN',
      'BLOOMED',
      'GATHER',
      'BOUQUET_READY',
    ] as const)
      actor.send({ type });
    actor.send({ type: 'OPEN_CARD' });
    expect(actor.getSnapshot().value).toBe('BOUQUET');
    for (const type of [
      'UNTIE',
      'CARD_REVEALED',
      'OPEN_CARD',
      'CLOSE_CARD',
    ] as const)
      actor.send({ type });
    expect(actor.getSnapshot().value).toBe('CARD_READY');
    actor.send({ type: 'RESTART' });
    actor.send({ type: 'CARD_REVEALED' });
    expect(actor.getSnapshot().value).toBe('INTRO');
    expect(actor.getSnapshot().context.cardOrigin).toBe('GARDEN');
    actor.stop();
  });
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

it('ties reproducible bouquet stems together while keeping the hero above its neighbors', () => {
  const layout = bouquetLayout('ana', 12);
  expect(layout).toEqual(bouquetLayout('ana', 12));
  for (const flower of layout) {
    expect(Math.hypot(flower.base[0], flower.base[2])).toBeLessThan(0.1);
    expect(flower.head[1]).toBeGreaterThan(flower.base[1]);
  }
  expect(
    layout.slice(1).every((flower) => flower.head[1] < layout[0].head[1]),
  ).toBe(true);
});
