import * as THREE from 'three';

/** Shared curved surfaces; their detail is baked once rather than rebuilt per frame. */
export function botanicalSurface(
  length: number,
  width: number,
  leaf = false,
  distant = false,
) {
  const rows = distant ? 8 : leaf ? 24 : 32;
  const columns = distant ? 4 : 12;
  const positions: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  const base = new THREE.Color(leaf ? '#142f20' : '#b95b0c');
  const tip = new THREE.Color(leaf ? '#536b37' : '#ffd451');
  const color = new THREE.Color();
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    const envelope = Math.pow(
      Math.max(0, Math.sin(Math.PI * t)),
      leaf ? 0.8 : 0.55,
    );
    for (let column = 0; column <= columns; column++) {
      const s = (column / columns) * 2 - 1;
      const serration = leaf
        ? 1 + Math.sin(t * Math.PI * 18) * 0.035
        : 1 + Math.sin(t * 23) * 0.025;
      const ridge = leaf
        ? (1 - Math.abs(s)) * 0.1 * envelope
        : Math.cos(s * Math.PI * 3) * 0.008 * envelope;
      positions.push(
        s * width * envelope * serration +
          Math.sin(t * Math.PI) * t * (leaf ? 0.08 : 0.035),
        t * length,
        ridge +
          s * s * envelope * (leaf ? -0.04 : 0.065) +
          Math.sin(t * Math.PI) * 0.11 -
          t ** 4 * (leaf ? 0.24 : 0.15),
      );
      color
        .copy(base)
        .lerp(tip, leaf ? 0.35 + t * 0.3 : 0.12 + Math.pow(t, 0.7) * 0.8);
      if (leaf) {
        const centralVein = Math.abs(s) < 0.09;
        const veinDistance = Math.abs(
          Math.sin((t - Math.abs(s) * 0.15) * Math.PI * 9),
        );
        if (centralVein || veinDistance < 0.18)
          color.lerp(tip, centralVein ? 0.55 : 0.35);
      } else color.multiplyScalar(0.95 + Math.cos(s * Math.PI * 4) * 0.05);
      colors.push(color.r, color.g, color.b);
    }
  }
  for (let row = 0; row < rows; row++)
    for (let column = 0; column < columns; column++) {
      const a = row * (columns + 1) + column;
      indices.push(
        a,
        a + 1,
        a + columns + 1,
        a + 1,
        a + columns + 2,
        a + columns + 1,
      );
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
