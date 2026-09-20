import * as THREE from 'three';
import { gardenConfig } from '../config/garden.config';

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
  const satin = new THREE.MeshPhysicalMaterial({
    color: '#d6a844',
    roughness: 0.32,
    metalness: 0.18,
    sheen: 0.85,
    sheenColor: '#fff0be',
    sheenRoughness: 0.42,
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
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const illustration = document.createElement('canvas');
  illustration.width = 768;
  illustration.height = 1024;
  const illustrationContext = illustration.getContext('2d');
  const illustrationTexture = new THREE.CanvasTexture(illustration);
  illustrationTexture.colorSpace = THREE.SRGBColorSpace;
  function paint(image?: HTMLImageElement) {
    if (!context) return;
    context.fillStyle = '#fff8e7';
    context.fillRect(0, 0, 768, 1024);
    illustrationContext?.clearRect(0, 0, 768, 1024);
    if (illustrationContext) {
      illustrationContext.fillStyle = '#fff8e7';
      illustrationContext.fillRect(0, 0, 768, 1024);
      if (image)
        illustrationContext.drawImage(image, 0, 0, 720, 1024, 0, 0, 768, 1024);
      illustrationContext.strokeStyle = '#b19a53';
      illustrationContext.strokeRect(28, 28, 712, 968);
    }
    context.strokeStyle = '#b19a53';
    context.lineWidth = 2;
    context.strokeRect(26, 26, 716, 972);
    context.strokeRect(34, 34, 700, 956);
    context.textAlign = 'center';
    context.fillStyle = '#716034';
    context.font = 'italic 88px Georgia';
    context.fillText('Para ti', 384, 455);
    context.font = '22px Georgia';
    context.fillText('UN POQUITO DE PRIMAVERA', 384, 530);
    context.beginPath();
    context.arc(384, 755, 62, 0, Math.PI * 2);
    context.stroke();
    context.font = 'italic 30px Georgia';
    context.fillText(gardenConfig.date, 384, 765);
    texture.needsUpdate = true;
    illustrationTexture.needsUpdate = true;
  }
  paint();
  const paperImage = new Image();
  paperImage.onload = () => paint(paperImage);
  paperImage.src = `${import.meta.env.BASE_URL}textures/botanical-paper.jpg`;
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
    new THREE.BoxGeometry(0.74, 0.96, 0.035),
    paper,
  );
  const hinge = new THREE.Group();
  backing.position.x = 0.37;
  const cover = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.94),
    coverMaterial,
  );
  cover.position.set(0.37, 0, 0.02);
  const leftBacking = new THREE.Mesh(backing.geometry, paper);
  leftBacking.position.x = -0.37;
  const leftPage = new THREE.Mesh(
    cover.geometry,
    new THREE.MeshStandardMaterial({
      map: illustrationTexture,
      roughness: 0.92,
      side: THREE.DoubleSide,
    }),
  );
  leftPage.position.set(-0.37, 0, 0.022);
  hinge.add(leftBacking, leftPage);
  card.add(backing, cover, hinge);
  root.add(card);

  return {
    root,
    card,
    ribbon,
    tail,
    texture,
    dispose() {
      paperImage.onload = null;
      texture.dispose();
      illustrationTexture.dispose();
    },
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
        0.12 - reveal * 0.12,
        1.12 + reveal * 1.03,
        0.08 + reveal * 2.42,
      );
      card.rotation.set(-0.04, -0.08 * reveal, -0.055 * reveal);
      card.scale.setScalar(0.5 + reveal);
      hinge.rotation.y = 0.2 + (1 - reveal) * 2.8 + open * 0.08;
    },
  };
}
