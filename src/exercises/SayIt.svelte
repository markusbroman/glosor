<script lang="ts">
  import Microphone from 'phosphor-svelte/lib/MicrophoneIcon'
  import Eye from 'phosphor-svelte/lib/EyeIcon'
  import { canRecognize, listen, speak } from '../lib/speech'
  import { checkAnswer } from '../lib/text'
  import Prompt from './Prompt.svelte'
  import type { ExerciseProps } from './types'

  let { step, onAnswer }: ExerciseProps = $props()

  const ref = step.word
  const target = ref.word.en
  const MAX_TRIES = 2

  let mic = $state(canRecognize)
  let listening = $state(false)
  let tries = $state(0)
  let heard = $state('')
  let revealed = $state(false)
  let done = $state(false)

  async function record() {
    if (listening || done) return
    listening = true
    heard = ''
    try {
      const alts = await listen()
      tries++
      heard = alts[0] ?? ''
      if (alts.some((a) => checkAnswer(a, target) !== 'wrong')) finish(true)
      else if (tries >= MAX_TRIES) finish(false)
    } catch (e) {
      // Ingen mikrofon eller nekad behörighet: byt till att säga högt och jämföra själv.
      if ((e as Error).message !== 'no-speech') mic = false
    } finally {
      listening = false
    }
  }

  function reveal() {
    revealed = true
    speak(target)
  }

  function finish(right: boolean) {
    if (done) return
    done = true
    if (right) speak(target)
    onAnswer([{ id: ref.id, outcome: right ? 'right' : 'wrong' }])
  }
</script>

<Prompt label="Säg det högt på engelska" word={ref.word}>
  <p class="big-word">{ref.word.sv}</p>
</Prompt>

<div class="say">
  {#if mic}
    <button class="mic" class:on={listening} onclick={record} disabled={done} aria-label="Tryck och säg ordet">
      <Microphone size={44} weight={listening ? 'fill' : 'duotone'} />
    </button>
    <p class="status">
      {#if listening}Jag lyssnar …
      {:else if heard && !done}Jag hörde "<span lang="en">{heard}</span>". Försök igen!
      {:else if !done}Tryck och säg ordet{/if}
    </p>
    {#if !done && !listening}
      <button class="btn ghost" onclick={() => (mic = false)}>Säg det utan mikrofon</button>
    {/if}
  {:else if !revealed}
    <p class="status">Säg ordet högt för dig själv. Tryck sedan för att höra om det var rätt.</p>
    <button class="btn primary block" onclick={reveal}><Eye size={22} /> Visa och lyssna</button>
  {:else}
    <p class="big-word" lang="en">{target}</p>
    <p class="status">Sa du samma sak?</p>
    <div class="row">
      <button class="btn block" onclick={() => finish(false)} disabled={done}>Inte riktigt</button>
      <button class="btn primary block" onclick={() => finish(true)} disabled={done}>Ja, rätt</button>
    </div>
  {/if}
</div>

<style>
  .say {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: auto;
    text-align: center;
  }
  .mic {
    width: 112px;
    height: 112px;
    border-radius: 50%;
    border: 0;
    background: var(--accent);
    color: var(--accent-ink);
    display: grid;
    place-items: center;
    box-shadow: var(--shadow);
  }
  .mic.on {
    animation: pulse 1.2s infinite;
  }
  @keyframes pulse {
    50% {
      box-shadow: 0 0 0 16px var(--accent-soft);
    }
  }
  .status {
    color: var(--mute);
    min-height: 28px;
    max-width: 32ch;
  }
  .row {
    display: flex;
    gap: 10px;
    width: 100%;
  }
</style>
