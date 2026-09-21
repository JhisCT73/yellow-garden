<script lang="ts">
  import { onMount } from 'svelte';
  let {
    flowers,
    seed,
    onfound,
  }: { flowers: number; seed: string; onfound: () => void } = $props();
  let dialog: HTMLDialogElement;
  let trigger: HTMLButtonElement;
  let happy = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  function cancel() {
    clearTimeout(timer);
  }
  function reveal() {
    cancel();
    if (!dialog.open) {
      happy = false;
      dialog.showModal();
    }
  }
  function close() {
    dialog.close();
    trigger.focus({ preventScroll: true });
  }
  onMount(() => {
    window.addEventListener('blur', cancel);
    return () => {
      cancel();
      window.removeEventListener('blur', cancel);
    };
  });
</script>

<button
  class="secret-trigger"
  bind:this={trigger}
  aria-label="Descubrir el secreto del jardín"
  title="Hay algo escondido aquí…"
  onpointerdown={(event) => {
    if (event.isPrimary && event.button === 0) timer = setTimeout(reveal, 800);
  }}
  onpointerup={cancel}
  onpointerleave={cancel}
  onpointercancel={cancel}
  onblur={cancel}
  oncontextmenu={(event) => event.preventDefault()}
  onclick={reveal}
  ><img
    class="brand-mark"
    src={`${import.meta.env.BASE_URL}branding/zyxer-mark.png`}
    alt=""
    width="44"
    height="44"
  /></button
>

<dialog
  class="garden-terminal"
  bind:this={dialog}
  aria-labelledby="secret-heading"
  oncancel={(event) => {
    event.preventDefault();
    close();
  }}
>
  <button class="close-card" aria-label="Cerrar secreto" onclick={close}
    >×</button
  >
  <span class="terminal-label">UN SECRETO ENTRE LAS FLORES</span>
  <h2 id="secret-heading">La raíz de todo.</h2>
  <p class="terminal-intro">Un pequeño extra para los curiosos.</p>
  <pre>&gt; inspect garden

flowers .......... {flowers}
yellow ........... true
spring ........... loaded
seed ............. {seed}
happiness ........ {happy ? 'found' : 'pending'}</pre>
  {#if happy}
    <p class="secret-success" role="status">
      SUCCESS 🌻<br /><span
        >También hay un poquito de magia en quien se detiene a buscar.</span
      >
    </p>
  {:else}
    <button
      class="execute"
      onclick={() => {
        happy = true;
        onfound();
      }}>&gt; execute happiness</button
    >
  {/if}
  <button class="terminal-return" onclick={close}>Volver a las flores ↗</button>
</dialog>

<style>
  .secret-trigger {
    color: var(--sun);
    background: none;
    padding: 0;
    min-width: 36px;
    min-height: 44px;
    font:
      36px/1 Georgia,
      serif;
    touch-action: manipulation;
  }
  .garden-terminal {
    background: #08110ff5;
    color: #fff8e7;
    border-color: #3e6b58;
    text-align: left;
    padding: 38px 30px 24px;
    width: min(560px, calc(100% - 32px));
    box-shadow: 0 24px 100px #000b;
  }
  .garden-terminal::backdrop {
    background: #030910c9 url('/textures/night-garden.jpg') center / cover;
  }
  .terminal-intro {
    color: #91ad9f;
    font-size: 14px;
  }
  .garden-terminal .close-card {
    color: #bdc0be;
  }
  .terminal-label {
    font-size: 11px;
    letter-spacing: 1.8px;
    color: #77c6a2;
  }
  .garden-terminal h2 {
    font:
      32px Georgia,
      serif;
    margin: 20px 0 10px;
  }
  pre {
    font:
      14px/1.8 Consolas,
      monospace;
    color: #9fc6b4;
    border-block: 1px solid #254a3b;
    padding: 20px 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .execute {
    background: #112b20;
    color: #9fe8c3;
    border: 1px solid #437259;
    padding: 14px 16px;
    margin-top: 10px;
    font:
      14px Consolas,
      monospace;
    width: 100%;
    text-align: left;
  }
  .terminal-return {
    display: block;
    color: #babdad;
    background: none;
    padding: 15px 0 0;
    font-size: 13px;
  }
  .garden-terminal .secret-success {
    color: #a8f5cf;
    font:
      16px/1.7 Consolas,
      monospace;
  }
  .secret-success span {
    display: block;
    color: #d5d6cb;
    font:
      15px/1.7 'Segoe UI',
      sans-serif;
    margin-top: 14px;
  }
</style>
