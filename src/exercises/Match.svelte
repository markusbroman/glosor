<script lang="ts">
  import { shuffle } from '../lib/random'
  import { speak } from '../lib/speech'
  import type { WordRef } from '../lib/types'
  import type { ExerciseProps } from './types'

  let { step, onAnswer }: ExerciseProps = $props()

  const group = step.group ?? [step.word]
  const left = shuffle(group)
  const right = shuffle(group)

  let selL = $state<string | null>(null)
  let selR = $state<string | null>(null)
  let matched = $state<string[]>([])
  let flash = $state<string[]>([])
  const missed = new Set<string>()

  function tap(side: 'L' | 'R', ref: WordRef) {
    if (matched.includes(ref.id) || flash.length) return
    if (side === 'R') speak(ref.word.en)
    if (side === 'L') selL = selL === ref.id ? null : ref.id
    else selR = selR === ref.id ? null : ref.id
    if (selL && selR) resolve()
  }

  function resolve() {
    const [l, r] = [selL!, selR!]
    selL = selR = null
    if (l === r) {
      matched.push(l)
      if (matched.length === group.length) {
        setTimeout(() => onAnswer(group.map((g) => ({ id: g.id, outcome: missed.has(g.id) ? 'wrong' : 'right' }))), 300)
      }
    } else {
      missed.add(l)
      flash = ['L' + l, 'R' + r]
      setTimeout(() => (flash = []), 600)
    }
  }
</script>

<section class="mt">
  <p class="prompt-label">Para ihop orden</p>
  <div class="cols">
    <div class="col">
      {#each left as ref (ref.id)}
        <button
          class="option"
          class:sel={selL === ref.id}
          class:is-right={matched.includes(ref.id)}
          class:is-wrong={flash.includes('L' + ref.id)}
          disabled={matched.includes(ref.id)}
          onclick={() => tap('L', ref)}>{ref.word.sv}</button
        >
      {/each}
    </div>
    <div class="col" lang="en">
      {#each right as ref (ref.id)}
        <button
          class="option"
          class:sel={selR === ref.id}
          class:is-right={matched.includes(ref.id)}
          class:is-wrong={flash.includes('R' + ref.id)}
          disabled={matched.includes(ref.id)}
          onclick={() => tap('R', ref)}>{ref.word.en}</button
        >
      {/each}
    </div>
  </div>
</section>

<style>
  .mt {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 12px;
  }
  .prompt-label {
    text-align: center;
  }
  .cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .option {
    min-height: 72px;
    font-size: 17px;
    text-align: center;
    padding: 10px;
    line-height: 1.3;
  }
  .option.sel {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .option.is-right {
    opacity: 0.55;
  }
</style>
