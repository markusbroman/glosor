<script lang="ts">
  import type { Snippet } from 'svelte'
  import WordIcon from '../components/WordIcon.svelte'
  import type { Word } from '../lib/types'

  let { label, word, showIcon = true, children }: { label: string; word: Word; showIcon?: boolean; children: Snippet } = $props()
</script>

<section class="prompt">
  <p class="prompt-label">{label}</p>
  {#if showIcon}<WordIcon {word} size={36} />{/if}
  {@render children()}
</section>

<style>
  .prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 14px;
    padding: 20px 4px 28px;
    animation: in 0.25s var(--ease);
  }
  @keyframes in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }
</style>
