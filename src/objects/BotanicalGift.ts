import * as THREE from 'three';

function ribbonStrip(points: THREE.Vector3[], width: number) {
  const curve = new THREE.CatmullRomCurve3(points);
  const vertices: number[] = [],
    indices: number[] = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48,
      p = curve.getPoint(t),
      tangent = curve.getTangent(t);
    const normal = new THREE.Vector3(-tangent.y, tangent.x, 0)
      .normalize()
      .multiplyScalar(width / 2);
    vertices.push(
      p.x - normal.x,
      p.y - normal.y,
      p.z,
      p.x + normal.x,
      p.y + normal.y,
      p.z + Math.sin(t * Math.PI) * 0.025,
    );
    if (i < 48) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
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

export function createBotanicalGift() {
  const root = new THREE.Group();
  const ribbon = new THREE.Group();
  ribbon.position.set(0, 1.05, 0.28);
  const satin = new THREE.MeshStandardMaterial({
    color: '#d6a844',
    roughness: 0.38,
    metalness: 0.35,
    side: THREE.DoubleSide,
  });
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 10), satin);
  knot.scale.set(1, 0.65, 0.55);
  ribbon.add(knot);
  const loops = new THREE.Group();
  for (const sign of [-1, 1]) {
    const points = [
      [0, 0, 0],
      [sign * 0.38, 0.2, 0],
      [sign * 0.52, 0.13, -0.1],
      [sign * 0.31, -0.05, -0.07],
      [0, 0, 0],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
    loops.add(new THREE.Mesh(ribbonStrip(points, 0.14), satin));
  }
  ribbon.add(loops);
  const tail = new THREE.Mesh(
    ribbonStrip(
      [
        new THREE.Vector3(0, 0, 0.025),
        new THREE.Vector3(0.2, -0.2, 0.08),
        new THREE.Vector3(0.4, -0.38, 0.12),
        new THREE.Vector3(0.65, -0.32, 0.09),
      ],
      0.12,
    ),
    satin,
  );
  ribbon.add(tail);
  const otherTail = new THREE.Mesh(
    ribbonStrip(
      [
        new THREE.Vector3(-0.025, 0, -0.01),
        new THREE.Vector3(-0.12, -0.2, 0.12),
        new THREE.Vector3(-0.11, -0.6, 0.14),
        new THREE.Vector3(-0.21, -0.7, 0.09),
      ],
      0.12,
    ),
    satin,
  );
  ribbon.add(otherTail);
  const wrap = new THREE.Mesh(
    new THREE.TorusGeometry(0.19, 0.04, 6, 32),
    satin,
  );
  wrap.rotation.x = Math.PI / 2;
  wrap.position.z = -0.24;
  ribbon.add(wrap);
  root.add(ribbon);

  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#fff8e7';
    context.fillRect(0, 0, 768, 512);
    context.strokeStyle = '#b19a53';
    context.lineWidth = 2;
    context.strokeRect(26, 26, 716, 460);
    context.strokeRect(34, 34, 700, 444);
    context.textAlign = 'center';
    context.fillStyle = '#716034';
    context.font = 'italic 88px Georgia';
    context.fillText('Para ti', 384, 275);
    context.font = '22px Georgia';
    context.fillText('UN POQUITO DE PRIMAVERA', 384, 350);
    context.font = '48px Georgia';
    context.fillText('✳', 384, 157);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const paper = new THREE.MeshStandardMaterial({
    color: '#fff8e7',
    roughness: 0.95,
    side: THREE.DoubleSide,
  });
  const coverMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.92,
    side: THREE.DoubleSide,
  });
  const card = new THREE.Group();
  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(0.96, 0.64, 0.016),
    paper,
  );
  const hinge = new THREE.Group();
  hinge.position.x = -0.48;
  const cover = new THREE.Mesh(
    new THREE.PlaneGeometry(0.96, 0.64),
    coverMaterial,
  );
  cover.position.set(0.48, 0, 0.018);
  hinge.add(cover);
  card.add(backing, hinge);
  root.add(card);

  return {
    root,
    card,
    ribbon,
    tail,
    texture,
    update(
      gather: number,
      reveal: number,
      open: number,
      time: number,
      motion: boolean,
    ) {
      root.visible = gather > 0.8;
      const appearance = THREE.MathUtils.smoothstep(gather, 0.8, 1);
      ribbon.scale.setScalar(Math.max(0.001, appearance));
      ribbon.rotation.z = motion ? Math.sin(time * 0.65) * 0.03 : 0;
      loops.scale.set(1 + reveal * 0.6, Math.max(0.01, 1 - reveal), 1);
      loops.visible = reveal < 0.97;
      knot.scale.x = 1 - reveal * 0.35;
      tail.position.x = reveal * 0.75;
      tail.rotation.z = reveal * 0.6;
      otherTail.rotation.z = -reveal * 0.25;
      wrap.scale.setScalar(1 + reveal * 0.2);
      card.visible = reveal > 0.02;
      card.position.set(
        0.12 + reveal * 0.84,
        1.12 + reveal * 0.35,
        0.08 + reveal * 1.65,
      );
      card.rotation.set(-0.04, -0.12 * reveal, -0.15 * reveal);
      card.scale.setScalar(0.5 + reveal * 0.5);
      hinge.rotation.y = -open * 1.5;
    },
  };
}
