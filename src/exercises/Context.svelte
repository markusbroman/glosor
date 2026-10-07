<script lang="ts">
  import { onMount } from 'svelte'
  import Translate from 'phosphor-svelte/lib/TranslateIcon'
  import SpeakButton from '../components/SpeakButton.svelte'
  import WordIcon from '../components/WordIcon.svelte'
  import { withDistractors } from '../lib/options'
  import { speak } from '../lib/speech'
  import { makeCloze } from '../lib/text'
  import Options from './Options.svelte'
  import type { ExerciseProps } from './types'

  let { step, pool, onAnswer }: ExerciseProps = $props()

  const ref = step.word
  const ex = ref.word.example!
  const parts = makeCloze(ex.en, ref.word.en)
  const options = withDistractors(ref, pool).map((r) => ({ key: r.id, label: r.word.sv }))
  let showSv = $state(false)

  onMount(() => setTimeout(() => speak(ex.en), 250))
</script>

<section class="ctx">
  <p class="prompt-label">Ordet i en mening</p>
  <div class="card sentence">
    <WordIcon word={ref.word} size={28} />
    <p class="en" lang="en">
      {#if parts}{parts.before}<span class="mark">{parts.answer}</span>{parts.after}{:else}{ex.en}{/if}
    </p>
    <div class="tools">
      <SpeakButton text={ex.en} slow />
      <button class="btn ghost sv-toggle" onclick={() => (showSv = !showSv)} aria-pressed={showSv}>
        <Translate size={20} /> {showSv ? 'Dölj' : 'På svenska'}
      </button>
    </div>
    {#if showSv}<p class="sv">{ex.sv}</p>{/if}
  </div>
  <p class="q">Vad betyder <strong lang="en">{ref.word.en}</strong>?</p>
</section>
<Options {options} correct={ref.id} onPick={(right) => onAnswer([{ id: ref.id, outcome: right ? 'right' : 'wrong' }])} />

<style>
  .ctx {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 12px 0 24px;
  }
  .sentence {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 20px;
    box-shadow: none;
  }
  .en {
    font-size: 23px;
    line-height: 1.45;
  }
  .tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .sv-toggle {
    white-space: nowrap;
    min-height: 44px;
    padding: 8px 12px;
    font-size: 15px;
  }
  .sv {
    color: var(--mute);
    border-top: 1px dashed var(--line);
    padding-top: 12px;
  }
  .q {
    font-size: 19px;
    text-align: center;
  }
</style>
