<script lang="ts">
  import ArrowLeft from 'phosphor-svelte/lib/ArrowLeftIcon'

  let { title, onBack }: { title: string; onBack: () => void } = $props()
</script>

<header>
  <button class="icon-btn" onclick={onBack} aria-label="Tillbaka"><ArrowLeft size={24} weight="bold" /></button>
  <h1>{title}</h1>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0 0 16px -8px;
  }
  h1 {
    font-size: 24px;
  }
</style>
