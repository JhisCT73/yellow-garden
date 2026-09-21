import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createFlowers } from './botany';
import { seededRandom } from '../utils/random';
import { pathCenter, terrainHeight } from './GardenTerrain';

/** Bake existing flower models once, then instance those meshes across the banks. */
export function createFlowerField(seed: string) {
  const root = new THREE.Group(),
    random = seededRandom(seed + '-field');
  const templates = createFlowers(seed + '-templates', 3, true);
  templates.update(1, 1, 0, false);
  const materials = new Map<THREE.Material, THREE.MeshLambertMaterial>();
  const discarded = new Set<THREE.BufferGeometry>();
  for (const [species, flower] of templates.flowers.entries()) {
    flower.group.position.set(0, 0, 0);
    flower.group.rotation.set(0, 0, 0);
    flower.group.updateMatrixWorld(true);
    const groups = new Map<THREE.Material, THREE.BufferGeometry[]>();
    flower.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      discarded.add(object.geometry);
      const material = object.material as THREE.Material;
      const parts = groups.get(material) ?? [];
      groups.set(material, parts);
      // Fine seed grains are unnecessary on distant flowers.
      if (object instanceof THREE.InstancedMesh && object.count === 320) return;
      const count = object instanceof THREE.InstancedMesh ? object.count : 1;
      for (let i = 0; i < count; i++) {
        const matrix = new THREE.Matrix4();
        if (object instanceof THREE.InstancedMesh)
          object.getMatrixAt(i, matrix);
        matrix.premultiply(object.matrixWorld);
        const geometry = object.geometry.clone().applyMatrix4(matrix);
        // Each material group has a consistent attribute layout.
        if (!geometry.getAttribute('uv'))
          geometry.setAttribute(
            'uv',
            new THREE.Float32BufferAttribute(
              new Float32Array(geometry.getAttribute('position').count * 2),
              2,
            ),
          );
        if (!(material as THREE.MeshStandardMaterial).vertexColors)
          geometry.deleteAttribute('color');
        parts.push(geometry);
      }
    });
    const transforms: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 40; i++) {
      const z = -5 - random() * 16,
        side = i % 2 ? 1 : -1;
      const x = pathCenter(z) + side * (1.2 + random() * 7);
      dummy.position.set(x, terrainHeight(x, z), z);
      const scale = (species === 0 ? 0.24 : 0.2) + random() * 0.22;
      dummy.scale.setScalar(scale);
      dummy.rotation.set(0, (random() - 0.5) * 0.8, (random() - 0.5) * 0.15);
      dummy.updateMatrix();
      transforms.push(dummy.matrix.clone());
    }
    for (const [material, parts] of groups) {
      if (!parts.length) continue;
      const geometry = mergeGeometries(parts)!;
      parts.forEach((part) => part.dispose());
      let diffuse = materials.get(material);
      if (!diffuse) {
        const original = material as THREE.MeshStandardMaterial;
        diffuse = new THREE.MeshLambertMaterial({
          color: original.color,
          vertexColors: original.vertexColors,
          side: original.side,
          emissive: original.emissive,
          emissiveIntensity: original.emissiveIntensity,
        });
        materials.set(material, diffuse);
      }
      const mesh = new THREE.InstancedMesh(
        geometry,
        diffuse,
        transforms.length,
      );
      transforms.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
      root.add(mesh);
    }
  }
  discarded.forEach((geometry) => geometry.dispose());
  // The skipped seed-grain material is not attached to the returned group.
  const used = new Set(
    root.children.map((child) => (child as THREE.Mesh).material),
  );
  templates.root.traverse((object) => {
    if (object instanceof THREE.Mesh && !used.has(object.material))
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material])
        material.dispose();
  });
  return root;
}
