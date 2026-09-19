import * as THREE from 'three';
import { gardenLayout, seededRandom } from '../utils/random';
import { flowerSpecies, speciesProfiles } from '../objects/flowerSpecies';

function petalGeometry(length = 0.77, width = 0.145) {
  const vertices: number[] = [],
    indices: number[] = [];
  for (let row = 0; row <= 12; row++) {
    const t = row / 12;
    for (let column = 0; column <= 4; column++) {
      const s = column / 2 - 1;
      vertices.push(
        s * width * Math.pow(Math.sin(Math.PI * t), 0.7),
        t * length,
        Math.sin(t * Math.PI) * 0.1 + s * s * 0.065 - t * t * 0.09,
      );
    }
  }
  for (let row = 0; row < 12; row++)
    for (let c = 0; c < 4; c++) {
      const a = row * 5 + c;
      indices.push(a, a + 1, a + 5, a + 1, a + 6, a + 5);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createFlowers(seed: string, count: number) {
  const root = new THREE.Group();
  const petal = petalGeometry();
  const daisyPetal = petalGeometry(0.64, 0.085);
  const cupPetal = petalGeometry(0.46, 0.22);
  const leaf = petalGeometry(0.9, 0.25);
  const gold = new THREE.MeshStandardMaterial({
    color: '#ffce32',
    roughness: 0.57,
    side: THREE.DoubleSide,
    emissive: '#8a4303',
    emissiveIntensity: 0.09,
  });
  const green = new THREE.MeshStandardMaterial({
    color: '#3d8151',
    roughness: 0.78,
    side: THREE.DoubleSide,
  });
  const cream = gold.clone();
  cream.color.set('#fff0a8');
  const butter = gold.clone();
  butter.color.set('#ffbf20');
  const smallCenter = new THREE.MeshStandardMaterial({
    color: '#c58919',
    roughness: 0.8,
  });
  const centerMat = new THREE.MeshStandardMaterial({
    color: '#382514',
    roughness: 0.95,
  });
  const grainMat = new THREE.MeshStandardMaterial({
    color: '#a87425',
    roughness: 0.85,
  });
  const centerGeometry = new THREE.SphereGeometry(0.285, 24, 16);
  const grainGeometry = new THREE.SphereGeometry(0.018, 5, 4);
  const dummy = new THREE.Object3D();
  const flowers = gardenLayout(seed, count).map((item, index) => {
    const species = flowerSpecies(index),
      profile = speciesProfiles[species];
    item.size *= profile.size;
    const group = new THREE.Group();
    group.position.set(item.x, 0, item.z);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(item.lean, item.height * 0.45, 0.08),
      new THREE.Vector3(item.lean * 0.5, item.height, 0),
    ]);
    const stem = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 18, 0.035, 6, false),
      green,
    );
    group.add(stem);
    const leaves: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const leafMesh = new THREE.Mesh(leaf, green);
      leafMesh.position.copy(curve.getPoint(0.22 + i * 0.2));
      leafMesh.rotation.set(0.45, i * 1.8, i % 2 ? 1.03 : -1.03);
      group.add(leafMesh);
      leaves.push(leafMesh);
    }
    const head = new THREE.Group();
    head.position.copy(curve.getPoint(1));
    head.rotation.set(-0.1, item.x * 0.12, item.lean);
    head.scale.setScalar(item.size);
    const petals = new THREE.InstancedMesh(
      species === 'sunflower'
        ? petal
        : species === 'daisy'
          ? daisyPetal
          : cupPetal,
      species === 'sunflower' ? gold : species === 'daisy' ? cream : butter,
      profile.count,
    );
    petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    petals.frustumCulled = false;
    head.add(petals);
    const center = new THREE.Mesh(
      centerGeometry,
      species === 'sunflower' ? centerMat : smallCenter,
    );
    center.scale.set(profile.center, profile.center, 0.42 * profile.center);
    center.position.z = 0.045;
    center.userData.flowerIndex = index;
    head.add(center);
    const grains = new THREE.InstancedMesh(grainGeometry, grainMat, 180);
    for (let i = 0; i < 180; i++) {
      const r = Math.sqrt(i / 180) * 0.265,
        a = i * 2.399963;
      dummy.position.set(
        Math.cos(a) * r,
        Math.sin(a) * r,
        0.07 + Math.sqrt(1 - (r * r) / 0.08) * 0.09,
      );
      dummy.rotation.set(0, 0, a);
      dummy.scale.setScalar(0.75 + i / 500);
      dummy.updateMatrix();
      grains.setMatrixAt(i, dummy.matrix);
    }
    grains.scale.setScalar(profile.center);
    head.add(grains);
    group.add(head);
    root.add(group);
    return {
      group,
      head,
      petals,
      center,
      leaves,
      item,
      profile,
      species,
      previousOpen: -1,
    };
  });
  function update(
    growth: number,
    bloom: number,
    time: number,
    motion: boolean,
  ) {
    for (const flower of flowers) {
      const progress = THREE.MathUtils.clamp(
        (growth - flower.item.delay) / (1 - flower.item.delay),
        0,
        1,
      );
      flower.group.visible = progress > 0.005;
      flower.group.scale.set(
        0.55 + progress * 0.45,
        Math.max(0.001, progress),
        0.55 + progress * 0.45,
      );
      flower.group.rotation.set(
        0,
        0,
        motion ? Math.sin(time * 0.7 + flower.item.x) * 0.018 * progress : 0,
      );
      const open = THREE.MathUtils.clamp(
        bloom * 1.3 - flower.item.delay * 0.5,
        0,
        1,
      );
      flower.head.scale.setScalar(flower.item.size * (0.38 + open * 0.62));
      // Petal matrices are static once blooming finishes; only stems sway then.
      if (open === flower.previousOpen) continue;
      flower.previousOpen = open;
      const { profile } = flower;
      for (let i = 0; i < profile.count; i++) {
        const outer = i >= profile.ring;
        const a =
          ((i % profile.ring) / profile.ring) * Math.PI * 2 +
          (outer ? 0.18 : 0);
        dummy.position.set(
          -Math.sin(a) * profile.radius,
          Math.cos(a) * profile.radius,
          outer ? -0.035 : 0,
        );
        dummy.rotation.set(0, 0, a);
        dummy.rotateX(
          (1 - open) * 1.35 +
            (outer ? -0.1 : flower.species === 'buttercup' ? 0.35 : 0.05),
        );
        dummy.scale.setScalar(
          outer || flower.species !== 'sunflower' ? 1 : 0.84,
        );
        dummy.updateMatrix();
        flower.petals.setMatrixAt(i, dummy.matrix);
      }
      flower.petals.instanceMatrix.needsUpdate = true;
    }
  }
  return { root, flowers, update };
}

export function createMeadow(seed: string, count: number) {
  const random = seededRandom(seed + '-meadow');
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      [
        -0.018, 0, 0, 0.018, 0, 0, -0.004, 0.25, 0.015, 0.014, 0.25, 0.015,
        0.07, 0.5, 0.05,
      ],
      3,
    ),
  );
  geometry.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]);
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color: '#173a2c',
    roughness: 1,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const a = random() * Math.PI * 2,
      r = 1.1 + random() * 7;
    let x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.65;
    // Leave the macro camera's central sightline clear.
    if (z > 0 && Math.abs(x) < 0.8) x += x < 0 ? -0.9 : 0.9;
    dummy.position.set(x, -0.035, z);
    dummy.rotation.set(
      (random() - 0.5) * 0.5,
      random() * Math.PI,
      (random() - 0.5) * 0.5,
    );
    dummy.scale.setScalar(0.3 + random() * 1.3);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  return mesh;
}
