import { expect, it } from 'vitest';
import { openingFrame } from '../../src/cinematics/OpeningCamera';

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
