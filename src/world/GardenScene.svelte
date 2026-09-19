<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { useTask, useThrelte } from '@threlte/core';
  import * as THREE from 'three';
  import { gsap } from 'gsap';
  import { createFlowers, createMeadow } from './botany';
  import { seededRandom } from '../utils/random';
  import { gardenConfig } from '../config/garden.config';
  import { qualityForDevice } from '../systems/PerformanceManager';
  import type {
    GardenStage,
    SceneCompletion,
  } from '../machines/garden.machine';
  import { createBouquetSystem } from '../systems/BouquetSystem';
  import { createBotanicalGift } from '../objects/BotanicalGift';
  import { createHeartFormation } from '../particles/HeartFormation';
  import { createWindSystem } from '../systems/WindSystem';

  let {
    stage,
    seed,
    reducedMotion,
    oncomplete,
    onflower,
    onplant,
    onready,
    onerror,
    ribbonPull,
    oncard,
    onpull,
    onuntie,
    windCharge,
  }: {
    stage: GardenStage;
    seed: string;
    reducedMotion: boolean;
    oncomplete: (event: SceneCompletion) => void;
    onflower: (index: number) => void;
    onplant: () => void;
    onready: () => void;
    onerror: () => void;
    ribbonPull: number;
    oncard: () => void;
    onpull: (value: number) => void;
    onuntie: () => void;
    windCharge: number;
  } = $props();
  const { scene, camera, renderer, size } = useThrelte();
  const root = new THREE.Group();
  const quality = qualityForDevice();
  const initialSeed = untrack(() => seed);
  const flowers = createFlowers(initialSeed, gardenConfig.flowerCount);
  const bouquet = createBouquetSystem(flowers.flowers, initialSeed);
  const gift = createBotanicalGift();
  const meadow = createMeadow(initialSeed, quality.grass);
  const wind = createWindSystem(flowers.flowers, meadow);
  const heart = createHeartFormation(
    initialSeed,
    quality.particles <= 180 ? 1200 : 1800,
    quality.dpr,
  );
  const finale = { flight: 0, formation: 0, opacity: 0, fade: 0, lettering: 0 };
  const fadingMaterials: THREE.Material[] = [];
  for (const group of [flowers.root, gift.root])
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          if (!fadingMaterials.includes(material))
            fadingMaterials.push(material);
        }
      }
    });
  const growth = { value: 0 },
    bloom = { value: 0 };
  const gather = { value: 0 },
    unwrap = { value: 0 },
    cardOpen = { value: 0 };
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
  let ribbonPointer: number | null = null;
  let dragProgress = 0;
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
      meadow,
      seedMesh,
      halo,
      light,
      particles,
      gift.root,
      heart.points,
    );
    scene.add(root);
    const canvas = renderer.domElement;
    function aim(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera.current,
      );
    }
    function cancelDrag() {
      ribbonPointer = null;
      dragProgress = 0;
      onpull(0);
    }
    function down(event: PointerEvent) {
      pointerDown = { x: event.clientX, y: event.clientY };
      if (stage !== 'BOUQUET' || !event.isPrimary || event.button !== 0) return;
      aim(event);
      if (raycaster.intersectObjects(gift.ribbon.children, true).length) {
        ribbonPointer = event.pointerId;
        dragProgress = 0;
        canvas.setPointerCapture(event.pointerId);
      }
    }
    function move(event: PointerEvent) {
      pointerX = event.clientX / window.innerWidth - 0.5;
      pointerY = event.clientY / window.innerHeight - 0.5;
      if (event.pointerId === ribbonPointer) {
        dragProgress = THREE.MathUtils.clamp(
          (event.clientX - pointerDown.x) /
            Math.min(110, window.innerWidth * 0.22),
          0,
          1,
        );
        onpull(dragProgress);
      }
    }
    function click(event: PointerEvent) {
      if (event.pointerId === ribbonPointer) {
        const complete = dragProgress >= 0.8;
        ribbonPointer = null;
        if (canvas.hasPointerCapture(event.pointerId))
          canvas.releasePointerCapture(event.pointerId);
        if (complete) onuntie();
        else onpull(0);
        return;
      }
      if (
        !['GARDEN', 'INTRO', 'BOUQUET', 'CARD_READY', 'FREE_EXPLORE'].includes(
          stage,
        ) ||
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
      if (
        stage === 'CARD_READY' &&
        raycaster.intersectObjects(gift.card.children, true).length
      ) {
        oncard();
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
    canvas.addEventListener('pointercancel', cancelDrag);
    canvas.addEventListener('lostpointercapture', cancelDrag);
    window.addEventListener('blur', cancelDrag);
    window.addEventListener('pointermove', move);
    ready = true;
    onready();
    return () => {
      gsap.killTweensOf(growth);
      gsap.killTweensOf(bloom);
      gsap.killTweensOf(gather);
      gsap.killTweensOf(unwrap);
      gsap.killTweensOf(cardOpen);
      gsap.killTweensOf(finale);
      gift.texture.dispose();
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointerup', click);
      canvas.removeEventListener('pointercancel', cancelDrag);
      canvas.removeEventListener('lostpointercapture', cancelDrag);
      window.removeEventListener('blur', cancelDrag);
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
    renderer.domElement.style.touchAction =
      stage === 'BOUQUET' ? 'none' : 'pan-y';
    gsap.killTweensOf(growth);
    gsap.killTweensOf(bloom);
    gsap.killTweensOf(gather);
    gsap.killTweensOf(cardOpen);
    if (stage === 'INTRO') {
      growth.value = 0;
      bloom.value = 0;
      gather.value = 0;
      unwrap.value = 0;
      cardOpen.value = 0;
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
    if (stage === 'GATHERING')
      gsap.to(gather, {
        value: 1,
        duration: reducedMotion ? 0.1 : gardenConfig.bouquetDuration,
        ease: 'power2.inOut',
        onComplete: () => oncomplete('BOUQUET_READY'),
      });
    gsap.to(cardOpen, {
      value: stage === 'FINALE' ? 1 : 0,
      duration: reducedMotion ? 0 : 0.65,
      ease: 'power2.inOut',
    });
  });
  $effect(() => {
    if (!ready) return;
    gsap.killTweensOf(unwrap);
    if (stage === 'INTRO') unwrap.value = 0;
    if (stage === 'BOUQUET')
      gsap.to(unwrap, {
        value: ribbonPull * 0.75,
        duration: reducedMotion ? 0 : 0.16,
        ease: 'power2.out',
      });
    if (stage === 'UNWRAPPING')
      gsap.to(unwrap, {
        value: 1,
        duration: reducedMotion ? 0.1 : gardenConfig.unwrapDuration,
        ease: 'power2.inOut',
        onComplete: () => oncomplete('CARD_REVEALED'),
      });
  });
  const target = new THREE.Vector3();
  $effect(() => {
    if (!ready) return;
    gsap.killTweensOf(finale);
    if (stage === 'INTRO' || stage === 'FREE_EXPLORE' || stage === 'WIND') {
      finale.flight = 0;
      finale.formation = 0;
      finale.opacity = 0;
      finale.fade = 0;
      finale.lettering = 0;
      wind.reset();
    }
    if (stage === 'FREE_EXPLORE') {
      gather.value = 0;
      unwrap.value = 0;
      cardOpen.value = 0;
    }
    if (stage === 'BURST') {
      if (reducedMotion) {
        // Avoid a fast burst: show the static shape immediately, then advance the story.
        finale.flight = 1;
        finale.formation = 1;
        finale.opacity = 1;
        finale.fade = 1;
        gsap.to(finale, {
          duration: 0.1,
          onComplete: () => oncomplete('SCATTERED'),
        });
      } else
        gsap.to(finale, {
          flight: 1,
          opacity: 1,
          fade: 1,
          duration: gardenConfig.scatterDuration,
          ease: 'power2.out',
          onComplete: () => oncomplete('SCATTERED'),
        });
    }
    if (stage === 'HEART')
      gsap.to(finale, {
        formation: 1,
        duration: reducedMotion ? 0.1 : gardenConfig.heartDuration,
        ease: 'power2.inOut',
        onComplete: () => oncomplete('HEART_READY'),
      });
    if (stage === 'TEXT_FORMING')
      gsap.to(finale, {
        lettering: 1,
        duration: reducedMotion ? 0 : gardenConfig.messageDuration,
        ease: 'power2.inOut',
        onComplete: () => oncomplete('MESSAGE_READY'),
      });
  });
  useTask((delta) => {
    if (!ready) return;
    if (!reducedMotion) time += Math.min(delta, 0.05);
    flowers.update(growth.value, bloom.value, time, !reducedMotion);
    bouquet.update(gather.value, time, !reducedMotion);
    gift.update(
      gather.value,
      unwrap.value,
      cardOpen.value,
      time,
      !reducedMotion,
    );
    const strength = wind.update(
      stage === 'WIND' ? windCharge : stage === 'BURST' ? 1 - finale.flight : 0,
      time,
      delta,
      reducedMotion,
    );
    gift.ribbon.rotation.z += strength * Math.sin(time * 2) * 0.12;
    for (const material of fadingMaterials) {
      const transparent = finale.fade > 0;
      if (material.transparent !== transparent) {
        material.transparent = transparent;
        material.needsUpdate = true;
      }
      material.opacity = 1 - finale.fade;
      material.depthWrite = !transparent;
    }
    flowers.root.visible = finale.fade < 0.999;
    gift.root.visible = gift.root.visible && finale.fade < 0.999;
    heart.points.visible = finale.opacity > 0;
    heart.uniforms.flight.value = finale.flight;
    heart.uniforms.formation.value = finale.formation;
    heart.uniforms.opacity.value = finale.opacity;
    heart.uniforms.time.value = time;
    heart.uniforms.motion.value = reducedMotion ? 0 : 1;
    heart.uniforms.lettering.value = finale.lettering;
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
