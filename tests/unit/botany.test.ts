import { expect, it } from 'vitest';
import { createFlowers } from '../../src/world/botany';
import { createActor } from 'xstate';
import { gardenMachine } from '../../src/machines/garden.machine';
import { createSecretBloom } from '../../src/systems/SecretBloomSystem';

it('restores the hero and other flowers after the optional surprise', () => {
  const garden = createFlowers('ana', 12);
  const secret = createSecretBloom(garden.flowers, 'ana', 1);
  garden.update(1, 1, 0, false);
  const size = garden.flowers[0].head.scale.x;
  secret.update(true, 1, true);
  expect(garden.flowers[0].head.scale.x).toBeCloseTo(size * 1.9);
  expect(garden.flowers[1].group.scale.x).toBeCloseTo(0.3);
  expect(secret.points.visible).toBe(false);
  garden.update(1, 1, 0, false);
  secret.update(false, 0, false);
  expect(garden.flowers[0].head.scale.x).toBe(size);
  expect(garden.flowers[1].group.scale.x).toBe(1);
  secret.points.geometry.dispose();
  secret.points.material.dispose();
});

it('allows the surprise only after exploration and ignores a cancelled completion', () => {
  const actor = createActor(gardenMachine).start();
  actor.send({ type: 'LAST_SURPRISE' });
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
  ] as const)
    actor.send({ type });
  expect(actor.getSnapshot().value).toBe('SECRET_BLOOM');
  actor.send({ type: 'SURPRISE_READY' });
  actor.send({ type: 'EXPLORE' });
  expect(actor.getSnapshot().value).toBe('FREE_EXPLORE');
  actor.send({ type: 'LAST_SURPRISE' });
  actor.send({ type: 'RESTART' });
  actor.send({ type: 'SURPRISE_READY' });
  expect(actor.getSnapshot().value).toBe('INTRO');
  actor.stop();
});

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
