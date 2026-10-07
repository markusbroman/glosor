<script lang="ts">
  import icons from 'virtual:word-icons'
  import type { Word } from '../lib/types'

  let { word, size = 40 }: { word: Word; size?: number } = $props()
  const Icon = $derived(word.icon ? icons[word.icon] : undefined)
</script>

{#if Icon}
  <span class="wi" style:--s="{size * 1.6}px" aria-hidden="true">
    <Icon {size} weight="duotone" />
  </span>
{/if}

<style>
  .wi {
    display: inline-grid;
    place-items: center;
    width: var(--s);
    height: var(--s);
    border-radius: 30%;
    background: var(--accent-soft);
    color: var(--accent);
    flex: none;
  }
</style>
