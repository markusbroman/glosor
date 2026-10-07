<script lang="ts">
  import { onMount } from 'svelte'
  import confetti from 'canvas-confetti'
  import ArrowCounterClockwise from 'phosphor-svelte/lib/ArrowCounterClockwiseIcon'
  import House from 'phosphor-svelte/lib/HouseIcon'
  import Trophy from 'phosphor-svelte/lib/TrophyIcon'
  import { untilText } from '../lib/dates'
  import type { Outcome, Step, Week } from '../lib/types'
  import SpeakButton from './SpeakButton.svelte'

  let {
    results,
    daily,
    week,
    today,
    onExit,
    onAgain,
  }: {
    results: { step: Step; outcome: Outcome }[]
    daily: boolean
    week: Week | undefined
    today: string
    onExit: () => void
    onAgain: () => void
  } = $props()

  const firstTry = results.filter((r) => !r.step.retry)
  const right = firstTry.filter((r) => r.outcome === 'right').length
  const practise = [...new Map(results.filter((r) => r.outcome === 'wrong').map((r) => [r.step.word.id, r.step.word])).values()]

  const share = firstTry.length ? right / firstTry.length : 1
  const title = share >= 0.9 ? 'Grymt pass!' : share >= 0.6 ? 'Bra kämpat!' : 'Bra att du övade!'
  const line =
    share >= 0.9
      ? 'Du kan de här orden riktigt bra.'
      : share >= 0.6
        ? 'Varje gång du övar sitter orden lite bättre.'
        : 'Svåra ord blir lättare för varje pass. Orden nedan kommer tillbaka nästa gång.'

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.35 }, disableForReducedMotion: true, colors: ['#4352d0', '#1a8a5e', '#ffd166', '#ef8354'] })
  })
</script>

<section class="sum">
  <span class="trophy"><Trophy size={56} weight="duotone" /></span>
  <h1>{title}</h1>
  <p class="line">{line}</p>

  <div class="stats">
    <div class="card stat">
      <span class="n">{right}<small>/{firstTry.length}</small></span>
      <span class="l">rätt direkt</span>
    </div>
    {#if week}
      <div class="card stat">
        <span class="n small">{untilText(today, week.due)}</span>
        <span class="l">{week.title}</span>
      </div>
    {/if}
  </div>

  {#if practise.length}
    <h2>Öva lite extra på</h2>
    <ul class="card list">
      {#each practise as ref}
        <li>
          <div>
            <p class="en">{ref.word.en}</p>
            <p class="sv">{ref.word.sv}</p>
          </div>
          <SpeakButton text={ref.word.en} />
        </li>
      {/each}
    </ul>
  {/if}

  {#if daily}
    <p class="rest">Klart för idag. En kort paus innan nästa pass hjälper hjärnan att spara orden.</p>
  {/if}

  <div class="actions">
    <button class="btn primary block" onclick={onExit}><House size={22} weight="duotone" /> Till start</button>
    {#if daily}
      <button class="btn block" onclick={onAgain}><ArrowCounterClockwise size={22} /> Ett pass till</button>
    {/if}
  </div>
</section>

<style>
  .sum {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-top: 24px;
  }
  .trophy {
    display: grid;
    place-items: center;
    width: 104px;
    height: 104px;
    border-radius: 50%;
    background: var(--warn-soft);
    color: var(--warn);
    margin-bottom: 16px;
  }
  h1 {
    font-size: 30px;
  }
  .line {
    color: var(--mute);
    margin-top: 6px;
    max-width: 34ch;
  }
  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;
    margin-top: 24px;
  }
  .stat {
    display: flex;
    flex-direction: column;
    padding: 16px;
    box-shadow: none;
  }
  .n {
    font-size: 30px;
    font-weight: 600;
  }
  .n.small {
    font-size: 18px;
    line-height: 1.3;
    min-height: 45px;
    display: grid;
    place-items: center;
  }
  .n small {
    font-size: 16px;
    color: var(--mute);
  }
  .l {
    font-size: 14px;
    color: var(--mute);
  }
  h2 {
    align-self: flex-start;
    margin: 28px 4px 10px;
    font-size: 18px;
  }
  .list {
    list-style: none;
    margin: 0;
    padding: 4px 16px;
    width: 100%;
    text-align: left;
    box-shadow: none;
  }
  .list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
  }
  .list li + li {
    border-top: 1px solid var(--line);
  }
  .en {
    font-weight: 600;
  }
  .sv {
    font-size: 15px;
    color: var(--mute);
  }
  .rest {
    margin-top: 24px;
    color: var(--mute);
    font-size: 15px;
    max-width: 36ch;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    margin-top: 24px;
  }
</style>
