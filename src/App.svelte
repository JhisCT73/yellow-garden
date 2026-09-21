<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { journey, journeyIndex } from './content/journey';
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
  let stage = $state<GardenStage>('INTRO');
  let mode = $state<'guided' | 'auto'>('guided');
  let paused = $state(false),
    pageHidden = $state(false),
    flowOpen = $state(false);
  let flowDialog: HTMLDialogElement;
  let flowButton: HTMLButtonElement;
  let furthest = $state(0),
    navigation = $state(0),
    letterRead = $state(false);
  const stepIndex = $derived(journeyIndex(stage));
  const playbackPaused = $derived(paused || pageHidden || flowOpen);
  $effect(() => {
    if (mode !== 'auto' || playbackPaused || !ready || failed) return;
    const current = stage;
    if (
      ![
        'GARDEN',
        'BOUQUET',
        'CARD_READY',
        'WIND',
        'CELEBRATION',
        'TEXT_READY',
        'FREE_EXPLORE',
        'SECRET_READY',
      ].includes(current)
    )
      return;
    if (current === 'CARD_READY' && letterRead) return;
    const timer = setTimeout(
      () => {
        if (stage !== current) return;
        if (current === 'GARDEN') gatherFlowers();
        else if (current === 'BOUQUET') untie();
        else if (current === 'CARD_READY') void openCard();
        else if (current === 'WIND') releaseWind();
        else if (current === 'CELEBRATION') formMessage();
        else if (current === 'TEXT_READY') explore();
        else if (current === 'FREE_EXPLORE') lastSurprise();
        else if (current === 'SECRET_READY') void rest();
      },
      current === 'FREE_EXPLORE' ? 500 : current === 'CARD_READY' ? 1800 : 4500,
    );
    return () => clearTimeout(timer);
  });
  function showJourney() {
    flowOpen = true;
    flowDialog.showModal();
  }
  function closeJourney() {
    flowDialog.close();
    flowOpen = false;
    flowButton?.focus();
  }
  async function visitStep(index: number) {
    if (index < 0 || index >= journey.length) return;
    if (flowOpen) closeJourney();
    if (dialog?.open) dialog.close();
    message = '';
    clearTimeout(messageTimeout);
    ribbonPull = 0;
    windCharge = 0;
    letterRead = false;
    hasBouquet = index >= 4 && index <= 7;
    paused = false;
    navigation += 1;
    actor.send({ type: 'NAVIGATE', stage: journey[index].stage });
    await tick();
    flowButton?.focus({ preventScroll: true });
  }
  function nextStep() {
    if (stage === 'INTRO') plant();
    else if (stage === 'GARDEN') gatherFlowers();
    else if (stage === 'BOUQUET') untie();
    else if (stage === 'CARD_READY' && !letterRead) void openCard();
    else if (stage === 'CARD_READY') startWind();
    else if (stage === 'WIND') releaseWind();
    else if (stage === 'CELEBRATION') formMessage();
    else if (stage === 'TEXT_READY') {
      explore();
      lastSurprise();
    } else if (stage === 'FREE_EXPLORE') lastSurprise();
    else if (stage === 'SECRET_READY') void rest();
    else void visitStep(stepIndex + 1);
  }
  function continueLetter() {
    closeCard();
    startWind();
  }
  let qualityLevel = $state<QualityLevel>(
    initialQuality(navigator.hardwareConcurrency || 4),
  );
  let care = $state<GardenCare>('light');

  const actor = createActor(gardenMachine);
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
      'BENCH',
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
      furthest = Math.max(furthest, journeyIndex(stage));
    });
    actor.start();
    const visibility = () => {
      pageHidden = document.hidden;
      if (document.hidden) {
        audio.mute();
        muted = true;
      }
    };
    visibility();
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
      muted = !(await audio.enable());
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
    letterRead = true;
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
  async function rest() {
    message = '';
    clearTimeout(messageTimeout);
    actor.send({ type: 'REST' });
    await tick();
    exploreButton?.focus({ preventScroll: true });
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
    paused = false;
    letterRead = false;
    furthest = 0;
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
  class:cinematic-opening={!failed}
  data-stage={stage}
  data-mode={mode}
  data-paused={playbackPaused}
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
            {navigation}
            paused={playbackPaused}
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
      {:else}<img
          class="brand-mark"
          src={`${import.meta.env.BASE_URL}branding/zyxer-mark.png`}
          alt=""
          width="44"
          height="44"
        />{/if}
      <button
        class="journey-trigger"
        bind:this={flowButton}
        onclick={showJourney}
        aria-haspopup="dialog"
        aria-label="Abrir tu recorrido"
      >
        <strong class="brand-name">ZyXer Labs</strong><span
          >{stepIndex + 1} de {journey.length} · {journey[stepIndex]
            .title}</span
        >
      </button>
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

  {#if !failed && stage !== 'INTRO'}
    <nav class="journey-controls" aria-label="Controles del recorrido">
      <p aria-live="polite">{journey[stepIndex].hint}</p>
      <div>
        <button onclick={() => visitStep(stepIndex - 1)}>Anterior</button>
        <button
          aria-pressed={paused}
          onclick={() => {
            paused = !paused;
          }}>{paused ? 'Reanudar' : 'Pausar'}</button
        >
        <button
          disabled={stepIndex === journey.length - 1}
          onclick={() => {
            paused = false;
            nextStep();
          }}>Siguiente</button
        >
      </div>
      <span
        >{paused
          ? 'Recorrido en pausa'
          : mode === 'auto'
            ? stage === 'CARD_READY' && letterRead
              ? 'Pulsa Siguiente para continuar'
              : 'Historia automática'
            : 'A tu ritmo'}</span
      >
    </nav>
  {/if}
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
      <fieldset class="journey-modes">
        <legend>¿Cómo quieres vivirlo?</legend>
        <label
          ><input type="radio" bind:group={mode} value="auto" />Ver la historia<span
            >Avanza automáticamente; tú decides cuándo cerrar la carta.</span
          ></label
        >
        <label
          ><input type="radio" bind:group={mode} value="guided" />Explorar a mi
          ritmo<span
            >Interactúa o usa Siguiente. Siempre sabrás dónde estás.</span
          ></label
        >
      </fieldset>
      <button class="primary" onclick={plant} disabled={!ready}>
        {ready
          ? mode === 'auto'
            ? 'Comenzar la historia'
            : 'Plantar mi semilla'
          : 'Preparando tu jardín…'}
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
        <h1>Siente el poder de <em>soltar.</em></h1>
        <p>Algo bonito todavía está por venir.</p>
        <WindInteraction
          oncharge={(value) => {
            windCharge = value;
          }}
          onrelease={releaseWind}
        />
      {:else if stage === 'BURST' || stage === 'HEART'}
        <h1>Las luces encuentran <em>su forma.</em></h1>
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
        <h1>Estas flores son <em>para ti.</em></h1>
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
        <h1>Algo bonito siempre <em>florece.</em></h1>
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
      {:else if stage === 'BENCH'}
        <h1>¿Ya <em>terminamos?</em></h1>
        <p>Mentira. Una última cosa: este rincón siempre será tuyo.</p>
        <button class="primary" bind:this={exploreButton} onclick={explore}
          >Volver a mi primavera <span>✧</span></button
        >
        <button class="text-button" onclick={restart}
          >Volver a florecer ↻</button
        >
      {:else if stage === 'SECRET_BLOOM' || stage === 'SECRET_READY'}
        <h1>Estas flores no se <em>marchitan.</em></h1>
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
          <button class="text-button" onclick={rest}>Un momento más ↗</button>
        {/if}
      {:else}
        <h1>Tu primavera se queda <em>contigo.</em></h1>
        <p>Sin prisa. Todavía hay flores por descubrir.</p>
        <button class="primary" onclick={discoverNext}
          >Descubrir una flor <span>✧</span></button
        >
        <button class="text-button" onclick={startWind}
          >Pedir otro deseo ↗</button
        >
        <button class="text-button" onclick={restart}
          >Volver a florecer ↻</button
        >
        <button class="text-button" onclick={rest}
          >Descansar en el jardín ↗</button
        >
        {#if gardenConfig.secrets}
          <button class="text-button" onclick={lastSurprise}
            >¿Una última sorpresa? ✧</button
          >
        {/if}
      {/if}
    {:else if hasBouquet}
      <h1>
        {stage === 'CARD_READY' || stage === 'FINALE'
          ? 'Unas palabras'
          : 'Las flores se unen'} <em>para ti.</em>
      </h1>
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
  class="journey-dialog"
  bind:this={flowDialog}
  aria-labelledby="journey-title"
  oncancel={(event) => {
    event.preventDefault();
    closeJourney();
  }}
>
  <button
    class="close-card"
    aria-label="Cerrar recorrido"
    onclick={closeJourney}>×</button
  >
  <h2 id="journey-title">Tu recorrido</h2>
  <p>Vuelve a una etapa visitada o continúa donde estás.</p>
  <label class="journey-mode-select"
    >Modo de recorrido<select bind:value={mode}
      ><option value="auto">Ver la historia</option><option value="guided"
        >Explorar a mi ritmo</option
      ></select
    ></label
  >
  <ol>
    {#each journey as step, index (step.stage)}<li>
        <button
          disabled={index > furthest}
          aria-current={index === stepIndex ? 'step' : undefined}
          onclick={() => visitStep(index)}
          >{String(index + 1).padStart(2, '0')} · {step.title}{index ===
          stepIndex
            ? ' · Estás aquí'
            : ''}</button
        >
      </li>{/each}
  </ol>
  <button
    class="text-button"
    onclick={() => {
      closeJourney();
      restart();
    }}>Reiniciar recorrido</button
  >
</dialog>

<dialog
  class="botanical-letter"
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
  <div class="letter-content">
    <span class="card-kicker">YELLOW GARDEN · {gardenConfig.date}</span>
    <h2 id="card-title">{card.heading}</h2>
    {#each card.paragraphs as paragraph (paragraph)}<p>{paragraph}</p>{/each}
    <p class="card-closing">{card.closing}</p>
    <span class="card-signature">Con un poquito de luz, para ti.</span>
    <button
      class="card-return"
      onclick={mode === 'auto' ? continueLetter : closeCard}
      >{mode === 'auto' ? 'Continuar la historia' : 'Volver a mi jardín'}
      <span>↗</span></button
    >
  </div>
</dialog>
