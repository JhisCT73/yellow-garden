import { expect, it } from 'vitest';
import { openingFrame, gardenFrame } from '../../src/cinematics/OpeningCamera';

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
