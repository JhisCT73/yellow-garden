<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { useTask, useThrelte } from '@threlte/core';
  import * as THREE from 'three';
  import { gsap } from 'gsap';
  import { createFlowers, createMeadow } from './botany';
  import { createBouquetFoliage } from './BouquetFoliage';
  import { createOpeningLight } from './OpeningLight';
  import { createSeedGeometry } from './SeedGeometry';
  import { createBenchEnvironment } from './BenchEnvironment';
  import { createGardenBench } from './GardenBench';
  import { createSoilGeometry } from './SoilGeometry';
  import { seededRandom } from '../utils/random';
  import { gardenConfig } from '../config/garden.config';
  import {
    initialQuality,
    qualityProfile,
    createPerformanceMonitor,
    type QualityMode,
    type QualityLevel,
  } from '../systems/PerformanceManager';
  import type {
    GardenStage,
    SceneCompletion,
  } from '../machines/garden.machine';
  import { createBouquetSystem } from '../systems/BouquetSystem';
  import { createBotanicalGift } from '../objects/BotanicalGift';
  import { createHeartFormation } from '../particles/HeartFormation';
  import { createWindTrails } from '../particles/WindTrails';
  import { createWindSystem } from '../systems/WindSystem';
  import { createSecretBloom } from '../systems/SecretBloomSystem';
  import { createGardenCare, type GardenCare } from '../systems/GardenCare';
  import { createSeedbed } from './Seedbed';
  import {
    openingFrame,
    gardenFrame,
    finaleFrame,
  } from '../cinematics/OpeningCamera';
  import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
  import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
  import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
  import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

  let {
    stage,
    navigation,
    paused,
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
    care,
    qualityMode,
    onquality,
  }: {
    stage: GardenStage;
    navigation: number;
    paused: boolean;
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
    care: GardenCare;
    qualityMode: QualityMode;
    onquality: (level: QualityLevel) => void;
  } = $props();
  const { scene, camera, renderer, size, autoRender, renderStage } =
    useThrelte();
  let composer: EffectComposer;
  let bokeh: BokehPass;
  let renderPass: RenderPass;
  let output: OutputPass;
  let effectiveLevel: QualityLevel = 'high';
  let renderWidth = 0,
    renderHeight = 0;
  let soilSurface: THREE.MeshStandardMaterial;
  const root = new THREE.Group();
  const seedbed = createSeedbed(untrack(() => seed));
  const soil = new THREE.TextureLoader().load(
    `${import.meta.env.BASE_URL}textures/soil.jpg`,
  );
  soil.colorSpace = THREE.SRGBColorSpace;
  soil.wrapS = soil.wrapT = THREE.RepeatWrapping;
  soil.repeat.set(2, 2);
  const gardenBackdrop = new THREE.TextureLoader().load(
    `${import.meta.env.BASE_URL}textures/night-garden.jpg`,
  );
  gardenBackdrop.colorSpace = THREE.SRGBColorSpace;
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 20),
    new THREE.MeshBasicMaterial({
      map: gardenBackdrop,
      color: '#b0a597',
      fog: false,
      depthWrite: false,
    }),
  );
  backdrop.position.set(0, -0.5, -7);
  const landscapeTexture = new THREE.TextureLoader().load(
    `${import.meta.env.BASE_URL}textures/garden-path.jpg`,
  );
  landscapeTexture.colorSpace = THREE.SRGBColorSpace;
  const landscape = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 16),
    new THREE.MeshBasicMaterial({
      map: landscapeTexture,
      color: '#9ba4b7',
      fog: false,
      depthWrite: false,
      transparent: true,
      opacity: 0,
    }),
  );
  landscape.position.set(0, -0.6, -10);
  const gardenReveal = { value: 0 };
  const initialLevel = initialQuality(navigator.hardwareConcurrency || 4);
  const quality = qualityProfile('high', window.devicePixelRatio);
  const monitor = createPerformanceMonitor(initialLevel);
  const initialSeed = untrack(() => seed);
  const flowers = createFlowers(initialSeed, gardenConfig.flowerCount);
  const openingLight = createOpeningLight();
  const bench = createGardenBench();
  const benchEnvironment = createBenchEnvironment(
    untrack(() => seed),
    soil,
  );
  const bud = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 16, 12),
    new THREE.MeshStandardMaterial({ color: '#709144', roughness: 0.65 }),
  );
  bud.scale.set(0.55, 1, 0.55);
  flowers.flowers[0].head.add(bud);
  const sprouts = createFlowers(initialSeed + '-sprouts', 10);
  sprouts.update(1, 0, 0, false);
  sprouts.flowers.forEach((flower, index) => {
    flower.head.visible = false;
    flower.group.children[0].scale.y = 0.7;
    flower.group.position.set(
      (index % 2 ? -1 : 1) * (0.85 + index * 0.17),
      0,
      -0.3 - (index % 5) * 0.65,
    );
    flower.group.scale.setScalar(0.16 + (index % 4) * 0.07);
    flower.group.rotation.y = index * 1.7;
  });
  const bouquet = createBouquetSystem(flowers.flowers, initialSeed);
  const foliage = createBouquetFoliage(initialSeed);
  flowers.root.add(foliage.root);
  const gift = createBotanicalGift();
  const meadow = createMeadow(initialSeed, quality.grass);
  const wind = createWindSystem(flowers.flowers, meadow);
  const secret = createSecretBloom(flowers.flowers, initialSeed, quality.dpr);
  const careEffect = createGardenCare(initialSeed, quality.dpr);
  const surprise = { value: 0 };
  const heart = createHeartFormation(initialSeed, 1800, quality.dpr);
  const air = createWindTrails(initialSeed, quality.dpr);
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
    createSeedGeometry(),
    new THREE.MeshStandardMaterial({
      color: '#98764b',
      vertexColors: true,
      emissive: '#ffb52e',
      emissiveIntensity: 0.02,
      roughness: 0.58,
      metalness: 0.25,
    }),
  );
  seedMesh.scale.set(1.25, 0.65, 0.75);
  seedMesh.position.set(0, 0.09, 0);
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
    // Narrative phases follow elapsed time even after a slow frame or tab pause.
    gsap.ticker.lagSmoothing(0);
    autoRender.set(false);
    composer = new EffectComposer(renderer);
    composer.setPixelRatio(1);
    renderPass = new RenderPass(scene, camera.current);
    bokeh = new BokehPass(scene, camera.current, {
      focus: 3,
      aperture: 0.012,
      maxblur: 0.018,
    });
    output = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(bokeh);
    composer.addPass(output);
    scene.background = new THREE.Color('#080c18');
    scene.fog = new THREE.FogExp2('#080c18', 0.09);
    renderer.setPixelRatio(quality.dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    const ambient = new THREE.HemisphereLight('#819ac2', '#21170e', 0.65);
    const key = new THREE.DirectionalLight('#ffe7a1', 3.8);
    key.position.set(3, 6, 5);
    const rim = new THREE.DirectionalLight('#91aedb', 2.4);
    rim.position.set(-4, 4, -4);
    const ground = new THREE.Mesh(
      createSoilGeometry(),
      new THREE.MeshStandardMaterial({
        color: '#827064',
        map: soil,
        bumpMap: soil,
        bumpScale: 0.09,
        roughness: 0.92,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    soilSurface = ground.material;
    ground.material.transparent = true;
    ground.material.onBeforeCompile = (shader) => {
      shader.vertexShader =
        'varying float soilRadius;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nsoilRadius=length(position.xy);',
        );
      shader.fragmentShader =
        'varying float soilRadius;\n' +
        shader.fragmentShader.replace(
          '#include <opaque_fragment>',
          'diffuseColor.a *= 1. - smoothstep(2.8,5.,soilRadius);\n#include <opaque_fragment>',
        );
    };
    ground.position.y = -0.006;
    root.add(
      ambient,
      key,
      rim,
      ground,
      flowers.root,
      openingLight.root,
      bench,
      benchEnvironment.root,
      meadow,
      seedMesh,
      halo,
      light,
      particles,
      gift.root,
      heart.points,
      air.points,
      secret.points,
      careEffect.rain,
      seedbed.root,
      sprouts.root,
      backdrop,
      landscape,
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
      gsap.ticker.lagSmoothing(500, 33);
      gsap.killTweensOf(growth);
      gsap.killTweensOf(gardenReveal);
      gsap.killTweensOf(bloom);
      gsap.killTweensOf(gather);
      gsap.killTweensOf(unwrap);
      gsap.killTweensOf(cardOpen);
      gsap.killTweensOf(finale);
      gsap.killTweensOf(surprise);
      gift.dispose();
      soil.dispose();
      gardenBackdrop.dispose();
      landscapeTexture.dispose();
      composer.dispose();
      renderPass.dispose();
      bokeh.dispose();
      output.dispose();
      autoRender.set(true);
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
  // A chapter visit restores all dependent visual state before its animation starts.
  $effect(() => {
    if (!ready) return;
    void navigation;
    const current = untrack(() => stage);
    for (const target of [
      growth,
      bloom,
      gardenReveal,
      gather,
      unwrap,
      cardOpen,
      finale,
      surprise,
    ])
      gsap.killTweensOf(target);
    growth.value = current === 'INTRO' || current === 'GROWING' ? 0 : 1;
    bloom.value = ['INTRO', 'GROWING', 'BLOOMING'].includes(current) ? 0 : 1;
    gardenReveal.value = ['INTRO', 'GROWING', 'BLOOMING'].includes(current)
      ? 0
      : 1;
    gather.value = ['BOUQUET', 'CARD_READY', 'UNWRAPPING'].includes(current)
      ? 1
      : 0;
    unwrap.value = current === 'CARD_READY' ? 1 : 0;
    cardOpen.value = 0;
    const message = current === 'TEXT_FORMING';
    Object.assign(finale, {
      flight: message ? 1 : 0,
      formation: message ? 1 : 0,
      opacity: message ? 1 : 0,
      fade: message ? 1 : 0,
      lettering: 0,
    });
    surprise.value = 0;
    wind.reset();
  });
  $effect(() => {
    if (!ready) return;
    void navigation;
    renderer.domElement.style.touchAction =
      stage === 'BOUQUET' ? 'none' : 'pan-y';
    gsap.killTweensOf(growth);
    gsap.killTweensOf(bloom);
    gsap.killTweensOf(gather);
    gsap.killTweensOf(cardOpen);
    if (stage === 'INTRO') {
      gsap.killTweensOf(gardenReveal);
      gardenReveal.value = 0;
      growth.value = 0;
      bloom.value = 0;
      gather.value = 0;
      unwrap.value = 0;
      cardOpen.value = 0;
    }
    if (stage === 'GARDEN')
      gsap.to(gardenReveal, {
        value: 1,
        duration: reducedMotion ? 0 : 2.4,
        ease: 'power2.inOut',
      });
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
    void navigation;
    gsap.killTweensOf(unwrap);
    if (stage === 'INTRO') unwrap.value = 0;
    if (stage === 'WIND')
      gsap.to(unwrap, {
        value: 0,
        duration: reducedMotion ? 0 : 0.8,
        ease: 'power2.inOut',
      });
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
  const cameraFocus = new THREE.Vector3(0, 0.18, 0);
  const opticalFocus = new THREE.Vector3();
  const focusTarget = new THREE.Vector3();
  let cameraInitialized = false;
  let previousCameraTime = performance.now();
  function applyQuality(level: QualityLevel) {
    effectiveLevel = level;
    const profile = qualityProfile(level, window.devicePixelRatio);
    renderer.setPixelRatio(profile.dpr);
    meadow.count = profile.grass;
    particleGeometry.setDrawRange(0, profile.particles);
    careEffect.rain.geometry.setDrawRange(0, level === 'low' ? 70 : 150);
    air.points.geometry.setDrawRange(0, level === 'low' ? 100 : 280);
    // Update point sizes together with the drawing buffer so they retain their CSS size.
    root.traverse((object) => {
      if (
        object instanceof THREE.Points &&
        object.material instanceof THREE.ShaderMaterial &&
        object.material.uniforms.dpr
      )
        object.material.uniforms.dpr.value = profile.dpr;
    });
    onquality(level);
  }
  $effect(() => {
    if (!ready) return;
    const level = qualityMode === 'auto' ? initialLevel : qualityMode;
    monitor.reset(level);
    applyQuality(level);
  });
  $effect(() => {
    if (!ready) return;
    void navigation;
    gsap.killTweensOf(surprise);
    if (stage === 'SECRET_BLOOM') {
      surprise.value = 0;
      gsap.to(surprise, {
        value: 1,
        duration: reducedMotion ? 0 : gardenConfig.surpriseDuration,
        ease: 'power2.inOut',
        onComplete: () => oncomplete('SURPRISE_READY'),
      });
    } else if (stage !== 'SECRET_READY') surprise.value = 0;
  });
  $effect(() => {
    if (!ready) return;
    void navigation;
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
  $effect(() => {
    if (!ready) return;
    void stage;
    void navigation;
    void ribbonPull;
    void reducedMotion;
    for (const target of [
      growth,
      bloom,
      gardenReveal,
      gather,
      unwrap,
      cardOpen,
      finale,
      surprise,
    ]) {
      for (const tween of gsap.getTweensOf(target)) tween.paused(paused);
    }
  });
  useTask((delta) => {
    if (!ready) return;
    if (paused) {
      previousCameraTime = performance.now();
      return;
    }
    if (qualityMode === 'auto') {
      const level = monitor.sample(delta, !document.hidden);
      if (level) applyQuality(level);
    }
    if (!reducedMotion) time += Math.min(delta, 0.05);
    flowers.update(growth.value, bloom.value, time, !reducedMotion);
    flowers.flowers[0].head.children.forEach((part) => {
      part.visible = part === bud ? stage === 'GROWING' : stage !== 'GROWING';
    });
    bouquet.update(gather.value, time, !reducedMotion, gardenReveal.value);
    foliage.update(gather.value, time, !reducedMotion);
    if (stage === 'BLOOMING') flowers.flowers[0].head.rotateX(-0.3);
    if (stage === 'GROWING' || stage === 'BLOOMING')
      flowers.flowers.forEach((flower, index) => {
        if (index > 0) flower.group.visible = false;
      });
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
    air.points.visible = stage === 'WIND' || stage === 'BURST';
    air.uniforms.time.value = time;
    air.uniforms.strength.value =
      stage === 'WIND' ? 0.2 + strength * 0.8 : (1 - finale.flight) * 0.8;
    air.uniforms.motion.value = reducedMotion ? 0 : 1;
    secret.update(
      stage === 'SECRET_BLOOM' || stage === 'SECRET_READY',
      surprise.value,
      reducedMotion,
    );
    for (const material of fadingMaterials) {
      const transparent = finale.fade > 0;
      if (material.transparent !== transparent) {
        material.transparent = transparent;
        material.needsUpdate = true;
      }
      material.opacity = 1 - finale.fade;
      material.depthWrite = !transparent;
    }
    bench.visible = stage === 'BENCH';
    benchEnvironment.update(stage === 'BENCH', time, size.current.width < 720);
    meadow.visible = stage !== 'BENCH';
    flowers.root.visible = finale.fade < 0.999 && stage !== 'BENCH';
    gift.root.visible = gift.root.visible && finale.fade < 0.999;
    heart.points.visible = finale.opacity > 0;
    heart.uniforms.flight.value = finale.flight;
    heart.uniforms.formation.value = finale.formation;
    heart.uniforms.opacity.value = finale.opacity;
    heart.uniforms.time.value = time;
    heart.uniforms.motion.value = reducedMotion ? 0 : 1;
    heart.uniforms.lettering.value = finale.lettering;
    seedMesh.visible = growth.value < 0.08;
    seedMesh.position.y = 0.065 - growth.value * 0.15;
    seedMesh.rotation.z = -0.16;
    halo.visible = false;
    seedbed.glow.material.uniforms.strength.value = 1 - growth.value * 0.8;
    seedbed.dust.material.uniforms.time.value = time;
    seedbed.dust.visible = ['INTRO', 'GROWING', 'BLOOMING'].includes(stage);
    openingLight.update(
      seedbed.dust.visible,
      growth.value,
      time,
      !reducedMotion,
    );
    backdrop.visible = seedbed.dust.visible;
    landscape.visible =
      stage !== 'BENCH' && !seedbed.dust.visible && gardenReveal.value > 0;
    landscape.material.opacity =
      gardenReveal.value * (1 - finale.opacity * 0.35);
    soilSurface.opacity = 1 - gardenReveal.value * 0.9;
    seedbed.root.visible = gardenReveal.value < 0.9;
    sprouts.root.visible = gardenReveal.value < 0.9;
    halo.scale.setScalar(1 + Math.sin(time * 1.6) * 0.08);
    light.intensity = 3 + (1 - growth.value) * 4;
    careEffect.update(care, time, reducedMotion, finale.opacity === 0, light);
    (particles.material as THREE.ShaderMaterial).uniforms.time.value = time;
    const mobile = size.current.width < 720;
    landscape.scale.setScalar(
      1 + (mobile ? 0.25 : 0) + gather.value * (mobile ? 0.15 : 0.12),
    );
    const cam = camera.current as THREE.PerspectiveCamera;
    const shift = mobile ? 0 : -2.65;
    const opening =
      openingFrame(stage, growth.value, mobile) ??
      gardenFrame(stage, gather.value, mobile) ??
      finaleFrame(stage, mobile);
    if (opening) {
      target.fromArray(opening.position);
      focusTarget.fromArray(opening.focus);
      cam.fov = opening.fov;
    } else {
      target.set(
        shift + (reducedMotion ? 0 : pointerX * 0.22),
        mobile ? 3.9 : 3.1,
        mobile ? 11.1 : 10.6,
      );
      focusTarget.set(
        shift,
        mobile ? 1.7 : 1.5 + (reducedMotion ? 0 : pointerY * 0.08),
        0,
      );
      cam.fov = mobile ? 43 : 39;
    }
    const cameraTime = performance.now();
    const cameraDelta = Math.max(0, (cameraTime - previousCameraTime) / 1000);
    previousCameraTime = cameraTime;
    const cameraBlend =
      reducedMotion || !cameraInitialized
        ? 1
        : 1 - Math.exp(-cameraDelta * 1.8);
    cam.position.lerp(target, cameraBlend);
    cameraFocus.lerp(focusTarget, cameraBlend);
    cam.lookAt(cameraFocus);
    cameraInitialized = true;
    cam.updateProjectionMatrix();
  });
  useTask(
    () => {
      if (!ready) return;
      if (
        effectiveLevel !== 'low' &&
        [
          'INTRO',
          'GROWING',
          'BLOOMING',
          'BOUQUET',
          'UNWRAPPING',
          'CARD_READY',
        ].includes(stage)
      ) {
        if (
          renderWidth !== size.current.width ||
          renderHeight !== size.current.height
        ) {
          renderWidth = size.current.width;
          renderHeight = size.current.height;
          composer.setSize(renderWidth, renderHeight);
        }
        camera.current.updateMatrixWorld();
        (stage === 'INTRO'
          ? seedMesh
          : stage === 'CARD_READY'
            ? gift.card
            : flowers.flowers[0].head
        ).getWorldPosition(opticalFocus);
        opticalFocus.applyMatrix4(camera.current.matrixWorldInverse);
        (bokeh.uniforms as Record<string, THREE.IUniform>).focus.value =
          -opticalFocus.z;
        (bokeh.uniforms as Record<string, THREE.IUniform>).aperture.value = [
          'BOUQUET',
          'UNWRAPPING',
          'CARD_READY',
        ].includes(stage)
          ? 0.003
          : 0.012;
        composer.render();
      } else renderer.render(scene, camera.current);
    },
    { stage: renderStage },
  );
</script>
