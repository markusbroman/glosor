<script lang="ts">
  import { onMount } from 'svelte'
  import Lightbulb from 'phosphor-svelte/lib/LightbulbIcon'
  import SpeakButton from '../components/SpeakButton.svelte'
  import { speak } from '../lib/speech'
  import { checkAnswer } from '../lib/text'
  import Prompt from './Prompt.svelte'
  import type { ExerciseProps } from './types'

  let { step, onAnswer }: ExerciseProps = $props()

  const ref = step.word
  const target = ref.word.en
  const dictation = step.mode === 'dictation'
  let value = $state('')
  let hints = $state(0)
  let status = $state<'play' | 'right' | 'almost' | 'wrong'>('play')
  let input: HTMLInputElement | undefined = $state()

  const maxHints = Math.max(1, Math.floor(target.replace(/ /g, '').length / 2))
  const hintText = $derived(target.slice(0, hints))

  onMount(() => {
    input?.focus()
    if (dictation) setTimeout(() => speak(target), 250)
  })

  function hint() {
    hints = Math.min(maxHints, hints + 1)
    if (!value.toLowerCase().startsWith(hintText.toLowerCase())) value = hintText
    input?.focus()
  }

  function submit(e: Event) {
    e.preventDefault()
    if (status !== 'play' || !value.trim()) return
    const result = checkAnswer(value, target)
    status = result
    if (result === 'right') speak(target)
    onAnswer([{ id: ref.id, outcome: result === 'right' ? 'right' : 'wrong' }], result === 'almost')
  }
</script>

{#if dictation}
  <Prompt label="Skriv det du hör" word={ref.word} showIcon={false}>
    <SpeakButton text={target} large slow />
  </Prompt>
{:else}
  <Prompt label="Skriv på engelska" word={ref.word}>
    <p class="big-word">{ref.word.sv}</p>
  </Prompt>
{/if}

<form onsubmit={submit} class="form">
  <div class="pattern" aria-hidden="true">
    {#each target.split(' ') as part}
      <span class="part">{#each part as _}<i></i>{/each}</span>
    {/each}
  </div>
  <input
    bind:this={input}
    bind:value
    class="field {status}"
    lang="en"
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
    enterkeyhint="done"
    aria-label="Ditt svar"
    readonly={status !== 'play'}
  />
  <div class="row">
    <button type="button" class="btn ghost" onclick={hint} disabled={hints >= maxHints || status !== 'play'}>
      <Lightbulb size={20} weight="duotone" /> Ledtråd
    </button>
    <button type="submit" class="btn primary" disabled={!value.trim() || status !== 'play'}>Kolla</button>
  </div>
</form>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .pattern {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px;
  }
  .part {
    display: flex;
    gap: 3px;
  }
  .part i {
    width: 10px;
    height: 3px;
    border-radius: 2px;
    background: var(--line);
  }
  .field {
    width: 100%;
    min-height: 64px;
    padding: 12px 18px;
    border-radius: var(--radius-sm);
    border: 2px solid var(--line);
    background: var(--surface);
    font-size: 24px;
    text-align: center;
  }
  .field:focus {
    border-color: var(--accent);
    outline: none;
  }
  .field.right {
    border-color: var(--good);
    background: var(--good-soft);
  }
  .field.almost {
    border-color: var(--warn);
    background: var(--warn-soft);
  }
  .field.wrong {
    border-color: var(--bad);
    background: var(--bad-soft);
  }
  .row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }
  .row .primary {
    flex: 1;
    max-width: 220px;
  }
</style>
