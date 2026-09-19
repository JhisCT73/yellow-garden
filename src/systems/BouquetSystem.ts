import * as THREE from 'three';
import { bouquetLayout } from './BouquetLayout';
import type { createFlowers } from '../world/botany';

type Flowers = ReturnType<typeof createFlowers>['flowers'];

export function createBouquetSystem(flowers: Flowers, seed: string) {
  const layout = bouquetLayout(seed, flowers.length);
  const up = new THREE.Vector3(0, 1, 0);
  const targets = flowers.map((flower, index) => {
    const position = new THREE.Vector3(...layout[index].base);
    const direction = new THREE.Vector3(...layout[index].head).sub(position);
    return {
      position,
      gardenPosition: new THREE.Vector3(
        (index % 2 ? 1 : -1) * (1.65 + (index % 3) * 0.85),
        0,
        -0.3 - Math.floor(index / 2) * 0.8,
      ),
      rotation: new THREE.Quaternion().setFromUnitVectors(
        up,
        direction.clone().normalize(),
      ),
      scale: direction.length() / flower.item.height,
      headRotation: flower.head.quaternion.clone(),
    };
  });
  const inverse = new THREE.Quaternion();
  const face = new THREE.Quaternion();
  const angle = new THREE.Euler();
  return {
    update(progress: number, time: number, motion: boolean, reveal = 0) {
      flowers.forEach((flower, index) => {
        const target = targets[index];
        const t = THREE.MathUtils.smoothstep(
          progress,
          index * 0.012,
          0.8 + index * 0.012,
        );
        flower.group.position
          .set(flower.item.x, 0, flower.item.z)
          .lerp(target.gardenPosition, reveal)
          .lerp(target.position, t);
        if (motion) flower.group.position.y += Math.sin(t * Math.PI) * 0.5;
        flower.group.quaternion.slerp(target.rotation, t);
        const scale = THREE.MathUtils.lerp(1, target.scale, t);
        flower.group.scale.multiplyScalar(scale);
        flower.head.scale.multiplyScalar(
          THREE.MathUtils.lerp(1, index === 0 ? 1 : 0.78, t) / scale,
        );
        flower.leaves.forEach((leaf) =>
          leaf.scale.setScalar(THREE.MathUtils.lerp(1, 0.62, t)),
        );
        inverse.copy(target.rotation).invert();
        angle.set(
          -0.12 + (index % 3) * 0.12,
          Math.sin(index * 2.4) * 0.3,
          Math.sin(index) * 0.12,
        );
        face.setFromEuler(angle);
        inverse.multiply(face);
        flower.head.quaternion.copy(target.headRotation).slerp(inverse, t);
      });
      const float = motion ? Math.sin(time * 0.65) * 0.035 * progress : 0;
      flowers.forEach((flower) => {
        flower.group.position.y += float;
      });
    },
  };
}
