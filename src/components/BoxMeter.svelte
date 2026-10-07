<script lang="ts">
  import { MAX_BOX } from '../lib/progress'

  let { box }: { box: number } = $props()
</script>

<span class="bm" role="img" aria-label="Nivå {box} av {MAX_BOX}">
  {#each Array(MAX_BOX) as _, i}<i class:on={i < box}></i>{/each}
</span>

<style>
  .bm {
    display: inline-flex;
    gap: 3px;
  }
  i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--line);
  }
  i.on {
    background: var(--good);
  }
</style>
