import * as THREE from 'three';
import { seededRandom } from '../utils/random';
import type { createFlowers } from '../world/botany';

// Reuse the garden's hero instead of allocating a second flower and its materials.
export function createSecretBloom(
  flowers: ReturnType<typeof createFlowers>['flowers'],
  seed: string,
  dpr: number,
) {
  const random = seededRandom(seed + '-last-bloom');
  const positions = new Float32Array(120 * 3);
  for (let i = 0; i < 120; i++) {
    const angle = random() * Math.PI * 2;
    const radius = 1.5 + random() * 1.2;
    positions.set(
      [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (random() - 0.5) * 1.5,
      ],
      i * 3,
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const uniforms = {
    progress: { value: 0 },
    motion: { value: 1 },
    dpr: { value: dpr },
  };
  const points = new THREE.Points(
    geometry,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms,
      vertexShader: `uniform float progress; uniform float motion; uniform float dpr;
      varying float alpha;
      void main(){
        float t=smoothstep(.25,1.,progress);
        vec3 p=position*mix(.15,1.,t);
        p.y+=3.-t*t*.45*motion;
        vec4 mv=modelViewMatrix*vec4(p,1.);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp(42./-mv.z,2.,5.)*dpr;
        alpha=sin(t*3.14159)*.85;
      }`,
      fragmentShader: `varying float alpha;
      void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;
        gl_FragColor=vec4(1.,.78,.25,(1.-r)*alpha);}`,
    }),
  );
  points.frustumCulled = false;
  points.visible = false;
  return {
    points,
    update(active: boolean, progress: number, reducedMotion: boolean) {
      points.visible = active && !reducedMotion && progress < 1;
      uniforms.progress.value = progress;
      uniforms.motion.value = reducedMotion ? 0 : 1;
      if (!active) return;
      flowers.forEach((flower, index) => {
        if (index === 0) {
          flower.head.scale.multiplyScalar(1 + progress * 0.9);
          flower.group.scale.y *= 1 - progress * 0.08;
        } else flower.group.scale.multiplyScalar(1 - progress * 0.7);
      });
    },
  };
}
