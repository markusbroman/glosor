<script lang="ts">
  import ArrowUUpLeft from 'phosphor-svelte/lib/ArrowUUpLeftIcon'
  import { scramble } from '../lib/random'
  import { speak } from '../lib/speech'
  import { normalize } from '../lib/text'
  import Prompt from './Prompt.svelte'
  import type { ExerciseProps } from './types'

  let { step, onAnswer }: ExerciseProps = $props()

  const ref = step.word
  const target = ref.word.en
  // Långa fraser byggs med ord istället för bokstäver, så det inte blir pilligt.
  const byWord = target.split(' ').length >= 3
  const units = byWord ? target.split(' ') : [...target.replace(/ /g, '')]
  const order = scramble(units)

  let placed = $state<number[]>([])
  let status = $state<'play' | 'right' | 'wrong'>('play')

  const built = $derived(placed.map((i) => units[i]))
  /** Bokstavsläge: en grupp platser per ord, så ett ord aldrig bryts över två rader. */
  const groups = $derived.by(() => {
    let k = 0
    return target.split(' ').map((part) => [...part].map(() => built[k++] ?? ''))
  })

  function add(i: number) {
    if (status !== 'play' || placed.includes(i)) return
    placed.push(i)
    if (placed.length === units.length) check()
  }

  function undo() {
    if (status === 'play') placed.pop()
  }

  function check() {
    const right = normalize(built.join(byWord ? ' ' : '')) === normalize(units.join(byWord ? ' ' : ''))
    status = right ? 'right' : 'wrong'
    if (right) speak(target)
    onAnswer([{ id: ref.id, outcome: right ? 'right' : 'wrong' }])
  }
</script>

<Prompt label="Bygg ordet på engelska" word={ref.word}>
  <p class="big-word">{ref.word.sv}</p>
</Prompt>

<div class="answer {status}" lang="en">
  {#if byWord}
    <div class="chips">
      {#each units as _, k}
        <span class="chip" class:empty={!built[k]}>{built[k] ?? ''}</span>
      {/each}
    </div>
  {:else}
    <div class="slots">
      {#each groups as g}
        <span class="group">
          {#each g as s}<span class="slot" class:filled={s}>{s}</span>{/each}
        </span>
      {/each}
    </div>
  {/if}
</div>

<div class="tiles" lang="en">
  {#each order as i}
    <button class="tile" class:word={byWord} disabled={placed.includes(i) || status !== 'play'} onclick={() => add(i)}>{units[i]}</button>
  {/each}
</div>

<button class="btn ghost undo" onclick={undo} disabled={!placed.length || status !== 'play'}>
  <ArrowUUpLeft size={20} /> Ångra
</button>

<style>
  .answer {
    min-height: 64px;
    margin-bottom: 20px;
  }
  .slots,
  .chips,
  .tiles {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }
  .slot {
    display: grid;
    place-items: center;
    width: 30px;
    height: 44px;
    border-bottom: 3px solid var(--line);
    font-size: 26px;
    font-weight: 600;
  }
  .slot.filled {
    border-color: var(--accent);
  }
  .slots {
    column-gap: 18px;
    row-gap: 8px;
  }
  .group {
    display: flex;
    gap: 5px;
  }
  .chip {
    min-width: 64px;
    min-height: 44px;
    padding: 8px 12px;
    border-bottom: 3px solid var(--accent);
    font-size: 20px;
    font-weight: 500;
  }
  .chip.empty {
    border-color: var(--line);
  }
  .right .slot,
  .right .chip {
    color: var(--good);
    border-color: var(--good);
  }
  .wrong .slot,
  .wrong .chip {
    color: var(--bad);
    border-color: var(--bad);
  }
  .tiles {
    gap: 10px;
    margin-top: auto;
  }
  .tile {
    min-width: 52px;
    height: 56px;
    padding: 0 12px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--line);
    border-bottom-width: 4px;
    background: var(--surface);
    font-size: 24px;
    font-weight: 600;
    transition: transform 0.1s;
  }
  .tile.word {
    font-size: 19px;
    font-weight: 500;
  }
  .tile:active:not(:disabled) {
    transform: translateY(2px);
  }
  .tile:disabled {
    opacity: 0.2;
  }
  .undo {
    align-self: center;
    margin-top: 12px;
  }
</style>
