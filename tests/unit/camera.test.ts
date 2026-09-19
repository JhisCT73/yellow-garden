import { expect, it } from 'vitest';
import {
  openingFrame,
  gardenFrame,
  finaleFrame,
} from '../../src/cinematics/OpeningCamera';

it('follows growth and frames the hero on mobile without changing later scenes', () => {
  const seed = openingFrame('INTRO', 0, false)!;
  const early = openingFrame('GROWING', 0, false)!;
  const grown = openingFrame('GROWING', 1, false)!;
  expect(seed.focus[1]).toBeLessThan(0.3);
  expect(grown.focus[1]).toBeGreaterThan(early.focus[1]);
  expect(openingFrame('BLOOMING', 1, true)!.position[2]).toBeGreaterThan(
    openingFrame('BLOOMING', 1, false)!.position[2],
  );
  expect(openingFrame('GARDEN', 1, false)).toBeNull();
});

it('centers the particle finale and gives its wider lettering more room on mobile', () => {
  expect(finaleFrame('HEART', false)!.focus[0]).toBe(0);
  expect(finaleFrame('TEXT_READY', true)!.position[2]).toBeGreaterThan(
    finaleFrame('HEART', true)!.position[2],
  );
  expect(finaleFrame('FREE_EXPLORE', true)).toEqual(
    gardenFrame('GARDEN', 0, true),
  );
  expect(finaleFrame('INTRO', false)).toBeNull();
});

it('moves continuously from the wide garden to the bouquet and preserves the finale camera', () => {
  expect(gardenFrame('GATHERING', 0, false)).toEqual(
    gardenFrame('GARDEN', 0, false),
  );
  expect(gardenFrame('GATHERING', 1, false)).toEqual(
    gardenFrame('BOUQUET', 1, false),
  );
  expect(gardenFrame('BOUQUET', 1, true)!.position[2]).toBeGreaterThan(
    gardenFrame('BOUQUET', 1, false)!.position[2],
  );
  expect(gardenFrame('HEART', 1, false)).toBeNull();
});
