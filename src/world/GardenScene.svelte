<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { useTask, useThrelte } from '@threlte/core';
  import * as THREE from 'three';
  import { gsap } from 'gsap';
  import { createFlowers, createMeadow } from './botany';
  import { seededRandom } from '../utils/random';
  import { gardenConfig } from '../config/garden.config';
  import { qualityForDevice } from '../systems/PerformanceManager';
  import type { GardenStage } from '../machines/garden.machine';

  let {
    stage,
    seed,
    reducedMotion,
    oncomplete,
    onflower,
    onplant,
    onready,
    onerror,
  }: {
    stage: GardenStage;
    seed: string;
    reducedMotion: boolean;
    oncomplete: (event: 'GROWN' | 'BLOOMED') => void;
    onflower: (index: number) => void;
    onplant: () => void;
    onready: () => void;
    onerror: () => void;
  } = $props();
  const { scene, camera, renderer, size } = useThrelte();
  const root = new THREE.Group();
  const quality = qualityForDevice();
  const initialSeed = untrack(() => seed);
  const flowers = createFlowers(initialSeed, gardenConfig.flowerCount);
  const growth = { value: 0 },
    bloom = { value: 0 };
  let ready = $state(false);
  let time = 0;
  let pointerX = 0,
    pointerY = 0;
  const seedMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 24, 16),
    new THREE.MeshStandardMaterial({
      color: '#ffe194',
      emissive: '#ffb52e',
      emissiveIntensity: 1.4,
      roughness: 0.4,
    }),
  );
  seedMesh.scale.set(0.7, 1.4, 0.7);
  seedMesh.position.set(0, 0.5, 0);
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.44, 64),
    new THREE.MeshBasicMaterial({
      color: '#e5b95a',
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.018;
  const random = seededRandom(initialSeed + '-stars');
  const positions = new Float32Array(quality.particles * 3);
  for (let i = 0; i < quality.particles; i++) {
    positions[i * 3] = (random() - 0.5) * 20;
    positions[i * 3 + 1] = random() * 8 + 0.2;
    positions[i * 3 + 2] = (random() - 0.5) * 12;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3),
  );
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 }, dpr: { value: quality.dpr } },
      vertexShader: `uniform float time; uniform float dpr; varying float alpha;
      void main(){ vec3 p=position; p.x+=sin(time*.2+position.y)*.15; p.y+=sin(time*.3+position.x)*.12;
      vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp(32./-mv.z,1.5,5.)*dpr; alpha=.25+.65*pow(.5+.5*sin(time+position.x*5.),2.); }`,
      fragmentShader: `varying float alpha; void main(){float r=length(gl_PointCoord-.5)*2.; if(r>1.)discard; gl_FragColor=vec4(1.,.82,.39, pow(1.-r,1.5)*alpha);}`,
    }),
  );
  const light = new THREE.PointLight('#ffbd46', 6, 7, 2);
  light.position.set(0, 0.9, 0.6);
  const raycaster = new THREE.Raycaster();
  let pointerDown = { x: 0, y: 0 };
  onMount(() => {
    scene.background = new THREE.Color('#080c18');
    scene.fog = new THREE.FogExp2('#080c18', 0.065);
    renderer.setPixelRatio(quality.dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    const ambient = new THREE.HemisphereLight('#adc1ed', '#14271e', 2.1);
    const key = new THREE.DirectionalLight('#fff1c0', 3.8);
    key.position.set(3, 6, 5);
    const rim = new THREE.DirectionalLight('#91aedb', 2.4);
    rim.position.set(-4, 4, -4);
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(30, 64),
      new THREE.MeshStandardMaterial({ color: '#111f1d', roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    root.add(
      ambient,
      key,
      rim,
      ground,
      flowers.root,
      createMeadow(seed, quality.grass),
      seedMesh,
      halo,
      light,
      particles,
    );
    scene.add(root);
    const canvas = renderer.domElement;
    function down(event: PointerEvent) {
      pointerDown = { x: event.clientX, y: event.clientY };
    }
    function move(event: PointerEvent) {
      pointerX = event.clientX / window.innerWidth - 0.5;
      pointerY = event.clientY / window.innerHeight - 0.5;
    }
    function click(event: PointerEvent) {
      if (
        (stage !== 'GARDEN' && stage !== 'INTRO') ||
        Math.hypot(
          event.clientX - pointerDown.x,
          event.clientY - pointerDown.y,
        ) > 12
      )
        return;
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          (-(event.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera.current,
      );
      if (stage === 'INTRO') {
        if (raycaster.intersectObjects([seedMesh, halo]).length) onplant();
        return;
      }
      const hit = raycaster.intersectObjects(
        flowers.flowers.map((f) => f.head),
        true,
      )[0];
      if (hit) {
        const index = flowers.flowers.findIndex(
          (f) => f.head === hit.object.parent,
        );
        if (index >= 0) onflower(index);
      }
    }
    function lost(event: Event) {
      event.preventDefault();
      onerror();
    }
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointerup', click);
    window.addEventListener('pointermove', move);
    ready = true;
    onready();
    return () => {
      gsap.killTweensOf(growth);
      gsap.killTweensOf(bloom);
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointerup', click);
      window.removeEventListener('pointermove', move);
      scene.remove(root);
      // Cleanup-only sets are deliberately non-reactive: no UI subscribes to them.
      /* eslint-disable svelte/prefer-svelte-reactivity */
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      /* eslint-enable svelte/prefer-svelte-reactivity */
      root.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          geometries.add(object.geometry);
          for (const material of Array.isArray(object.material)
            ? object.material
            : [object.material])
            materials.add(material);
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    };
  });
  $effect(() => {
    if (!ready) return;
    gsap.killTweensOf(growth);
    gsap.killTweensOf(bloom);
    if (stage === 'INTRO') {
      growth.value = 0;
      bloom.value = 0;
    }
    if (stage === 'GROWING')
      gsap.to(growth, {
        value: 1,
        duration: reducedMotion ? 0.1 : gardenConfig.growthDuration,
        ease: 'power2.inOut',
        onComplete: () => oncomplete('GROWN'),
      });
    if (stage === 'BLOOMING')
      gsap.to(bloom, {
        value: 1,
        duration: reducedMotion ? 0.1 : gardenConfig.bloomDuration,
        ease: 'power2.inOut',
        onComplete: () => oncomplete('BLOOMED'),
      });
  });
  const target = new THREE.Vector3();
  useTask((delta) => {
    if (!ready) return;
    if (!reducedMotion) time += Math.min(delta, 0.05);
    flowers.update(growth.value, bloom.value, time, !reducedMotion);
    seedMesh.visible = growth.value < 0.08;
    seedMesh.position.y = 0.5 + Math.sin(time * 1.6) * 0.06;
    seedMesh.rotation.z = Math.sin(time) * 0.2;
    halo.visible = growth.value < 0.5;
    halo.scale.setScalar(1 + Math.sin(time * 1.6) * 0.08);
    light.intensity = 3 + (1 - growth.value) * 4;
    (particles.material as THREE.ShaderMaterial).uniforms.time.value = time;
    const mobile = size.current.width < 720;
    const cam = camera.current as THREE.PerspectiveCamera;
    const shift = mobile ? 0 : -2.65;
    target.set(
      shift + (reducedMotion ? 0 : pointerX * 0.22),
      mobile ? 3.9 : 3.1,
      mobile ? 11.1 : 10.6,
    );
    cam.position.lerp(target, reducedMotion ? 1 : 1 - Math.exp(-delta * 2));
    cam.lookAt(
      shift,
      mobile ? 1.7 : 1.5 + (reducedMotion ? 0 : pointerY * 0.08),
      0,
    );
    cam.fov = mobile ? 43 : 39;
    cam.updateProjectionMatrix();
  });
</script>
