import * as THREE from 'three';

/** A real 3D bench, kept separate from the distant painted landscape. */
export function createGardenBench() {
  const root = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({
    color: '#503621',
    roughness: 0.88,
  });
  wood.onBeforeCompile = (shader) => {
    shader.vertexShader =
      'varying vec3 woodPosition;\n' +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nwoodPosition=position;',
      );
    shader.fragmentShader =
      'varying vec3 woodPosition;\n' +
      shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
      float grain=sin(woodPosition.y*480.+sin(woodPosition.x*3.7)*2.+sin(woodPosition.x*17.)*.7);
      float weather=sin(woodPosition.x*31.+woodPosition.y*55.)*.05;
      diffuseColor.rgb*=.82+grain*.12+weather;
    `,
      );
  };
  const iron = new THREE.MeshStandardMaterial({
    color: '#17232b',
    metalness: 0.65,
    roughness: 0.5,
  });
  const slat = new THREE.BoxGeometry(2.3, 0.12, 0.14);
  for (let i = 0; i < 4; i++) {
    const seat = new THREE.Mesh(slat, wood);
    seat.position.set(0, 0.62, -0.24 + i * 0.16);
    root.add(seat);
    const back = new THREE.Mesh(slat, wood);
    back.position.set(0, 0.9 + i * 0.16, -0.32 - i * 0.035);
    root.add(back);
  }
  const legGeometry = new THREE.BoxGeometry(0.075, 0.65, 0.075);
  for (const x of [-0.92, 0.92]) {
    for (const z of [-0.24, 0.24]) {
      const leg = new THREE.Mesh(legGeometry, iron);
      leg.position.set(x, 0.3, z);
      root.add(leg);
    }
    const support = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.1, 0.08),
      iron,
    );
    support.position.set(x, 0.9, -0.38);
    support.rotation.x = -0.2;
    root.add(support);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.72), iron);
    arm.position.set(x, 0.96, 0);
    root.add(arm);
  }
  const light = new THREE.PointLight('#ffd785', 7, 5);
  light.position.set(-0.5, 2.4, 1.4);
  root.add(light);
  root.rotation.y = -0.24;
  root.scale.setScalar(0.88);
  root.position.x = -0.22;
  root.visible = false;
  return root;
}
