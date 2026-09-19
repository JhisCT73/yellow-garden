<script lang="ts">
  import { onMount } from 'svelte';
  let {
    onpull,
    onrelease,
  }: { onpull: (value: number) => void; onrelease: () => void } = $props();
  let progress = $state(0);
  let activePointer: number | null = null;
  let startX = 0;
  let travel = 100;
  let handle: HTMLButtonElement;
  function reset() {
    activePointer = null;
    progress = 0;
    onpull(0);
  }
  function complete() {
    activePointer = null;
    progress = 1;
    onpull(1);
    onrelease();
  }
  function down(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    activePointer = event.pointerId;
    startX = event.clientX;
    travel = Math.min(110, window.innerWidth * 0.22);
    handle.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent) {
    if (event.pointerId !== activePointer) return;
    progress = Math.min(1, Math.max(0, (event.clientX - startX) / travel));
    onpull(progress);
  }
  function up(event: PointerEvent) {
    if (event.pointerId !== activePointer) return;
    if (progress >= 0.8) complete();
    else reset();
    if (handle.hasPointerCapture(event.pointerId))
      handle.releasePointerCapture(event.pointerId);
  }
  onMount(() => {
    const cancel = () => reset();
    window.addEventListener('blur', cancel);
    return () => window.removeEventListener('blur', cancel);
  });
</script>

<div class="ribbon-control">
  <button
    class="ribbon-handle"
    bind:this={handle}
    aria-label="Tirar de la cinta"
    aria-describedby="ribbon-help"
    style:--pull={`${progress * 65}px`}
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={reset}
    onlostpointercapture={() => {
      if (activePointer !== null) reset();
    }}
    onclick={(event) => {
      if (event.detail === 0) complete();
    }}
  >
    <span aria-hidden="true">✧</span> Tira de la cinta
    <span aria-hidden="true">→</span>
  </button>
  <span id="ribbon-help">Arrastra a la derecha o pulsa Enter.</span>
</div>

<style>
  .ribbon-control {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    pointer-events: auto;
  }
  .ribbon-handle {
    min-height: 48px;
    padding: 12px 18px;
    display: flex;
    gap: 14px;
    align-items: center;
    touch-action: none;
    user-select: none;
    background: #1a1b1ee8;
    border: 1px solid #d8b65e;
    border-radius: 3px;
    color: #f5d87d;
    font:
      14px 'Segoe UI',
      sans-serif;
    transform: translateX(var(--pull));
    cursor: grab;
  }
  .ribbon-handle:active {
    cursor: grabbing;
  }
  #ribbon-help {
    font:
      12px/1.5 'Segoe UI',
      sans-serif;
    color: #bdb9a9;
    font-style: normal;
  }
</style>
