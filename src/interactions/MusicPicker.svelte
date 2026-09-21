<script lang="ts">
  let { onselect }: { onselect: (file?: File) => void } = $props();
  let name = $state('');
  let input: HTMLInputElement;
  function select() {
    const file = input.files?.[0];
    if (!file) return;
    name = file.name;
    onselect(file);
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
    <label
      >Elegir archivo de audio<input
        bind:this={input}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a"
        onchange={select}
      /></label
    >
    <p>
      Tu archivo se reproduce localmente y no se sube a ningún servidor. Deberás
      elegirlo de nuevo al abrir la experiencia.
    </p>
    {#if name}<p class="filename">{name}</p>
      <p>
        Activa «Sonido» para escuchar. Si no se reproduce, prueba con MP3 o WAV.
      </p>
      <button
        onclick={() => {
          onselect();
          name = '';
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
    max-height: 65vh;
    overflow: auto;
    z-index: 100;
  }
  p {
    margin: 10px 0;
  }
  input {
    display: block;
    width: 100%;
    margin-top: 8px;
  }
  .filename {
    overflow-wrap: anywhere;
    color: #f4d779;
  }
  button {
    padding: 8px 16px;
  }
</style>
