import * as THREE from 'three';
import type { createFlowers } from '../world/botany';

export function createWindSystem(
  flowers: ReturnType<typeof createFlowers>['flowers'],
  meadow: THREE.InstancedMesh,
) {
  const uniforms = { gardenWind: { value: 0 }, gardenTime: { value: 0 } };
  const material = meadow.material as THREE.MeshStandardMaterial;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      'uniform float gardenWind; uniform float gardenTime;\n' +
      shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      transformed.x += sin(gardenTime*2.+instanceMatrix[3].x*1.7)*position.y*position.y*gardenWind*1.8;`,
    );
  };
  material.customProgramCacheKey = () => 'garden-wind-v1';
  const leaves = flowers.map((flower) =>
    flower.leaves.map((leaf) => leaf.rotation.z),
  );
  let strength = 0;
  return {
    update(
      target: number,
      time: number,
      delta: number,
      reducedMotion: boolean,
    ) {
      strength = reducedMotion
        ? 0
        : THREE.MathUtils.damp(strength, target, 4, Math.min(delta, 0.1));
      uniforms.gardenWind.value = strength;
      uniforms.gardenTime.value = time;
      flowers.forEach((flower, index) => {
        flower.group.rotation.z +=
          Math.sin(time * 2.2 + index * 0.15) * strength * 0.16;
        flower.leaves.forEach((leaf, j) => {
          leaf.rotation.z =
            leaves[index][j] + Math.sin(time * 3 + index + j) * strength * 0.13;
        });
      });
      return strength;
    },
    reset() {
      strength = 0;
      uniforms.gardenWind.value = 0;
    },
  };
}
