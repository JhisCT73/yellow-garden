import * as THREE from 'three';
import { seededRandom } from '../utils/random';

export type GardenCare = 'light' | 'water' | 'music';

export function createGardenCare(seed: string, dpr: number) {
  const random = seededRandom(seed + '-rain');
  const positions = new Float32Array(150 * 3);
  for (let i = 0; i < 150; i++)
    positions.set(
      [(random() - 0.5) * 7, random() * 5, (random() - 0.5) * 4],
      i * 3,
    );
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const uniforms = {
    time: { value: 0 },
    dpr: { value: dpr },
    motion: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms,
    vertexShader: `uniform float time; uniform float dpr; uniform float motion;
      void main(){vec3 p=position;p.y=mod(p.y-time*1.1*motion+100.,5.);
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp(55./-mv.z,3.,8.)*dpr;}`,
    fragmentShader: `void main(){vec2 p=(gl_PointCoord-.5)*vec2(5.,2.);
      float r=length(p);if(r>1.)discard;
      gl_FragColor=vec4(.65,.84,1.,(1.-r)*.55);}`,
  });
  const rain = new THREE.Points(geometry, material);
  rain.frustumCulled = false;
  rain.visible = false;
  const color = new THREE.Color();
  return {
    rain,
    update(
      care: GardenCare,
      time: number,
      reduced: boolean,
      visible: boolean,
      light: THREE.PointLight,
    ) {
      rain.visible = care === 'water' && visible;
      uniforms.time.value = time;
      uniforms.motion.value = reduced ? 0 : 1;
      color.set(
        care === 'water' ? '#a1cfff' : care === 'music' ? '#ffe39c' : '#ffbd46',
      );
      light.color.copy(color);
      // A slow visual rhythm also works with audio muted; reduced motion stays still.
      if (care === 'music' && !reduced)
        light.intensity *= 1 + Math.sin(time * 1.6) * 0.18;
      if (care === 'light') light.intensity *= 1.25;
    },
  };
}
