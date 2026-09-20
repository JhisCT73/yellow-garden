import * as THREE from 'three';
import { seededRandom } from '../utils/random';
import { createFlowers } from './botany';

/** The final clearing is geometry in world space, not a screenshot behind the bench. */
export function createBenchEnvironment(seed: string, soil: THREE.Texture) {
  const root = new THREE.Group();
  root.visible = false;
  const random = seededRandom(seed + '-lakeside');
  const uniforms = { time: { value: 0 } };
  const noise = `
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y); }
    float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+7.1;a*=.5;} return v; }
  `;
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(65, 40, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms,
      vertexShader: `varying vec3 vDirection; void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `varying vec3 vDirection; uniform float time; ${noise}
      void main(){vec3 d=normalize(vDirection);vec2 uv=vec2(atan(d.x,-d.z),asin(d.y));
      vec3 col=mix(vec3(.014,.027,.052),vec3(.003,.009,.032),smoothstep(-.05,.8,d.y));
      vec2 cell=floor(uv*320.);float star=step(.996,hash(cell))*pow(max(0.,1.-length(fract(uv*320.)-.5)*2.),6.);
      col+=star*vec3(.55,.65,.9)*smoothstep(.02,.35,d.y);
      float clouds=smoothstep(.47,.73,fbm(uv*vec2(6.,13.)+vec2(time*.012,0.)));
      float wisps=fbm(uv*vec2(14.,26.)+vec2(time*.019,3.));
      clouds*=smoothstep(-.02,.13,d.y)*(1.-smoothstep(.65,.95,d.y));
      col=mix(col,vec3(.045,.07,.12)*(0.55+wisps*.65),clouds*.85);
      gl_FragColor=vec4(col,1.); #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`.replace(' #include', '\n#include'),
    }),
  );
  root.add(sky);
  // Moon is a shaded sphere with procedural crater variation, placed behind drifting clouds.
  const moonMaterial = new THREE.ShaderMaterial({
    vertexShader: `varying vec3 p; void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec3 p; ${noise} void main(){float n=fbm(p.xy*7.);float c=smoothstep(.3,.65,n);gl_FragColor=vec4(mix(vec3(.52,.45,.32),vec3(1.,.9,.66),c)*1.4,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`,
  });
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, 32, 24),
    moonMaterial,
  );
  moon.position.set(7, 7, -32);
  root.add(moon);
  // Cloud sheets lie in front of the moon too, so its silhouette is occasionally veiled.
  for (let i = 0; i < 3; i++) {
    const cloud = new THREE.Mesh(
      new THREE.PlaneGeometry(52, 7),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { time: uniforms.time, offset: { value: i * 4.7 } },
        vertexShader: `varying vec2 uvCloud;void main(){uvCloud=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `varying vec2 uvCloud;uniform float time;uniform float offset;${noise}void main(){vec2 p=uvCloud*vec2(10.,3.);float n=fbm(p+vec2(time*.025+offset,offset));float a=smoothstep(.46,.7,n)*sin(uvCloud.y*3.14159)*.48;gl_FragColor=vec4(.05,.075,.12,a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`,
      }),
    );
    cloud.position.set(0, 6 + i * 2.3, -24 - i * 2);
    root.add(cloud);
  }
  // Layered ridgelines retain actual depth, with their own shaded slopes.
  for (let layer = 0; layer < 3; layer++) {
    const geometry = new THREE.PlaneGeometry(90, 16, 90, 8);
    const positions = geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i),
        v = (positions.getY(i) + 8) / 16;
      const ridge =
        3 +
        Math.sin(x * 0.19 + layer * 2) * 1.8 +
        Math.sin(x * 0.47 + 1.4) * 0.7 +
        Math.sin(x * 1.1) * 0.22;
      positions.setXYZ(
        i,
        x,
        -3 + v * (ridge + 3),
        Math.sin(x * 0.18) * 2 + Math.sin(v * 3) * 2,
      );
    }
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: ['#1a2c44', '#132339', '#0b1b2a'][layer],
        side: THREE.DoubleSide,
        fog: false,
      }),
    );
    mesh.position.set(0, 0, -47 + layer * 8);
    root.add(mesh);
  }
  const lake = new THREE.Mesh(
    new THREE.PlaneGeometry(45, 30),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.DoubleSide,
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `varying vec2 vUv;uniform float time;${noise}void main(){float ripple=sin(vUv.y*430.+sin(vUv.x*43.+time*.3)*3.+time*.6);float light=exp(-pow((vUv.x-.68)*10.,2.));vec3 c=vec3(.008,.023,.045)+vec3(.045,.065,.085)*light*(.4+.6*smoothstep(.3,1.,ripple));gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`,
    }),
  );
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(0, -0.65, -21);
  root.add(lake);
  const land = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 16, 30, 25),
    new THREE.MeshStandardMaterial({
      map: soil,
      color: '#69513a',
      roughness: 1,
    }),
  );
  land.rotation.x = -Math.PI / 2;
  land.position.set(0, -0.07, -0.6);
  root.add(land);
  // Pines frame a clear central view toward the water.
  const pines = new THREE.InstancedMesh(
    new THREE.LatheGeometry(
      Array.from({ length: 33 }, (_, i) => {
        const t = i / 32;
        return new THREE.Vector2(
          (1 - t) * (0.28 + (i % 2) * 0.18),
          t * 3 - 1.5,
        );
      }),
      7,
    ),
    new THREE.MeshBasicMaterial({ color: '#071411', fog: false }),
    150,
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 50; i++) {
    const side = i % 2 ? 1 : -1,
      x = side * (5 + random() * 15),
      z = -7 - random() * 23,
      h = 1 + random() * 2;
    for (let j = 0; j < 3; j++) {
      dummy.position.set(x, -0.4 + h * (0.5 + j * 0.45), z);
      dummy.scale.set(h * (1 - j * 0.22), h * 0.65, h * (1 - j * 0.22));
      dummy.updateMatrix();
      pines.setMatrixAt(i * 3 + j, dummy.matrix);
    }
  }
  root.add(pines);
  const villageGeometry = new THREE.BufferGeometry();
  const villagePositions = [];
  for (let i = 0; i < 75; i++) {
    const x = (random() - 0.5) * 30,
      z = -26 + random() * 5;
    villagePositions.push(x, 0.15 + random() * 0.4, z);
  }
  villageGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(villagePositions, 3),
  );
  root.add(
    new THREE.Points(
      villageGeometry,
      new THREE.PointsMaterial({
        color: '#ffd078',
        size: 0.075,
        sizeAttenuation: true,
        fog: false,
      }),
    ),
  );

  const borderFlowers = createFlowers(seed + '-bench-flowers', 24);
  borderFlowers.update(1, 1, 0, false);
  borderFlowers.flowers.forEach((f, i) => {
    f.group.position.set(
      (i % 2 ? 1 : -1) * (1.8 + random() * 2.7),
      -0.02,
      -4 + random() * 7,
    );
    f.group.scale.setScalar(0.2 + random() * 0.35);
  });
  root.add(borderFlowers.root);
  const undergrowth = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.035, 1),
    new THREE.MeshStandardMaterial({ color: '#263818', roughness: 1 }),
    700,
  );
  const smallFlowers = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.04, 5, 3),
    new THREE.MeshStandardMaterial({
      color: '#f4b72e',
      emissive: '#9c510d',
      emissiveIntensity: 0.16,
      roughness: 0.8,
    }),
    600,
  );
  for (let i = 0; i < 700; i++) {
    const z = -7 + random() * 11,
      x = (i % 2 ? 1 : -1) * (1.3 + random() * 4);
    dummy.position.set(x, random() * 0.4, z);
    dummy.rotation.set(random() * 3, random() * 6, random() * 3);
    dummy.scale.set(1 + random(), 0.5 + random(), 2 + random() * 2);
    dummy.updateMatrix();
    undergrowth.setMatrixAt(i, dummy.matrix);
    if (i < 600) {
      dummy.position.y = 0.12 + random() * 0.5;
      dummy.scale.set(1.4, 0.5, 1.4);
      dummy.updateMatrix();
      smallFlowers.setMatrixAt(i, dummy.matrix);
    }
  }
  root.add(undergrowth, smallFlowers);
  const wood = new THREE.MeshStandardMaterial({
    color: '#49321e',
    map: soil,
    bumpMap: soil,
    bumpScale: 0.06,
    roughness: 0.95,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: '#30291b',
    metalness: 0.65,
    roughness: 0.5,
  });
  function beam(a: THREE.Vector3, b: THREE.Vector3, r: number) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.8, r, a.distanceTo(b), 7),
      wood,
    );
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      b.clone().sub(a).normalize(),
    );
    root.add(mesh);
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const x = side * (1.7 + i * 0.32),
        z = 1.8 - i * 1.8;
      beam(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 1, z), 0.07);
      if (i < 3)
        for (const y of [0.4, 0.8])
          beam(
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(side * (1.7 + (i + 1) * 0.32), y, z - 1.8),
            0.04,
          );
    }
    const lantern = new THREE.Group();
    lantern.position.set(side * 1.6, 0.85, 1.1);
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.38, 0.25),
      new THREE.MeshBasicMaterial({
        color: '#ffc452',
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      }),
    );
    lantern.add(glass);
    for (const y of [-0.22, 0.22]) {
      const lid = new THREE.Mesh(
        new THREE.BoxGeometry(0.33, 0.045, 0.33),
        metal,
      );
      lid.position.y = y;
      lantern.add(lid);
    }
    for (const x of [-0.14, 0.14])
      for (const z of [-0.14, 0.14]) {
        const bar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, 0.44, 5),
          metal,
        );
        bar.position.set(x, 0, z);
        lantern.add(bar);
      }
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 8),
      new THREE.MeshBasicMaterial({ color: '#fff1b5' }),
    );
    flame.scale.y = 2;
    lantern.add(flame);
    const light = new THREE.PointLight('#ffbc50', 5, 5, 2);
    lantern.add(light);
    root.add(lantern);
  }
  // A real trunk and arching branches frame the left edge.
  beam(new THREE.Vector3(-4, 0, -1), new THREE.Vector3(-3.7, 6, -1), 0.38);
  beam(
    new THREE.Vector3(-3.8, 3.8, -1),
    new THREE.Vector3(-0.8, 6.3, -2),
    0.15,
  );
  beam(new THREE.Vector3(-3.8, 5, -1), new THREE.Vector3(-5, 6.5, -3), 0.16);
  const leaves = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 6, 4),
    new THREE.MeshStandardMaterial({ color: '#344323', roughness: 0.9 }),
    180,
  );
  for (let i = 0; i < 180; i++) {
    dummy.position.set(
      -4 + random() * 5,
      3.7 + random() * 1.2,
      -2 + random() * 2,
    );
    dummy.scale.set(0.12, 0.045, 0.25);
    dummy.rotation.set(random(), random() * 6, random() * 3);
    dummy.updateMatrix();
    leaves.setMatrixAt(i, dummy.matrix);
  }
  root.add(leaves);
  const motes = new THREE.BufferGeometry();
  const points = [];
  for (let i = 0; i < 160; i++)
    points.push((random() - 0.5) * 11, random() * 4, -5 + random() * 9);
  motes.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const fireflies = new THREE.Points(
    motes,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms,
      vertexShader: `uniform float time;varying float glow;void main(){vec3 p=position;p.x+=sin(time*.25+position.z)*.12;p.y+=sin(time*.4+position.x)*.08;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(22.,55./-mv.z);glow=.55+.45*sin(time+position.x*8.);}`,
      fragmentShader: `varying float glow;void main(){float d=length(gl_PointCoord-.5)*2.;gl_FragColor=vec4(1.,.65,.15,pow(max(0.,1.-d),2.)*glow);}`,
    }),
  );
  root.add(fireflies);
  return {
    root,
    update(active: boolean, time: number, mobile: boolean) {
      root.visible = active;
      moon.position.x = mobile ? 0 : 7;
      if (active) uniforms.time.value = time;
    },
  };
}

