<script lang="ts">
  import CheckCircle from 'phosphor-svelte/lib/CheckCircleIcon'
  import XCircle from 'phosphor-svelte/lib/XCircleIcon'

  let {
    options,
    correct,
    onPick,
    lang = 'sv',
  }: {
    options: { key: string; label: string }[]
    correct: string
    onPick: (right: boolean) => void
    lang?: string
  } = $props()

  let picked = $state<string | null>(null)

  function choose(key: string) {
    if (picked) return
    picked = key
    onPick(key === correct)
  }
</script>

<div class="opts" {lang}>
  {#each options as o (o.key)}
    {@const right = picked && o.key === correct}
    {@const wrong = picked === o.key && o.key !== correct}
    <button class="option" class:is-right={right} class:is-wrong={wrong} disabled={!!picked} onclick={() => choose(o.key)}>
      <span>{o.label}</span>
      {#if right}<CheckCircle size={24} weight="fill" color="var(--good)" />{/if}
      {#if wrong}<XCircle size={24} weight="fill" color="var(--bad)" />{/if}
    </button>
  {/each}
</div>

<style>
  .opts {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: auto;
  }
  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
</style>
