<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Canvas } from '@threlte/core';
  import { createActor } from 'xstate';
  import GardenScene from './world/GardenScene.svelte';
  import { gardenMachine, type GardenStage } from './machines/garden.machine';
  import { gardenConfig } from './config/garden.config';
  import { card, flowerMessages } from './content/messages';
  import { AudioEngine } from './systems/AudioEngine';

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
  const audio = new AudioEngine();
  const seed =
    new URLSearchParams(window.location.search).get('seed')?.slice(0, 100) ||
    gardenConfig.defaultSeed;
  const isGrowing = $derived(stage === 'GROWING' || stage === 'BLOOMING');
  const isGarden = $derived(stage === 'GARDEN' || stage === 'FINALE');
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
    actor.send({ type: 'OPEN_CARD' });
    await tick();
    dialog.showModal();
  }
  function closeCard() {
    dialog.close();
    actor.send({ type: 'CLOSE_CARD' });
    cardButton?.focus();
  }
  function restart() {
    message = '';
    discovered = [];
    clearTimeout(messageTimeout);
    actor.send({ type: 'RESTART' });
  }
</script>

<svelte:head
  ><title>{gardenConfig.title} · Un regalo que florece</title></svelte:head
>

<main class:grown={isGarden} data-stage={stage}>
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
            oncomplete={(type) => actor.send({ type })}
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
    <a class="wordmark" href="./" aria-label="Yellow Garden, inicio"
      ><span class="brand-symbol">✳</span> yellow garden<span class="brand-dot"
        >.</span
      ></a
    >
    <span class="edition">UNA PEQUEÑA CELEBRACIÓN DE LA PRIMAVERA</span>
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
      <h1>Todo lo bonito<br />comienza con<br />una <em>semilla.</em></h1>
      <p>
        Un poco de luz. Un momento para ti.<br />Y algo que está a punto de
        florecer.
      </p>
      <button class="primary" onclick={plant} disabled={!ready}>
        {ready ? 'Plantar mi semilla' : 'Preparando tu jardín…'}
        <span>↗</span></button
      >
      <span class="microcopy">Sin prisa. Este momento es tuyo.</span>
    {:else if isGrowing}
      <h1>
        {stage === 'GROWING' ? 'Lo pequeño' : 'Un poquito'}<br />{stage ===
        'GROWING'
          ? 'también hace'
          : 'de luz cambia'}<br /><em
          >{stage === 'GROWING' ? 'magia.' : 'todo.'}</em
        >
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
    {:else}
      <h1>Lo bonito<br />también sabe<br /><em>florecer.</em></h1>
      <p>Estas flores son para ti.<br />Y cada una guarda algo bonito.</p>
      <button class="primary" bind:this={cardButton} onclick={openCard}
        >Una nota para ti <span>↗</span></button
      >
      <button
        class="text-button discover"
        onclick={() => discover(discovered.length % gardenConfig.flowerCount)}
        >Descubrir una flor <span>✧</span></button
      >
    {/if}
  </section>

  {#if !failed}
    <div class="scene-caption" aria-live="polite">
      <span class="caption-line"></span>
      <span
        >{isGarden
          ? 'Tu pequeño rincón de primavera'
          : isGrowing
            ? 'Todo sucede a su tiempo'
            : 'Aquí empieza algo bonito'}</span
      >
      <span class="caption-coordinates"
        >{isGarden
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
