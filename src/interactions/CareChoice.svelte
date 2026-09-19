<script lang="ts">
  import type { GardenCare } from '../systems/GardenCare';
  let { value = $bindable<GardenCare>('light') }: { value: GardenCare } =
    $props();
  const choices = [
    { value: 'light', name: 'Luz', icon: '☀' },
    { value: 'water', name: 'Agua', icon: '💧' },
    { value: 'music', name: 'Música', icon: '♫' },
  ] as const;
</script>

<fieldset>
  <legend>Un detalle para tu semilla</legend>
  <div class="choices">
    {#each choices as choice (choice.value)}
      <label class:selected={value === choice.value}>
        <input
          type="radio"
          name="garden-care"
          value={choice.value}
          bind:group={value}
        />
        <span aria-hidden="true">{choice.icon}</span>{choice.name}
      </label>
    {/each}
  </div>
</fieldset>

<style>
  fieldset {
    pointer-events: auto;
    border: 0;
    padding: 0;
    margin: 14px 0 0;
  }
  legend {
    font-size: 11px;
    color: #b6b9b5;
    padding: 0;
    margin-bottom: 6px;
  }
  .choices {
    display: flex;
    gap: 8px;
  }
  label {
    position: relative;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0 12px;
    min-height: 44px;
    border: 1px solid #fff8e729;
    border-radius: 3px;
    font-size: 12px;
    cursor: pointer;
    color: #b6b9b5;
  }
  label.selected {
    border-color: #ffd84d99;
    color: #ffe38b;
    background: #ffd84d0a;
  }
  label:focus-within {
    outline: 2px solid #ffd84d;
    outline-offset: 3px;
  }
  input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    inset: 0;
    margin: 0;
    cursor: pointer;
  }
</style>
