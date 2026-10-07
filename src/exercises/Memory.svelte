<script lang="ts">
  import Sparkle from 'phosphor-svelte/lib/SparkleIcon'
  import { shuffle } from '../lib/random'
  import { speak } from '../lib/speech'
  import type { ExerciseProps } from './types'

  let { step, onAnswer }: ExerciseProps = $props()

  const group = step.group ?? [step.word]
  const cards = shuffle(group.flatMap((r) => [{ key: r.id + ':sv', id: r.id, text: r.word.sv, en: false }, { key: r.id + ':en', id: r.id, text: r.word.en, en: true }]))

  let open = $state<string[]>([])
  let found = $state<string[]>([])
  let moves = $state(0)

  function flip(c: (typeof cards)[number]) {
    if (open.length === 2 || open.includes(c.key) || found.includes(c.id)) return
    if (c.en) speak(c.text)
    open.push(c.key)
    if (open.length < 2) return
    moves++
    const [a, b] = open.map((k) => cards.find((x) => x.key === k)!)
    if (a.id === b.id) {
      found.push(a.id)
      open = []
      if (found.length === group.length) setTimeout(() => onAnswer(group.map((g) => ({ id: g.id, outcome: 'right' }))), 500)
    } else {
      setTimeout(() => (open = []), 1100)
    }
  }
</script>

<section class="mem">
  <p class="prompt-label">Hitta paren · {moves} drag</p>
  <div class="grid">
    {#each cards as c (c.key)}
      {@const up = open.includes(c.key) || found.includes(c.id)}
      <button class="mc" class:up class:found={found.includes(c.id)} onclick={() => flip(c)} aria-label={up ? c.text : 'Dolt kort'}>
        <span class="inner">
          <span class="face back"><Sparkle size={26} weight="duotone" /></span>
          <span class="face front" lang={c.en ? 'en' : 'sv'} class:en={c.en}>{c.text}</span>
        </span>
      </button>
    {/each}
  </div>
</section>

<style>
  .mem {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 12px;
  }
  .prompt-label {
    text-align: center;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .mc {
    aspect-ratio: 1 / 1.05;
    border: 0;
    padding: 0;
    background: none;
    perspective: 600px;
  }
  .inner {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    transition: transform 0.35s var(--ease);
    transform-style: preserve-3d;
  }
  .up .inner {
    transform: rotateY(180deg);
  }
  .face {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 8px;
    border-radius: var(--radius-sm);
    backface-visibility: hidden;
    font-size: 15px;
    line-height: 1.25;
    text-align: center;
    overflow-wrap: anywhere;
  }
  .back {
    background: var(--accent);
    color: var(--accent-ink);
  }
  .front {
    transform: rotateY(180deg);
    background: var(--surface);
    border: 1.5px solid var(--line);
  }
  .front.en {
    font-weight: 600;
  }
  .found .front {
    background: var(--good-soft);
    border-color: var(--good);
  }
</style>
