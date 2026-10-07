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
  const options = withDistractors(ref, pool).map((r) => ({ key: r.id, label: r.word.sv }))

  onMount(() => setTimeout(() => speak(ref.word.en), 250))
</script>

<Prompt label="Lyssna. Vad betyder det?" word={ref.word} showIcon={false}>
  <SpeakButton text={ref.word.en} large slow />
  <p class="hint">Tryck på högtalaren för att höra ordet igen.</p>
</Prompt>
<Options {options} correct={ref.id} onPick={(right) => onAnswer([{ id: ref.id, outcome: right ? 'right' : 'wrong' }])} />

<style>
  .hint {
    font-size: 15px;
    color: var(--mute);
    max-width: 30ch;
  }
</style>
