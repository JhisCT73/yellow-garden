<script lang="ts">
  let { onselect }: { onselect: (file?: File) => void } = $props();
  let name = $state('');
  let input: HTMLInputElement;
  let dragging = $state(false);
  let error = $state('');
  function select(file?: File) {
    if (!file) return;
    if (
      !file.type.startsWith('audio/') &&
      !/\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(file.name)
    ) {
      error = 'Ese archivo no es de audio. Prueba con una canción MP3 o WAV.';
      return;
    }
    error = '';
    name = file.name;
    onselect(file);
  }
  function drop(event: DragEvent) {
    event.preventDefault();
    dragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 1) {
      error = 'Elige una sola canción a la vez.';
      return;
    }
    select(files?.[0]);
  }
</script>

<details class="music-picker">
  <summary aria-label="Elegir música">♫</summary>
  <div class="music-panel">
    <strong>Tu música, tu primavera</strong>
    <p>
      La música aporta una dimensión especial a esta experiencia. Elige una
      canción de tu equipo para acompañar tu recorrido.
    </p>
    <input
      class="file-input"
      aria-label="Elegir archivo de audio"
      bind:this={input}
      type="file"
      accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus"
      onchange={() => {
        select(input.files?.[0]);
        input.value = '';
      }}
    />
    <button
      class="drop-zone"
      class:dragging
      onclick={() => input.click()}
      ondragover={(event) => {
        event.preventDefault();
        dragging = true;
      }}
      ondragleave={() => {
        dragging = false;
      }}
      ondrop={drop}
    >
      <span class="music-icon" aria-hidden="true">♫</span>
      <strong
        >{dragging
          ? 'Suelta tu canción aquí'
          : 'Arrastra tu canción aquí'}</strong
      >
      <span>o haz clic para elegir un archivo</span>
      <small>MP3, WAV, OGG y otros formatos de audio</small>
    </button>
    {#if error}<p role="alert" class="error">{error}</p>{/if}
    <p>
      Tu archivo se reproduce localmente y no se sube a ningún servidor. Deberás
      elegirlo de nuevo al abrir la experiencia.
    </p>
    {#if name}<p class="filename">{name}</p>
      <p>
        Activa «Sonido» para escuchar. Si no se reproduce, prueba con MP3 o WAV.
      </p>
      <button
        class="remove-music"
        onclick={() => {
          onselect();
          name = '';
          error = '';
          input.value = '';
        }}>Quitar música</button
      >{/if}
  </div>
</details>

<style>
  .music-picker {
    position: relative;
  }
  summary {
    list-style: none;
    cursor: pointer;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 1px solid #ffffff30;
    border-radius: 50%;
    color: #f4d779;
    background: #080e19dd;
    font-size: 1.4rem;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  .music-panel {
    position: absolute;
    right: 0;
    top: 54px;
    width: min(310px, calc(100vw - 40px));
    padding: 20px;
    border: 1px solid #c9a75170;
    border-radius: 18px;
    background: #080e19f5;
    color: #f5edd8;
    font-size: 13px;
    line-height: 1.6;
    box-shadow: 0 12px 40px #0008;
    max-height: calc(100dvh - 130px);
    overflow: auto;
    z-index: 100;
  }
  p {
    margin: 10px 0;
  }
  .file-input {
    display: none;
  }
  .drop-zone {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 20px 12px;
    border: 1px dashed #c9a751;
    border-radius: 14px;
    background: #15202d;
    color: #f5edd8;
    font: inherit;
    cursor: pointer;
    text-align: center;
  }
  .drop-zone:hover,
  .drop-zone.dragging {
    background: #263129;
    border-color: #ffe49a;
  }
  .drop-zone > * {
    pointer-events: none;
  }
  .music-icon {
    font-size: 28px;
    color: #f4d779;
  }
  small {
    color: #bbc5cf;
    font-size: 11px;
  }
  .error {
    color: #ffb7a6;
  }
  .remove-music {
    background: #17202d;
    color: #f4d779;
    border: 1px solid #c9a751;
    border-radius: 999px;
    cursor: pointer;
    font: inherit;
  }
  .remove-music:hover {
    background: #293343;
  }
  button:focus-visible,
  summary:focus-visible {
    outline: 2px solid #ffe49a;
    outline-offset: 4px;
  }
  .filename {
    overflow-wrap: anywhere;
    color: #f4d779;
  }
  button {
    padding: 8px 16px;
  }
</style>
