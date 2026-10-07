<script lang="ts">
  import SpeakerHigh from 'phosphor-svelte/lib/SpeakerHighIcon'
  import { canSpeak, speak } from '../lib/speech'

  let { text, slow = false, large = false }: { text: string; slow?: boolean; large?: boolean } = $props()
</script>

{#if canSpeak}
  <span class="row">
    <button class="sb" class:large type="button" onclick={() => speak(text)} aria-label="Lyssna">
      <SpeakerHigh size={large ? 36 : 22} weight="duotone" />
    </button>
    {#if slow}
      <button class="slow" type="button" onclick={() => speak(text, true)}>Långsamt</button>
    {/if}
  </span>
{/if}

<style>
  .row {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
  .sb {
    display: inline-grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1.5px solid var(--line);
    background: var(--surface);
    color: var(--accent);
  }
  .slow {
    min-height: 44px;
    padding: 0 14px;
    border-radius: 99px;
    border: 1.5px solid var(--line);
    background: var(--surface);
    color: var(--accent);
    font-size: 15px;
  }
  .sb.large {
    width: 88px;
    height: 88px;
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .sb:active {
    transform: scale(0.95);
  }
</style>
