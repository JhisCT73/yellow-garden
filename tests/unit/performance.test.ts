import { expect, it } from 'vitest';
import {
  createPerformanceMonitor,
  initialQuality,
  qualityProfile,
} from '../../src/systems/PerformanceManager';

it('caps resolution and scene budgets for each profile', () => {
  expect(initialQuality(4)).toBe('low');
  expect(initialQuality(8)).toBe('medium');
  expect(initialQuality(16)).toBe('high');
  expect(qualityProfile('low', 3)).toEqual({
    dpr: 1,
    particles: 120,
    grass: 250,
  });
  expect(qualityProfile('high', 3).dpr).toBe(1.75);
  expect(qualityProfile('high', 1).dpr).toBe(1);
});

it('ignores isolated stalls, fast frames, and background time', () => {
  const monitor = createPerformanceMonitor('high');
  for (let i = 0; i < 1000; i++)
    expect(monitor.sample(1 / 60, true)).toBeUndefined();
  for (let i = 0; i < 40; i++)
    expect(monitor.sample(0.05, true)).toBeUndefined();
  expect(monitor.sample(4, true)).toBeUndefined();
  for (let i = 0; i < 1000; i++)
    expect(monitor.sample(0.05, false)).toBeUndefined();
  for (let i = 0; i < 40; i++)
    expect(monitor.sample(0.05, true)).toBeUndefined();
});

it('steps down after sustained slow rendering without oscillating or going below low', () => {
  const monitor = createPerformanceMonitor('high');
  const changes = [];
  for (let i = 0; i < 700; i++) {
    const level = monitor.sample(0.05, true);
    if (level) changes.push(level);
  }
  expect(changes).toEqual(['medium', 'low']);
  for (let i = 0; i < 1000; i++)
    expect(monitor.sample(1 / 60, true)).toBeUndefined();
  monitor.reset('high');
  for (let i = 0; i < 50; i++)
    expect(monitor.sample(0.05, true)).toBeUndefined();
});
