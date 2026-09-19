<script lang="ts">
  import { onMount } from 'svelte';
  let {
    oncharge,
    onrelease,
  }: { oncharge: (charge: number) => void; onrelease: () => void } = $props();
  let holding = $state(false),
    charge = $state(0);
  let input: 'pointer' | 'keyboard' | null = null;
  let pointer: number | null = null;
  let began = 0,
    frame = 0;
  let button: HTMLButtonElement;
  function step(now: number) {
    charge = Math.min(1, (now - began) / 1400);
    oncharge(charge);
    frame = requestAnimationFrame(step);
  }
  function begin(source: 'pointer' | 'keyboard') {
    if (holding) return;
    input = source;
    holding = true;
    began = performance.now();
    frame = requestAnimationFrame(step);
  }
  function cancel() {
    cancelAnimationFrame(frame);
    holding = false;
    input = null;
    pointer = null;
    charge = 0;
    oncharge(0);
  }
  function release() {
    if (!holding) return;
    cancel();
    onrelease();
  }
  onMount(() => {
    button.focus({ preventScroll: true });
    const hidden = () => {
      if (document.hidden) cancel();
    };
    window.addEventListener('blur', cancel);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('blur', cancel);
      document.removeEventListener('visibilitychange', hidden);
    };
  });
</script>

<div class="wind-control">
  <button
    bind:this={button}
    class="hold-wind"
    class:holding
    style:--charge={`${charge * 100}%`}
    aria-label="Mantener para crear viento"
    aria-describedby="wind-help"
    onpointerdown={(event) => {
      if (event.isPrimary && event.button === 0) {
        pointer = event.pointerId;
        button.setPointerCapture(pointer);
        begin('pointer');
      }
    }}
    onpointerup={(event) => {
      if (pointer === event.pointerId) {
        release();
        if (button.hasPointerCapture(event.pointerId))
          button.releasePointerCapture(event.pointerId);
      }
    }}
    onpointercancel={cancel}
    onlostpointercapture={() => {
      if (holding && input === 'pointer') cancel();
    }}
    onkeydown={(event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        if (!event.repeat) begin('keyboard');
      }
      if (event.key === 'Escape') cancel();
    }}
    onkeyup={(event) => {
      if (
        input === 'keyboard' &&
        (event.key === ' ' || event.key === 'Enter')
      ) {
        event.preventDefault();
        release();
      }
    }}
    onblur={cancel}
    oncontextmenu={(event) => event.preventDefault()}
    onclick={(event) => {
      if (event.detail === 0 && !holding) onrelease();
    }}
  >
    <span>{holding ? 'Suelta y pide un deseo' : 'Mantén pulsado'}</span><span
      aria-hidden="true">≈</span
    >
  </button>
  <span id="wind-help">Mantén y suelta. También con Espacio o Enter.</span>
  <button class="text-button" onclick={onrelease}
    >Continuar sin mantener pulsado ↗</button
  >
</div>

<style>
  .wind-control {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    pointer-events: auto;
  }
  .hold-wind {
    position: relative;
    min-height: 54px;
    min-width: 244px;
    display: flex;
    justify-content: space-between;
    gap: 24px;
    padding: 16px 22px;
    background: linear-gradient(
      90deg,
      #ffd84d var(--charge),
      #171e29 var(--charge)
    );
    border: 1px solid #d4b558;
    color: #fff8e7;
    border-radius: 3px;
    font:
      14px 'Segoe UI',
      sans-serif;
    touch-action: none;
    user-select: none;
  }
  .hold-wind.holding {
    color: #fff8e7;
    text-shadow:
      0 1px 3px #000,
      0 0 5px #000;
  }
  #wind-help {
    font:
      12px/1.5 'Segoe UI',
      sans-serif;
    color: #b6b9b5;
    max-width: 280px;
  }
  .text-button {
    font-size: 12px;
    margin: 0;
    padding: 2px 0;
  }
</style>
