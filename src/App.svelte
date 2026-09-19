<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Canvas } from '@threlte/core';
  import { createActor } from 'xstate';
  import GardenScene from './world/GardenScene.svelte';
  import {
    gardenMachine,
    type GardenStage,
    type SceneCompletion,
  } from './machines/garden.machine';
  import { gardenConfig } from './config/garden.config';
  import { card, flowerMessages } from './content/messages';
  import { AudioEngine } from './systems/AudioEngine';
  import RibbonInteraction from './interactions/RibbonInteraction.svelte';
  import WindInteraction from './interactions/WindInteraction.svelte';
  import GardenSecret from './interactions/GardenSecret.svelte';
  import { gardenLayout } from './utils/random';
  import CareChoice from './interactions/CareChoice.svelte';
  import type { GardenCare } from './systems/GardenCare';
  import GraphicsSettings from './interactions/GraphicsSettings.svelte';
  import {
    initialQuality,
    type QualityMode,
    type QualityLevel,
  } from './systems/PerformanceManager';
  let qualityMode = $state<QualityMode>('auto');
  let qualityLevel = $state<QualityLevel>(
    initialQuality(navigator.hardwareConcurrency || 4),
  );
  let care = $state<GardenCare>('light');

  const actor = createActor(gardenMachine);
  let stage = $state<GardenStage>('INTRO');
  let mounted = $state(false),
    ready = $state(false),
    failed = $state(false);
  let reducedMotion = $state(false),
    muted = $state(true);
  let message = $state(''),
    discovered = $state<number[]>([]);
  let messageTimeout: ReturnType<typeof setTimeout>;
  let dialog: HTMLDialogElement;
  let cardButton = $state<HTMLButtonElement>();
  let ribbonPull = $state(0),
    hasBouquet = $state(false);
  let ribbonShortcut = $state<HTMLButtonElement>();
  let windCharge = $state(0);
  let exploreButton = $state<HTMLButtonElement>();
  const isFinale = $derived(
    [
      'WIND',
      'BURST',
      'HEART',
      'CELEBRATION',
      'TEXT_FORMING',
      'TEXT_READY',
      'FREE_EXPLORE',
      'SECRET_BLOOM',
      'SECRET_READY',
    ].includes(stage),
  );
  const audio = new AudioEngine();
  $effect(() => {
    audio.setCare(care);
  });
  $effect(() => {
    audio.setWind(stage === 'WIND' ? windCharge : stage === 'BURST' ? 0.7 : 0);
  });
  const seed =
    new URLSearchParams(window.location.search).get('seed')?.slice(0, 100) ||
    gardenConfig.defaultSeed;
  const flowerCount = gardenLayout(seed, gardenConfig.flowerCount).length;
  let nextFlower = 0;
  const isGrowing = $derived(stage === 'GROWING' || stage === 'BLOOMING');
  const isGarden = $derived(!['INTRO', 'GROWING', 'BLOOMING'].includes(stage));
  const progress = $derived(
    stage === 'INTRO'
      ? 0
      : stage === 'GROWING'
        ? 1
        : stage === 'BLOOMING'
          ? 2
          : 3,
  );
  onMount(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = preference.matches;
    const change = () => {
      reducedMotion = preference.matches;
    };
    preference.addEventListener('change', change);
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (!gl) failed = true;
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      failed = true;
    }
    mounted = true;
    const subscription = actor.subscribe((snapshot) => {
      stage = snapshot.value as GardenStage;
    });
    actor.start();
    const visibility = () => {
      if (document.hidden) {
        audio.mute();
        muted = true;
      }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      subscription.unsubscribe();
      actor.stop();
      audio.dispose();
      clearTimeout(messageTimeout);
      preference.removeEventListener('change', change);
      document.removeEventListener('visibilitychange', visibility);
    };
  });
  function plant() {
    actor.send({ type: 'PLANT' });
    audio.chime();
  }
  function discover(index: number) {
    if (!discovered.includes(index)) discovered = [...discovered, index];
    message = flowerMessages[index % flowerMessages.length];
    audio.chime(index);
    clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
      message = '';
    }, 6500);
  }
  function discoverNext() {
    const unseen = Array.from(
      { length: flowerCount },
      (_, index) => index,
    ).find((index) => !discovered.includes(index));
    const index = unseen ?? nextFlower;
    nextFlower = (index + 1) % flowerCount;
    discover(index);
  }
  function formMessage() {
    actor.send({ type: 'FORM_MESSAGE' });
    audio.chime(2);
  }
  async function toggleAudio() {
    if (!muted) {
      audio.mute();
      muted = true;
      return;
    }
    try {
      await audio.enable();
      muted = false;
    } catch {
      message = 'El sonido no está disponible. El jardín sigue aquí para ti.';
    }
  }
  async function openCard() {
    if (stage !== 'GARDEN' && stage !== 'CARD_READY') return;
    actor.send({ type: 'OPEN_CARD' });
    await tick();
    dialog.showModal();
  }
  function closeCard() {
    dialog.close();
    actor.send({ type: 'CLOSE_CARD' });
    cardButton?.focus();
  }
  function gatherFlowers() {
    hasBouquet = true;
    message = '';
    clearTimeout(messageTimeout);
    actor.send({ type: 'GATHER' });
    audio.chime(2);
  }
  function untie() {
    actor.send({ type: 'UNTIE' });
    audio.chime(3);
  }
  function startWind() {
    message = '';
    windCharge = 0;
    actor.send({ type: 'START_WIND' });
  }
  function releaseWind() {
    windCharge = 0;
    actor.send({ type: 'RELEASE_WIND' });
    audio.chime(4);
  }
  function explore() {
    hasBouquet = false;
    windCharge = 0;
    actor.send({ type: 'EXPLORE' });
  }
  function lastSurprise() {
    message = '';
    clearTimeout(messageTimeout);
    actor.send({ type: 'LAST_SURPRISE' });
    audio.chime(5);
  }
  async function sceneComplete(type: SceneCompletion) {
    actor.send({ type });
    await tick();
    if (type === 'BOUQUET_READY')
      ribbonShortcut?.focus({ preventScroll: true });
    if (type === 'CARD_REVEALED') cardButton?.focus({ preventScroll: true });
    if (
      type === 'HEART_READY' ||
      type === 'MESSAGE_READY' ||
      type === 'SURPRISE_READY'
    )
      exploreButton?.focus({ preventScroll: true });
  }
  function restart() {
    message = '';
    discovered = [];
    nextFlower = 0;
    hasBouquet = false;
    ribbonPull = 0;
    windCharge = 0;
    clearTimeout(messageTimeout);
    actor.send({ type: 'RESTART' });
  }
</script>

<svelte:head
  ><title>{gardenConfig.title} · Un regalo que florece</title></svelte:head
>

<main
  class:grown={isGarden}
  class:bouquet-mode={hasBouquet}
  class:finale-mode={isFinale}
  class:cinematic-opening={!failed &&
    (stage === 'INTRO' || isGrowing || stage === 'GARDEN' || hasBouquet)}
  data-stage={stage}
  data-care={care}
  data-quality={qualityLevel}
>
  <div class="world" aria-hidden="true">
    {#if mounted && !failed}
      <svelte:boundary
        onerror={() => {
          failed = true;
        }}
      >
        <Canvas>
          <GardenScene
            {stage}
            {seed}
            {reducedMotion}
            {care}
            {qualityMode}
            onquality={(level) => {
              qualityLevel = level;
            }}
            oncomplete={sceneComplete}
            {ribbonPull}
            {windCharge}
            oncard={openCard}
            onpull={(value) => {
              ribbonPull = value;
            }}
            onuntie={untie}
            onflower={discover}
            onplant={plant}
            onready={() => {
              ready = true;
            }}
            onerror={() => {
              failed = true;
            }}
          />
        </Canvas>
      </svelte:boundary>
    {/if}
  </div>
  <div class="atmosphere"></div>
  <header>
    <div class="brand-lockup">
      {#if gardenConfig.secrets}
        <GardenSecret
          flowers={flowerCount}
          {seed}
          onfound={() => audio.chime(4)}
        />
      {:else}<span class="brand-symbol">✳</span>{/if}
      <a class="wordmark" href="./" aria-label="Yellow Garden, inicio"
        >yellow garden<span class="brand-dot">.</span></a
      >
    </div>
    <span class="edition">UNA PEQUEÑA CELEBRACIÓN DE LA PRIMAVERA</span>
    <div class="header-controls">
      <GraphicsSettings bind:mode={qualityMode} level={qualityLevel} />
      {#if gardenConfig.audio}
        <button
          class="sound"
          onclick={toggleAudio}
          aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
          aria-pressed={!muted}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            aria-hidden="true"
            ><path d="M11 5 6 9H3v6h3l5 4V5Z" />{#if muted}<path
                d="m16 9 6 6m0-6-6 6"
              />{:else}<path
                d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"
              />{/if}</svg
          >
          <span>Sonido {muted ? 'off' : 'on'}</span>
        </button>
      {/if}
    </div>
  </header>

  <section class="story" aria-label="Tu jardín">
    <div class="eyebrow">
      <span></span>
      {isGarden ? 'UN REGALO PARA TI' : 'CADA COMIENZO GUARDA ALGO BONITO'}
    </div>
    {#if failed}
      <h1>Lo bonito también<br />vive en las <em>palabras.</em></h1>
      <p>
        Este dispositivo no pudo abrir el jardín 3D. Pero el regalo también es
        para ti.
      </p>
      <div class="fallback-message">
        <p>{card.paragraphs[1]}</p>
        <p>{card.closing}</p>
      </div>
      <button class="primary" onclick={() => window.location.reload()}
        >Volver a intentar <span>↻</span></button
      >
    {:else if stage === 'INTRO'}
      <h1>Un pequeño <em>comienzo.</em></h1>
      <p>Tengo algo para ti. Todo empieza con esta semilla.</p>
      <button class="primary" onclick={plant} disabled={!ready}>
        {ready ? 'Plantar mi semilla' : 'Preparando tu jardín…'}
        <span>↗</span></button
      >
      <CareChoice bind:value={care} />
    {:else if isGrowing}
      <h1>
        {stage === 'GROWING' ? 'Algo bonito está' : 'La primera flor es'}
        <em>{stage === 'GROWING' ? 'creciendo.' : 'para ti.'}</em>
      </h1>
      <p aria-live="polite">
        {stage === 'GROWING'
          ? 'A veces solo hace falta un nuevo comienzo.'
          : 'Mira. Había un jardín esperando por ti.'}
      </p>
      <div class="growing-label">
        <span class="breathing-dot"></span>
        {stage === 'GROWING' ? 'ECHANDO RAÍCES' : 'ABRIENDO LOS PÉTALOS'}
      </div>
    {:else if isFinale}
      {#if stage === 'WIND'}
        <h1>Un soplo,<br />un pequeño<br /><em>deseo.</em></h1>
        <p>Algo bonito todavía está por venir.</p>
        <WindInteraction
          oncharge={(value) => {
            windCharge = value;
          }}
          onrelease={releaseWind}
        />
      {:else if stage === 'BURST' || stage === 'HEART'}
        <h1>Hay cosas<br />que se dicen<br /><em>con luz.</em></h1>
        <p aria-live="polite">
          {stage === 'BURST'
            ? 'Un deseo, un soplo, un nuevo comienzo.'
            : 'Todo lo bonito encuentra su forma.'}
        </p>
        <div class="growing-label">
          <span class="breathing-dot"></span>UN ÚLTIMO REGALO
        </div>
      {:else if stage === 'CELEBRATION'}
        <div class="finale-date">{gardenConfig.date} · FELIZ PRIMAVERA</div>
        <h1>Que nunca te<br />falten motivos<br /><em>para florecer.</em></h1>
        <p>Estas flores son para ti.<br />Y este pequeño universo, también.</p>
        <div class="finale-actions">
          <button class="primary" bind:this={exploreButton} onclick={explore}
            >Quedarme en el jardín <span>✧</span></button
          >
          <button class="text-button" onclick={formMessage}
            >Un mensaje entre las luces ↗</button
          >
        </div>
      {:else if stage === 'TEXT_FORMING' || stage === 'TEXT_READY'}
        <h1>Hay palabras<br />que también<br /><em>florecen.</em></h1>
        <p aria-live="polite">
          {stage === 'TEXT_FORMING'
            ? 'Unas luces, unas letras y un deseo para ti.'
            : `Feliz primavera. ${gardenConfig.date}`}
        </p>
        {#if stage === 'TEXT_FORMING'}
          <div class="growing-label">
            <span class="breathing-dot"></span>ESCRIBIENDO CON LUZ
          </div>
        {:else}
          <button class="primary" bind:this={exploreButton} onclick={explore}
            >Quedarme en el jardín <span>✧</span></button
          >
        {/if}
      {:else if stage === 'SECRET_BLOOM' || stage === 'SECRET_READY'}
        <h1>Una última<br />forma de decir<br /><em>para ti.</em></h1>
        <p aria-live="polite">
          {stage === 'SECRET_BLOOM'
            ? '¿Ya terminamos? Todavía quedaba una flor.'
            : 'Hay alegrías que no caben en una flor pequeña.'}
        </p>
        {#if stage === 'SECRET_BLOOM'}
          <div class="growing-label">
            <span class="breathing-dot"></span>UNA ÚLTIMA SORPRESA
          </div>
        {:else}
          <button class="primary" bind:this={exploreButton} onclick={explore}
            >Volver a mi primavera <span>✧</span></button
          >
        {/if}
      {:else}
        <h1>Tu primavera<br />se queda<br /><em>contigo.</em></h1>
        <p>Sin prisa. Todavía hay flores por descubrir.</p>
        <button class="primary" onclick={discoverNext}
          >Descubrir una flor <span>✧</span></button
        >
        <button class="text-button" onclick={startWind}
          >Pedir otro deseo ↗</button
        >
        {#if gardenConfig.secrets}
          <button class="text-button" onclick={lastSurprise}
            >¿Una última sorpresa? ✧</button
          >
        {/if}
      {/if}
    {:else if hasBouquet}
      <h1>Las flores se unen <em>para ti.</em></h1>
      <p aria-live="polite">
        {stage === 'GATHERING'
          ? 'Cada flor encuentra su lugar.'
          : stage === 'BOUQUET'
            ? 'Hay algo guardado entre estas flores.'
            : stage === 'UNWRAPPING'
              ? 'Algunas palabras estaban esperando por ti.'
              : 'Lo que florece también tiene algo que decir.'}
      </p>
      {#if stage === 'GATHERING' || stage === 'UNWRAPPING'}
        <div class="growing-label">
          <span class="breathing-dot"></span>{stage === 'GATHERING'
            ? 'REUNIENDO TUS FLORES'
            : 'UN PEQUEÑO SECRETO'}
        </div>
      {:else if stage === 'BOUQUET'}
        <p class="ribbon-instruction">Tira suavemente de la cinta dorada.</p>
        <button class="text-button" bind:this={ribbonShortcut} onclick={untie}
          >Desatar sin arrastrar <span>↗</span></button
        >
      {:else}
        <button class="primary" bind:this={cardButton} onclick={openCard}
          >Leer mi carta <span>↗</span></button
        >
        <span class="microcopy">También puedes tocar la tarjeta.</span>
        <button class="text-button next-wind" onclick={startWind}
          >Un último deseo <span>↗</span></button
        >
      {/if}
    {:else}
      <h1>Un mundo comienza a <em>despertar.</em></h1>
      <p>Cada flor guarda algo bonito para ti.</p>
      <button class="primary" onclick={gatherFlowers}
        >Crear mi ramo <span>↗</span></button
      >
      <button
        class="text-button direct-note"
        bind:this={cardButton}
        onclick={openCard}>Una nota para ti <span>↗</span></button
      >
      <button class="text-button discover" onclick={discoverNext}
        >Descubrir una flor <span>✧</span></button
      >
      <button class="text-button next-wind" onclick={startWind}
        >Un último deseo ↗</button
      >
    {/if}
  </section>

  {#if !failed}
    <div class="scene-caption" aria-live="polite">
      {#if isFinale}
        <span class="caption-line"></span>
        <span
          >{stage === 'WIND'
            ? 'Cada deseo empieza con un soplo'
            : stage === 'FREE_EXPLORE'
              ? 'Este jardín siempre será tuyo'
              : 'Estas flores no se marchitan'}</span
        >
      {:else if stage === 'BOUQUET'}
        <RibbonInteraction
          onpull={(value) => {
            ribbonPull = value;
          }}
          onrelease={untie}
        />
      {:else}
        <span class="caption-line"></span>
        <span
          >{hasBouquet
            ? stage === 'CARD_READY' || stage === 'FINALE'
              ? 'Estas flores no se marchitan'
              : 'Todas estas flores, para ti'
            : isGarden
              ? 'Tu pequeño rincón de primavera'
              : isGrowing
                ? 'Todo sucede a su tiempo'
                : 'Aquí empieza algo bonito'}</span
        >
      {/if}
      <span class="caption-coordinates"
        >{isFinale && stage !== 'FREE_EXPLORE'
          ? 'UN POQUITO DE LUZ · PARA TI'
          : isGarden
            ? `${String(discovered.length).padStart(2, '0')} FLORES DESCUBIERTAS`
            : 'UNA SEMILLA · INFINITAS POSIBILIDADES'}</span
      >
    </div>
  {/if}
  <div class="flower-message" role="status" class:visible={!!message}>
    {message}
  </div>
  <footer>
    <div class="date">
      <span class="date-number">{gardenConfig.date}</span><span
        >BIENVENIDA,<br />PRIMAVERA</span
      >
    </div>
    <nav class="stages" aria-label="Progreso del jardín">
      {#each ['Semilla', 'Raíces', 'Flores', 'Para ti'] as label, index (label)}
        <span
          class:active={progress === index}
          class:complete={progress > index}
          aria-current={progress === index ? 'step' : undefined}
          ><i></i><span>{label}</span></span
        >
      {/each}
    </nav>
    {#if isGarden}<button class="text-button restart" onclick={restart}
        >Volver a florecer ↻</button
      >{:else}<span class="footer-note">Hecho para hacerte sonreír.</span>{/if}
  </footer>
</main>

<dialog
  bind:this={dialog}
  oncancel={(event) => {
    event.preventDefault();
    closeCard();
  }}
  aria-labelledby="card-title"
>
  <button class="close-card" aria-label="Cerrar nota" onclick={closeCard}
    >×</button
  >
  <span class="card-kicker">YELLOW GARDEN · {gardenConfig.date}</span>
  <span class="card-flower" aria-hidden="true">✳</span>
  <h2 id="card-title">{card.heading}</h2>
  {#each card.paragraphs as paragraph (paragraph)}<p>{paragraph}</p>{/each}
  <p class="card-closing">{card.closing}</p>
  <span class="card-signature">Con un poquito de luz, para ti.</span>
  <button class="card-return" onclick={closeCard}
    >Volver a mi jardín <span>↗</span></button
  >
</dialog>
