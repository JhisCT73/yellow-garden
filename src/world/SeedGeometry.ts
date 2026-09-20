import * as THREE from 'three';

/** A tapered shell with a shallow longitudinal seam and baked color variation. */
export function createSeedGeometry() {
  const geometry = new THREE.SphereGeometry(0.14, 48, 32);
  const positions = geometry.getAttribute('position');
  const colors = new Float32Array(positions.count * 3);
  const color = new THREE.Color();
  const dark = new THREE.Color('#694220');
  const gold = new THREE.Color('#c39249');
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i) / 0.14;
    const y = positions.getY(i) / 0.14;
    const z = positions.getZ(i) / 0.14;
    const taper = 0.85 - x * 0.3;
    const seam = Math.exp(-z * z * 240) * Math.max(0, y);
    const grain = Math.sin(x * 75 + z * 19) * Math.sin(y * 61 - x * 13);
    positions.setXYZ(
      i,
      x * 0.15,
      y * 0.14 * taper * (1 - seam * 0.075) + grain * 0.00035,
      z * 0.14 * taper,
    );
    color.copy(dark).lerp(gold, 0.5 + x * 0.12 + y * 0.2 + grain * 0.04);
    color.multiplyScalar(1 - seam * 0.38);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}
