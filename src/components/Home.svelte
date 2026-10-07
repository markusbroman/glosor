<script lang="ts">
  import ArrowRight from 'phosphor-svelte/lib/ArrowRightIcon'
  import BookOpenText from 'phosphor-svelte/lib/BookOpenTextIcon'
  import Cards from 'phosphor-svelte/lib/CardsIcon'
  import CheckCircle from 'phosphor-svelte/lib/CheckCircleIcon'
  import Ear from 'phosphor-svelte/lib/EarIcon'
  import GearSix from 'phosphor-svelte/lib/GearSixIcon'
  import LinkSimple from 'phosphor-svelte/lib/LinkSimpleIcon'
  import Microphone from 'phosphor-svelte/lib/MicrophoneIcon'
  import PuzzlePiece from 'phosphor-svelte/lib/PuzzlePieceIcon'
  import TextAa from 'phosphor-svelte/lib/TextAaIcon'
  import { addDays, dayName, prettyDate, untilText } from '../lib/dates'
  import { KNOWN_BOX, boxOf } from '../lib/progress'
  import { canUse, isRehearsalDay } from '../lib/scheduler'
  import { store } from '../lib/store.svelte'
  import type { Mode, Week, WordRef } from '../lib/types'

  let {
    week,
    today,
    current,
    onDaily,
    onFree,
    onWords,
    onParent,
  }: {
    week: Week | undefined
    today: string
    current: WordRef[]
    onDaily: () => void
    onFree: (m: Mode) => void
    onWords: () => void
    onParent: () => void
  } = $props()

  const known = $derived(current.filter((r) => boxOf(store.progress, r.id) >= KNOWN_BOX).length)
  const doneToday = $derived(store.progress.days.includes(today))
  const rehearsal = $derived(week ? isRehearsalDay(today, week.due) : false)
  const days = $derived(week ? Array.from({ length: 7 }, (_, i) => addDays(week.due, i - 6)) : [])

  const R = 34
  const C = 2 * Math.PI * R
  // Ringen fylls för varje nivå ett ord klättrar, så framsteg syns redan första dagen.
  const share = $derived(
    current.length ? current.reduce((sum, r) => sum + Math.min(boxOf(store.progress, r.id), KNOWN_BOX), 0) / (KNOWN_BOX * current.length) : 0,
  )

  const free: { mode: Mode; label: string; icon: typeof Cards }[] = [
    { mode: 'memory', label: 'Memory', icon: Cards },
    { mode: 'match', label: 'Para ihop', icon: LinkSimple },
    { mode: 'tiles', label: 'Stava', icon: TextAa },
    { mode: 'listen', label: 'Lyssna', icon: Ear },
    { mode: 'order', label: 'Meningspussel', icon: PuzzlePiece },
    { mode: 'say', label: 'Säg det', icon: Microphone },
  ]
</script>

<header>
  <span class="brand">Glosor</span>
  <button class="icon-btn" onclick={onParent} aria-label="För vuxna">
    <GearSix size={24} weight="duotone" />
  </button>
</header>

{#if !week}
  <section class="card empty">
    <h1>Inga glosor än</h1>
    <p>Lägg till veckans ord så kan du börja öva.</p>
  </section>
{:else}
  <section class="card hero">
    <div class="hero-text">
      <h1>{week.title}</h1>
      <p class="due"><strong>{untilText(today, week.due)}</strong><span>{dayName(week.due)} {prettyDate(week.due)}</span></p>
      <ol class="days" aria-label="Dagar du övat den här veckan">
        {#each days as d}
          <li class:done={store.progress.days.includes(d)} class:today={d === today} class:test={d === week.due}>
            <span class="dot"></span>
            <span class="dn">{dayName(d)}</span>
          </li>
        {/each}
      </ol>
    </div>
    <div class="ring" role="img" aria-label="{known} av {current.length} ord sitter">
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={R} class="track" />
        <circle cx="40" cy="40" r={R} class="fill" stroke-dasharray={C} stroke-dashoffset={C * (1 - share)} />
      </svg>
      <span class="num">{known}<small>/{current.length}</small></span>
      <span class="cap">sitter</span>
    </div>
  </section>

  {#if doneToday}
    <p class="done-note"><CheckCircle size={22} weight="fill" /> Dagens pass är klart. Snyggt jobbat!</p>
  {/if}

  <button class="btn primary block start" onclick={onDaily}>
    <span class="start-text">
      <span class="start-title">{doneToday ? 'Ett pass till' : rehearsal ? 'Generalrepetition' : 'Dagens pass'}</span>
      <span class="start-sub">{rehearsal ? 'Skriv alla veckans ord' : 'Ca 12 frågor · 6–8 minuter'}</span>
    </span>
    <ArrowRight size={26} weight="bold" />
  </button>

  <h2 class="section">Fri träning</h2>
  <div class="free">
    {#each free as f}
      {@const n = f.mode === 'memory' || f.mode === 'match' ? current.length : current.filter((r) => canUse(f.mode, r)).length}
      <button class="card tile" onclick={() => onFree(f.mode)} disabled={n < (f.mode === 'memory' || f.mode === 'match' ? 3 : 1)}>
        <f.icon size={28} weight="duotone" />
        <span>{f.label}</span>
      </button>
    {/each}
  </div>

  <button class="btn block words" onclick={onWords}>
    <BookOpenText size={22} weight="duotone" /> Mina ord
  </button>
{/if}

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .brand {
    font-weight: 700;
    font-size: 22px;
    letter-spacing: -0.01em;
    color: var(--accent);
  }
  .empty {
    padding: 28px;
    text-align: center;
  }
  .hero {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 22px 20px;
  }
  .hero-text {
    flex: 1;
    min-width: 0;
  }
  h1 {
    font-size: 28px;
  }
  .due {
    display: flex;
    flex-direction: column;
    margin-top: 4px;
    color: var(--mute);
    line-height: 1.35;
  }
  .due strong {
    color: var(--ink);
    font-weight: 500;
  }
  .due strong::first-letter {
    text-transform: uppercase;
  }
  .days {
    list-style: none;
    padding: 0;
    margin: 16px 0 0;
    display: flex;
    gap: 6px;
  }
  .days li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--mute);
  }
  .dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid var(--line);
  }
  .days li.today .dot {
    border-color: var(--accent);
  }
  .days li.today .dn {
    color: var(--accent);
    font-weight: 600;
  }
  .days li.done .dot {
    background: var(--good);
    border-color: var(--good);
  }
  .days li.test .dot {
    border-radius: 4px;
    border-style: dashed;
  }
  .ring {
    position: relative;
    width: 92px;
    height: 92px;
    flex: none;
    display: grid;
    place-items: center;
  }
  .ring svg {
    position: absolute;
    inset: 0;
    transform: rotate(-90deg);
  }
  .ring circle {
    fill: none;
    stroke-width: 8;
  }
  .track {
    stroke: var(--line);
  }
  .fill {
    stroke: var(--good);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.8s var(--ease);
  }
  .num {
    font-size: 24px;
    font-weight: 600;
    margin-top: -10px;
  }
  .num small {
    font-size: 14px;
    color: var(--mute);
  }
  .cap {
    position: absolute;
    bottom: 24px;
    font-size: 12px;
    color: var(--mute);
  }
  .done-note {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 16px 4px 0;
    color: var(--good);
    font-weight: 500;
  }
  .start {
    margin-top: 16px;
    min-height: 84px;
    justify-content: space-between;
    padding: 18px 24px;
    border-radius: var(--radius);
    text-align: left;
  }
  .start-text {
    display: flex;
    flex-direction: column;
  }
  .start-title {
    font-size: 22px;
  }
  .start-sub {
    font-size: 15px;
    font-weight: 400;
    opacity: 0.85;
  }
  .section {
    margin: 28px 4px 12px;
    font-size: 15px;
    font-weight: 500;
    color: var(--mute);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .free {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 16px 6px;
    color: var(--accent);
    box-shadow: none;
  }
  .tile span {
    color: var(--ink);
    font-size: 14px;
  }
  .tile:active {
    transform: scale(0.97);
  }
  .tile:disabled {
    opacity: 0.4;
  }
  .words {
    margin-top: 16px;
  }
</style>
