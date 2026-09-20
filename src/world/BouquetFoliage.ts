import * as THREE from 'three';
import { botanicalSurface } from './BotanicalGeometry';
import { seededRandom } from '../utils/random';

/** Lightweight sprigs around the main flowers, sharing all blossom geometry. */
export function createBouquetFoliage(seed: string) {
  const root = new THREE.Group();
  const random = seededRandom(seed + '-sprigs');
  const green = new THREE.MeshStandardMaterial({
    color: '#405336',
    roughness: 0.85,
  });
  const cream = new THREE.MeshStandardMaterial({
    color: '#ffe5a0',
    roughness: 0.75,
    side: THREE.DoubleSide,
  });
  const pollen = new THREE.MeshStandardMaterial({
    color: '#ba751c',
    roughness: 0.9,
  });
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: '#a3ba7e',
    vertexColors: true,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  const leafGeometry = botanicalSurface(0.35, 0.1, true);
  const petalGeometry = new THREE.SphereGeometry(1, 6, 4);
  const centerGeometry = new THREE.SphereGeometry(0.035, 6, 4);
  const petals = new THREE.InstancedMesh(petalGeometry, cream, 10 * 4 * 5);
  const centers = new THREE.InstancedMesh(centerGeometry, pollen, 10 * 4);
  const leaves = new THREE.InstancedMesh(leafGeometry, leafMaterial, 10 * 5);
  const dummy = new THREE.Object3D();
  let petalIndex = 0,
    centerIndex = 0,
    leafIndex = 0;
  for (let i = 0; i < 10; i++) {
    const angle = i * 2.399963;
    const tip = new THREE.Vector3(
      Math.cos(angle) * (1.2 + random() * 0.3),
      2.4 + random() * 1.05,
      -0.25 + Math.sin(angle) * 0.32,
    );
    const base = new THREE.Vector3(0, 0.8, -0.12);
    const curve = new THREE.QuadraticBezierCurve3(
      base,
      new THREE.Vector3(tip.x * 0.35, 1.9, -0.2),
      tip,
    );
    root.add(
      new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.012, 4, false), green),
    );
    for (let j = 0; j < 5; j++) {
      dummy.position.copy(curve.getPoint(0.22 + j * 0.14));
      dummy.rotation.set(0.2, (j % 2) * Math.PI, j % 2 ? -0.8 : 0.8);
      dummy.scale.setScalar(0.8 + random() * 0.4);
      dummy.updateMatrix();
      leaves.setMatrixAt(leafIndex++, dummy.matrix);
    }
    for (let j = 0; j < 4; j++) {
      const start = curve.getPoint(0.66 + j * 0.1);
      const end = start
        .clone()
        .add(
          new THREE.Vector3(
            (j % 2 ? -1 : 1) * (0.12 + random() * 0.12),
            0.14,
            0.04,
          ),
        );
      root.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(
            new THREE.LineCurve3(start, end),
            1,
            0.006,
            4,
            false,
          ),
          green,
        ),
      );
      dummy.position.copy(end);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      centers.setMatrixAt(centerIndex++, dummy.matrix);
      for (let k = 0; k < 5; k++) {
        const a = (k * Math.PI * 2) / 5 + i;
        dummy.position
          .copy(end)
          .add(
            new THREE.Vector3(Math.sin(a) * 0.05, Math.cos(a) * 0.05, -0.012),
          );
        dummy.rotation.set(0.1, 0, -a);
        dummy.scale.set(0.033, 0.063, 0.013);
        dummy.updateMatrix();
        petals.setMatrixAt(petalIndex++, dummy.matrix);
      }
    }
  }
  root.add(petals, centers, leaves);
  return {
    root,
    update(progress: number, time: number, motion: boolean) {
      const reveal = THREE.MathUtils.smoothstep(progress, 0.35, 1);
      root.visible = reveal > 0.001;
      root.scale.setScalar(reveal);
      root.position.y =
        (1 - reveal) * 0.8 +
        (motion ? Math.sin(time * 0.65) * 0.035 * progress : 0);
      root.rotation.z = motion ? Math.sin(time * 0.8) * 0.008 : 0;
    },
  };
}
