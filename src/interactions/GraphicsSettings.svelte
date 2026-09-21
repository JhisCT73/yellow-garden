<script lang="ts">
  import type {
    QualityLevel,
    QualityMode,
  } from '../systems/PerformanceManager';
  let {
    mode = $bindable<QualityMode>('auto'),
    level,
  }: { mode: QualityMode; level: QualityLevel } = $props();
  let dialog: HTMLDialogElement;
  let trigger: HTMLButtonElement;
  const labels = { low: 'Ligera', medium: 'Equilibrada', high: 'Alta' };
  const configuredRepository = import.meta.env.VITE_REPOSITORY_URL ?? '';
  const repository = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(
    configuredRepository,
  )
    ? configuredRepository.replace(/\/$/, '')
    : '';
  function close() {
    dialog.close();
    trigger.focus();
  }
</script>

<button
  class="settings-trigger"
  bind:this={trigger}
  aria-label="Ajustes del jardín"
  onclick={() => dialog.showModal()}
>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    aria-hidden="true"
    ><path d="M4 7h16M4 17h16" /><circle
      cx="9"
      cy="7"
      r="3"
      fill="#080c18"
    /><circle cx="15" cy="17" r="3" fill="#080c18" /></svg
  >
</button>
<dialog
  bind:this={dialog}
  aria-labelledby="settings-title"
  oncancel={(event) => {
    event.preventDefault();
    close();
  }}
>
  <button class="close-card" aria-label="Cerrar ajustes" onclick={close}
    >×</button
  >
  <h2 id="settings-title">A tu ritmo.</h2>
  <label for="graphics-quality">Calidad del jardín</label>
  <select id="graphics-quality" bind:value={mode}>
    <option value="auto">Automática</option>
    <option value="low">Ligera</option>
    <option value="high">Alta</option>
  </select>
  <p>
    Si el jardín va lento o tu dispositivo se calienta, prueba Ligera. Tus
    flores y mensajes siguen aquí.
  </p>
  <p class="current" role="status">Calidad actual: {labels[level]}</p>
  <details class="about-project">
    <summary>Acerca del proyecto · ZyXer Labs</summary>
    <p>
      Un jardín para disfrutar en tu navegador o como aplicación de Windows. El
      código también está disponible para aprender y crear tu propia versión.
    </p>
    {#if repository}
      <a
        href={`${repository}/releases`}
        target="_blank"
        rel="noopener noreferrer">Descargas para Windows ↗</a
      >
      <a href={repository} target="_blank" rel="noopener noreferrer"
        >Código e instrucciones en GitHub ↗</a
      >
    {:else}
      <p>
        Edición local. Los enlaces de descarga estarán disponibles al publicar
        el repositorio.
      </p>
    {/if}
  </details>
  <button class="card-return" onclick={close}>Volver al jardín ↗</button>
</dialog>

<style>
  .settings-trigger {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 1px solid #fff8e729;
    border-radius: 50%;
    background: transparent;
    color: #b6b9b5;
    flex-shrink: 0;
  }
  svg {
    width: 20px;
    height: 20px;
  }
  dialog {
    max-width: 420px;
    text-align: left;
  }
  h2 {
    margin: 12px 0 28px;
  }
  label {
    display: block;
    margin-bottom: 10px;
    font-size: 14px;
  }
  select {
    width: 100%;
    min-height: 44px;
    padding: 10px;
    border: 1px solid #786434;
    border-radius: 3px;
    background: #fff8e7;
    color: #282516;
    font: inherit;
  }
  select:focus-visible {
    outline: 2px solid #786434;
    outline-offset: 3px;
  }
  p {
    font-family: 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.65;
  }
  .current {
    font-size: 12px;
  }
  .about-project {
    border-top: 1px solid #78643466;
    padding-top: 16px;
    margin: 20px 0;
  }
  summary {
    cursor: pointer;
    font-size: 13px;
  }
  .about-project a {
    display: block;
    color: #74531a;
    padding: 8px 0;
    font-size: 14px;
  }
</style>
