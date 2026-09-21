import * as THREE from 'three';

export function pathCenter(z: number) {
  return Math.sin(z * 0.22) * 0.55;
}
export function terrainHeight(x: number, z: number) {
  const edge = THREE.MathUtils.smoothstep(
    Math.abs(x - pathCenter(z)),
    0.8,
    3.8,
  );
  const opening = THREE.MathUtils.smoothstep(Math.hypot(x, z), 2.5, 5);
  return (
    -0.09 +
    opening *
      (edge * (0.25 + 0.12 * Math.sin(z * 0.6)) +
        0.035 * Math.sin(x * 3.7) * Math.cos(z * 2.6))
  );
}
export function createGardenTerrain(soil: THREE.Texture) {
  const geometry = new THREE.PlaneGeometry(40, 34, 150, 130);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, -7);
  const positions = geometry.getAttribute('position');
  const colors: number[] = [];
  const path = new THREE.Color('#9e7750'),
    bank = new THREE.Color('#37422a'),
    color = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      z = positions.getZ(i);
    positions.setY(i, terrainHeight(x, z));
    const margin = THREE.MathUtils.smoothstep(
      Math.abs(x - pathCenter(z)),
      0.75,
      2.1,
    );
    color
      .copy(path)
      .lerp(bank, margin)
      .multiplyScalar(0.9 + Math.sin(x * 11 + z * 7) * 0.06);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < uv.count; i++)
    uv.setXY(i, uv.getX(i) * 8, uv.getY(i) * 7);
  geometry.computeVertexNormals();
  return new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      map: soil,
      bumpMap: soil,
      bumpScale: 0.045,
      vertexColors: true,
      roughness: 1,
    }),
  );
}
