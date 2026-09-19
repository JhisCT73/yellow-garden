import { expect, it } from 'vitest';
import { PointLight } from 'three';
import { createGardenCare } from '../../src/systems/GardenCare';

it('keeps water still for reduced motion, hides it for the finale, and resets when changing care', () => {
  const care = createGardenCare('ana', 1);
  const light = new PointLight();
  care.update('water', 4, true, true, light);
  expect(care.rain.visible).toBe(true);
  expect(care.rain.material.uniforms.motion.value).toBe(0);
  expect(light.color.getHexString()).toBe('a1cfff');
  care.update('water', 4, false, false, light);
  expect(care.rain.visible).toBe(false);
  care.update('light', 4, false, true, light);
  expect(care.rain.visible).toBe(false);
  expect(light.color.getHexString()).toBe('ffbd46');
  light.intensity = 3;
  care.update('music', 4, true, true, light);
  expect(light.intensity).toBe(3);
  care.rain.geometry.dispose();
  care.rain.material.dispose();
});
