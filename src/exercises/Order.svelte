<script lang="ts">
  import ArrowCounterClockwise from 'phosphor-svelte/lib/ArrowCounterClockwiseIcon'
  import { scramble } from '../lib/random'
  import { speak } from '../lib/speech'
  import { normalize, words } from '../lib/text'
  import type { ExerciseProps } from './types'

  let { step, onAnswer }: ExerciseProps = $props()

  const ref = step.word
  const ex = ref.word.example!
  const tokens = words(ex.en)
  const order = scramble(tokens)

  let placed = $state<number[]>([])
  let status = $state<'play' | 'right' | 'wrong'>('play')

  function add(i: number) {
    if (status !== 'play') return
    placed.push(i)
    if (placed.length === tokens.length) check()
  }

  function remove(i: number) {
    if (status === 'play') placed = placed.filter((x) => x !== i)
  }

  function check() {
    const right = normalize(placed.map((i) => tokens[i]).join(' ')) === normalize(ex.en)
    status = right ? 'right' : 'wrong'
    if (right) speak(ex.en)
    onAnswer([{ id: ref.id, outcome: right ? 'right' : 'wrong' }])
  }
</script>

<section class="ord">
  <p class="prompt-label">Lägg orden i rätt ordning</p>
  <p class="sv">{ex.sv}</p>

  <div class="card built {status}" lang="en">
    {#each placed as i (i)}
      <button class="chip" onclick={() => remove(i)}>{tokens[i]}</button>
    {:else}
      <span class="placeholder">Tryck på orden nedanför</span>
    {/each}
  </div>

  <div class="pool" lang="en">
    {#each order as i (i)}
      <button class="chip" disabled={placed.includes(i)} onclick={() => add(i)}>{tokens[i]}</button>
    {/each}
  </div>

  <button class="btn ghost reset" onclick={() => (placed = [])} disabled={!placed.length || status !== 'play'}>
    <ArrowCounterClockwise size={20} /> Börja om
  </button>
</section>

<style>
  .ord {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 12px;
    flex: 1;
  }
  .sv {
    font-size: 21px;
    text-align: center;
  }
  .built {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 112px;
    padding: 14px;
    align-content: flex-start;
    box-shadow: none;
  }
  .built.right {
    border-color: var(--good);
    background: var(--good-soft);
  }
  .built.wrong {
    border-color: var(--bad);
    background: var(--bad-soft);
  }
  .placeholder {
    color: var(--mute);
    font-size: 15px;
    margin: auto;
  }
  .pool {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: auto;
  }
  .chip {
    min-height: 48px;
    padding: 8px 14px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--line);
    border-bottom-width: 4px;
    background: var(--surface);
    font-size: 19px;
  }
  .chip:disabled {
    opacity: 0.2;
  }
  .reset {
    align-self: center;
  }
</style>
