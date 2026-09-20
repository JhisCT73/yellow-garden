import { expect, it } from 'vitest';
import { heartCloud } from '../../src/particles/heart';
import { createActor } from 'xstate';
import { gardenMachine } from '../../src/machines/garden.machine';

it('keeps a reproducible heart within the scene and gives it real depth', () => {
  const points = heartCloud('primavera', 1200);
  expect(points).toEqual(heartCloud('primavera', 1200));
  let front = false,
    back = false;
  for (let i = 0; i < points.length; i += 3) {
    expect(Math.abs(points[i])).toBeLessThanOrEqual(1.53);
    expect(points[i + 1]).toBeGreaterThan(0.7);
    expect(points[i + 1]).toBeLessThan(3.6);
    expect(Math.abs(points[i + 2])).toBeLessThanOrEqual(0.33);
    if (points[i + 2] > 0.1) front = true;
    if (points[i + 2] < -0.1) back = true;
  }
  expect(front && back).toBe(true);
});

it('fills the heart without accumulating particles along its vertical axis', () => {
  const points = heartCloud('distribution', 6000);
  let central = 0,
    left = 0,
    right = 0;
  for (let i = 0; i < points.length; i += 3) {
    if (Math.abs(points[i]) < 0.08) central++;
    if (points[i] < 0) left++;
    else right++;
  }
  expect(central / 6000).toBeLessThan(0.1);
  expect(left / right).toBeGreaterThan(0.9);
  expect(left / right).toBeLessThan(1.1);
});

it('finishes without discovering the ribbon, returns to exploration, and permits a second wish', () => {
  const actor = createActor(gardenMachine).start();
  for (const type of [
    'PLANT',
    'GROWN',
    'BLOOMED',
    'START_WIND',
    'RELEASE_WIND',
    'SCATTERED',
    'HEART_READY',
    'EXPLORE',
  ] as const)
    actor.send({ type });
  expect(actor.getSnapshot().value).toBe('FREE_EXPLORE');
  actor.send({ type: 'START_WIND' });
  expect(actor.getSnapshot().value).toBe('WIND');
  actor.send({ type: 'RESTART' });
  actor.send({ type: 'HEART_READY' });
  expect(actor.getSnapshot().value).toBe('INTRO');
  actor.stop();
});

it('allows resting only after the finale and restarts from the bench', () => {
  const actor = createActor(gardenMachine).start();
  actor.send({ type: 'REST' });
  expect(actor.getSnapshot().value).toBe('INTRO');
  for (const type of [
    'PLANT',
    'GROWN',
    'BLOOMED',
    'START_WIND',
    'RELEASE_WIND',
    'SCATTERED',
    'HEART_READY',
    'EXPLORE',
    'LAST_SURPRISE',
    'SURPRISE_READY',
    'REST',
  ] as const)
    actor.send({ type });
  expect(actor.getSnapshot().value).toBe('BENCH');
  actor.send({ type: 'EXPLORE' });
  expect(actor.getSnapshot().value).toBe('FREE_EXPLORE');
  actor.send({ type: 'REST' });
  actor.send({ type: 'RESTART' });
  expect(actor.getSnapshot().value).toBe('INTRO');
  actor.stop();
});
