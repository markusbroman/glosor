<script lang="ts">
  import { onDestroy } from 'svelte'
  import X from 'phosphor-svelte/lib/XIcon'
  import Feedback from './Feedback.svelte'
  import Summary from './Summary.svelte'
  import Choice from '../exercises/Choice.svelte'
  import Context from '../exercises/Context.svelte'
  import Listen from '../exercises/Listen.svelte'
  import Cloze from '../exercises/Cloze.svelte'
  import Order from '../exercises/Order.svelte'
  import Tiles from '../exercises/Tiles.svelte'
  import TypeAnswer from '../exercises/TypeAnswer.svelte'
  import SayIt from '../exercises/SayIt.svelte'
  import Match from '../exercises/Match.svelte'
  import Memory from '../exercises/Memory.svelte'
  import type { Result } from '../exercises/types'
  import { markDay, record } from '../lib/progress'
  import { retryMode } from '../lib/scheduler'
  import { save, store } from '../lib/store.svelte'
  import type { Step, Week, WordRef } from '../lib/types'

  let {
    steps,
    daily,
    pool,
    week,
    today,
    onExit,
    onAgain,
  }: {
    steps: Step[]
    daily: boolean
    pool: WordRef[]
    week: Week | undefined
    today: string
    onExit: () => void
    onAgain: () => void
  } = $props()

  const RETRY_GAP = 3

  let queue = $state<Step[]>([...steps])
  let index = $state(0)
  let feedback = $state<{ kind: 'right' | 'wrong' | 'almost'; step: Step } | null>(null)
  let finished = $state(false)
  let results = $state<{ step: Step; outcome: Result['outcome'] }[]>([])
  let timer: ReturnType<typeof setTimeout> | undefined
  const retried = new Set<string>()

  const step = $derived(queue[index])
  const progress = $derived((index + (feedback ? 1 : 0)) / queue.length)

  onDestroy(() => clearTimeout(timer))

  function onAnswer(res: Result[], almost = false) {
    if (feedback) return
    if (step.mode !== 'memory') {
      for (const r of res) record(store.progress, r.id, r.outcome, today)
      save()
    }
    if (step.group) {
      // Gruppövningar avslutas alltid med "alla klara"; varje ord räknas för sig.
      for (const r of res) {
        const word = step.group.find((g) => g.id === r.id)
        if (word) results.push({ step: { ...step, word, group: undefined }, outcome: r.outcome })
      }
      feedback = { kind: 'right', step }
      timer = setTimeout(next, 1400)
      return
    }
    const wrong = res.some((r) => r.outcome === 'wrong')
    results.push({ step, outcome: wrong ? 'wrong' : 'right' })

    if (wrong && !retried.has(step.word.id)) {
      retried.add(step.word.id)
      const at = Math.min(index + 1 + RETRY_GAP, queue.length)
      queue.splice(at, 0, { mode: retryMode(step.word, step.mode), word: step.word, review: step.review, retry: true })
    }

    feedback = { kind: wrong ? (almost ? 'almost' : 'wrong') : 'right', step }
    if (!wrong) timer = setTimeout(next, 1000)
  }

  function next() {
    clearTimeout(timer)
    feedback = null
    if (index + 1 >= queue.length) {
      if (daily) {
        markDay(store.progress, today)
        save()
      }
      finished = true
    } else {
      index++
    }
  }

  const COMPONENTS = {
    'choice-sv': Choice,
    'choice-en': Choice,
    context: Context,
    listen: Listen,
    cloze: Cloze,
    order: Order,
    tiles: Tiles,
    type: TypeAnswer,
    dictation: TypeAnswer,
    say: SayIt,
    match: Match,
    memory: Memory,
  } as const
  const Exercise = $derived(COMPONENTS[step.mode])
</script>

{#if finished}
  <Summary {results} {daily} {week} {today} {onExit} {onAgain} />
{:else}
  <div class="top">
    <button class="icon-btn" onclick={onExit} aria-label="Avsluta passet">
      <X size={24} weight="bold" />
    </button>
    <div class="trail" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress * 100)}>
      <i style:width="{progress * 100}%"></i>
    </div>
    <span class="count">{#if queue.length > 1}{Math.min(index + 1, queue.length)}/{queue.length}{/if}</span>
  </div>

  {#if step.review}
    <p class="tag">Repetition från {step.word.week.title}</p>
  {:else if step.retry}
    <p class="tag">Ett ord till</p>
  {/if}

  <div class="stage">
    {#key index}
      <Exercise {step} {pool} {onAnswer} />
    {/key}
  </div>

  {#if feedback}
    <Feedback kind={feedback.kind} step={feedback.step} onNext={next} />
  {/if}
{/if}

<style>
  .top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 -8px 8px;
  }
  .trail {
    flex: 1;
    height: 12px;
    border-radius: 99px;
    background: var(--line);
    overflow: hidden;
  }
  .trail i {
    display: block;
    height: 100%;
    border-radius: 99px;
    background: var(--good);
    transition: width 0.5s var(--ease);
  }
  .count {
    min-width: 48px;
    text-align: right;
    font-size: 15px;
    color: var(--mute);
    font-variant-numeric: tabular-nums;
    padding-right: 8px;
  }
  .tag {
    align-self: flex-start;
    font-size: 14px;
    color: var(--accent);
    background: var(--accent-soft);
    padding: 4px 12px;
    border-radius: 99px;
    margin-bottom: 4px;
  }
  .stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-bottom: 180px;
  }
</style>
