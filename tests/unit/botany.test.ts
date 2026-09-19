import { expect, it } from 'vitest';
import { createFlowers } from '../../src/world/botany';
import { createActor } from 'xstate';
import { gardenMachine } from '../../src/machines/garden.machine';

it('keeps the hero sunflower and stops uploading static petal matrices after blooming', () => {
  const garden = createFlowers('ana', 12);
  expect(garden.flowers[0].species).toBe('sunflower');
  expect(new Set(garden.flowers.map((flower) => flower.species)).size).toBe(3);
  garden.update(1, 1, 0, true);
  const versions = garden.flowers.map(
    (flower) => flower.petals.instanceMatrix.version,
  );
  garden.update(1, 1, 1, true);
  expect(
    garden.flowers.map((flower) => flower.petals.instanceMatrix.version),
  ).toEqual(versions);
  garden.update(0, 0, 2, true);
  expect(
    garden.flowers.every(
      (flower, index) => flower.petals.instanceMatrix.version > versions[index],
    ),
  ).toBe(true);
});

it('makes lettering optional and ignores stale text completion after restart', () => {
  const actor = createActor(gardenMachine).start();
  for (const type of [
    'PLANT',
    'GROWN',
    'BLOOMED',
    'START_WIND',
    'RELEASE_WIND',
    'SCATTERED',
    'HEART_READY',
    'FORM_MESSAGE',
  ] as const)
    actor.send({ type });
  expect(actor.getSnapshot().value).toBe('TEXT_FORMING');
  actor.send({ type: 'MESSAGE_READY' });
  actor.send({ type: 'EXPLORE' });
  expect(actor.getSnapshot().value).toBe('FREE_EXPLORE');
  actor.send({ type: 'RESTART' });
  actor.send({ type: 'MESSAGE_READY' });
  expect(actor.getSnapshot().value).toBe('INTRO');
  actor.stop();
});
