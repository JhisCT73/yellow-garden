import * as THREE from 'three';

/** Soft atmospheric shafts behind the plant; no shadow-map or texture pass. */
export function createOpeningLight() {
  const root = new THREE.Group();
  const uniforms = { time: { value: 0 }, strength: { value: 0 } };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv;
      void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv; uniform float time,strength;
      void main(){
        float crossSection=pow(max(0.,1.-abs(vUv.x-.5)*2.),2.4);
        float ends=smoothstep(0.,.16,vUv.y)*(1.-smoothstep(.88,1.,vUv.y));
        float drift=.85+.15*sin(vUv.y*9.+time*.3);
        gl_FragColor=vec4(1.,.65,.24,crossSection*ends*drift*strength);
      }`,
  });
  const geometry = new THREE.PlaneGeometry(1, 6);
  for (let i = 0; i < 3; i++) {
    const beam = new THREE.Mesh(geometry, material);
    beam.position.set(-0.25 + i * 0.48, 2.7, -0.75 - i * 0.08);
    beam.rotation.z = -0.17;
    beam.scale.x = i === 1 ? 0.5 : 0.23;
    root.add(beam);
  }
  return {
    root,
    update(visible: boolean, growth: number, time: number, motion: boolean) {
      root.visible = visible;
      uniforms.time.value = motion ? time : 0;
      uniforms.strength.value = 0.075 + growth * 0.065;
    },
  };
}
