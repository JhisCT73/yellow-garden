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
