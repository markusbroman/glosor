<script lang="ts">
  import { onMount } from 'svelte'
  import SpeakButton from '../components/SpeakButton.svelte'
  import { withDistractors } from '../lib/options'
  import { speak } from '../lib/speech'
  import Options from './Options.svelte'
  import Prompt from './Prompt.svelte'
  import type { ExerciseProps } from './types'

  let { step, pool, onAnswer }: ExerciseProps = $props()

  const ref = step.word
  const toEnglish = step.mode === 'choice-sv'
  const options = withDistractors(ref, pool).map((r) => ({ key: r.id, label: toEnglish ? r.word.en : r.word.sv }))

  onMount(() => {
    if (!toEnglish) speak(ref.word.en)
  })

  function pick(right: boolean) {
    if (right) speak(ref.word.en)
    onAnswer([{ id: ref.id, outcome: right ? 'right' : 'wrong' }])
  }
</script>

{#if toEnglish}
  <Prompt label="Vad heter det på engelska?" word={ref.word}>
    <p class="big-word">{ref.word.sv}</p>
  </Prompt>
{:else}
  <Prompt label="Vad betyder det?" word={ref.word}>
    <p class="big-word" lang="en">{ref.word.en}</p>
    <SpeakButton text={ref.word.en} />
  </Prompt>
{/if}
<Options {options} correct={ref.id} onPick={pick} lang={toEnglish ? 'en' : 'sv'} />
