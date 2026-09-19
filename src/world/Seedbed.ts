import * as THREE from 'three';
import { seededRandom } from '../utils/random';

/** Small physical details around the seed, shared by the close-up growth shots. */
export function createSeedbed(seed: string) {
  const root = new THREE.Group();
  const random = seededRandom(seed + '-soil');
  const stones = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshStandardMaterial({ color: '#574233', roughness: 0.94 }),
    650,
  );
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < stones.count; i++) {
    const angle = random() * Math.PI * 2;
    const radius = 0.23 + Math.pow(random(), 0.7) * 4;
    const scale = 0.007 + random() * 0.027;
    dummy.position.set(
      Math.cos(angle) * radius,
      scale * 0.1,
      Math.sin(angle) * radius,
    );
    dummy.scale.set(scale * (1 + random()), scale * 0.6, scale);
    dummy.rotation.set(random() * 3, random() * 3, random() * 3);
    dummy.updateMatrix();
    stones.setMatrixAt(i, dummy.matrix);
    color.setHSL(
      0.08 + random() * 0.03,
      0.2 + random() * 0.2,
      0.12 + random() * 0.12,
    );
    stones.setColorAt(i, color);
  }
  root.add(stones);
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 1.8),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { strength: { value: 1 } },
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `varying vec2 vUv;uniform float strength;void main(){float r=length(vUv-.5)*2.;float a=exp(-r*r*9.)*.35*strength;gl_FragColor=vec4(1.,.54,.12,a);}`,
    }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.016;
  root.add(glow);
  const dustPositions = new Float32Array(170 * 3);
  for (let i = 0; i < 170; i++)
    dustPositions.set(
      [(random() - 0.5) * 2.1, random() * 3.7, (random() - 0.5) * 1.5],
      i * 3,
    );
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(dustPositions, 3),
  );
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 }, dpr: { value: 1 } },
      vertexShader: `uniform float time;uniform float dpr;varying float a;void main(){vec3 p=position;p.y+=sin(time*.65+position.x*7.)*.08;p.x+=sin(time*.4+position.y)*.06;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(20./-mv.z,2.,7.)*dpr;a=.4+.5*sin(position.y*14.+time);}`,
      fragmentShader: `varying float a;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(1.,.7,.2,pow(1.-r,2.)*a);}`,
    }),
  );
  root.add(dust);
  return { root, glow, dust };
}
