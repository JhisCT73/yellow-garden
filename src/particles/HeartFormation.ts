import * as THREE from 'three';
import { seededRandom } from '../utils/random';
import { heartCloud } from './heart';
import { textCloud } from './TextFormation';
import { gardenConfig } from '../config/garden.config';

export function createHeartFormation(seed: string, count: number, dpr: number) {
  const random = seededRandom(seed + '-flight');
  const source = new Float32Array(count * 3),
    scatter = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    source.set(
      [(random() - 0.5) * 2, 1.5 + random() * 1.5, (random() - 0.5) * 0.6],
      i * 3,
    );
    scatter.set(
      [
        Math.cos(angle) * (1 + random() * 2.5),
        2.4 + Math.sin(angle) * (1 + random() * 1.8),
        (random() - 0.5) * 3,
      ],
      i * 3,
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(source, 3));
  geometry.setAttribute('scatter', new THREE.BufferAttribute(scatter, 3));
  geometry.setAttribute(
    'heart',
    new THREE.BufferAttribute(heartCloud(seed, count), 3),
  );
  geometry.setAttribute(
    'message',
    new THREE.BufferAttribute(textCloud(seed, count, gardenConfig.date), 3),
  );
  const uniforms = {
    flight: { value: 0 },
    formation: { value: 0 },
    opacity: { value: 0 },
    time: { value: 0 },
    motion: { value: 1 },
    dpr: { value: dpr },
    lettering: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: `attribute vec3 scatter; attribute vec3 heart; attribute vec3 message;
      uniform float flight, formation, time, motion, dpr, lettering; varying float sparkle;
      void main(){
        vec3 p=mix(position,scatter,flight); p=mix(p,heart,formation);
        float pulse=1.+sin(time*1.5)*.022*formation*motion*(1.-lettering);
        p=(p-vec3(0.,2.4,0.))*pulse+vec3(0.,2.4,0.);
        p.z+=sin(time*.5+heart.x*2.)*.07*formation*motion;
        p=mix(p,message,lettering);
        p.z+=sin(lettering*3.14159265)*scatter.z*.4*motion;
        vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
        sparkle=mix(.65+.35*sin(heart.x*30.+heart.y*20.+time*motion),1.,lettering);
        float grain=fract(sin(dot(heart.xy,vec2(12.9898,78.233)))*43758.5453);
        gl_PointSize=clamp(mix(mix(28.,100.,grain*grain),58.,lettering)/-mv.z,1.5,11.)*dpr;
      }`,
    fragmentShader: `uniform float opacity; varying float sparkle;
      void main(){ float r=length(gl_PointCoord-.5)*2.; if(r>1.)discard;
        float glow=pow(1.-r,1.4); gl_FragColor=vec4(1.,.63+.16*sparkle,.18,glow*opacity*sparkle); }`,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, uniforms };
}
