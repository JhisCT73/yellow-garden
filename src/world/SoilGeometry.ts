import * as THREE from 'three';

export function createSoilGeometry() {
  const geometry = new THREE.PlaneGeometry(10, 10, 64, 64);
  const positions = geometry.getAttribute('position');
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i);
    const radiusSquared = x * x + y * y;
    const relief =
      (1 - Math.exp(-radiusSquared * 12)) * Math.exp(-radiusSquared * 0.14);
    positions.setZ(
      i,
      (Math.sin(x * 9) * Math.cos(y * 7) * 0.018 +
        Math.sin(x * 3 + y * 2) * 0.025) *
        relief,
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}
