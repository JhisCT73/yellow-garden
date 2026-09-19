import * as THREE from 'three';
import { seededRandom } from '../utils/random';

/** Sparse luminous air currents; no per-frame geometry allocations. */
export function createWindTrails(seed: string, dpr: number) {
  const random = seededRandom(seed + '-breeze');
  const positions = new Float32Array(280 * 3);
  for (let i = 0; i < 280; i++)
    positions.set([random(), i % 5, random()], i * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const uniforms = {
    time: { value: 0 },
    strength: { value: 0 },
    dpr: { value: dpr },
    motion: { value: 1 },
  };
  const points = new THREE.Points(
    geometry,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms,
      vertexShader: `uniform float time,strength,dpr,motion; varying float alpha;
      void main(){float t=fract(position.x+time*.12*motion*(.35+strength));
      vec3 p=vec3((t-.5)*6.,1.5+sin(t*3.14159)*1.7+position.y*.13,cos(t*6.283+position.y)*.6);
      p.y+=sin(time*.6+position.z*6.)*.08*motion;
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp(30./-mv.z,1.5,5.)*dpr;
      alpha=sin(t*3.14159)*strength*(.35+position.z*.65);}`,
      fragmentShader: `varying float alpha;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;
      gl_FragColor=vec4(1.,.84,.48,pow(1.-r,1.5)*alpha);}`,
    }),
  );
  points.frustumCulled = false;
  return { points, uniforms };
}
