<script lang="ts">
  import { withDistractors } from '../lib/options'
  import { speak } from '../lib/speech'
  import { makeCloze } from '../lib/text'
  import Options from './Options.svelte'
  import type { ExerciseProps } from './types'

  let { step, pool, onAnswer }: ExerciseProps = $props()

  const ref = step.word
  const ex = ref.word.example!
  const parts = makeCloze(ex.en, ref.word.en)!
  const options = withDistractors(ref, pool).map((r) => ({ key: r.id, label: r.word.en }))
  let filled = $state(false)

  function pick(right: boolean) {
    filled = true
    if (right) speak(ex.en)
    onAnswer([{ id: ref.id, outcome: right ? 'right' : 'wrong' }])
  }
</script>

<section class="cz">
  <p class="prompt-label">Vilket ord saknas?</p>
  <div class="card sentence">
    <p class="en" lang="en">
      {parts.before}{#if filled}<span class="mark">{parts.answer}</span>{:else}<span class="gap" aria-label="lucka"></span>{/if}{parts.after}
    </p>
    <p class="sv">{ex.sv}</p>
  </div>
</section>
<Options {options} correct={ref.id} onPick={pick} lang="en" />

<style>
  .cz {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 12px 0 24px;
  }
  .sentence {
    padding: 22px 20px;
    box-shadow: none;
  }
  .en {
    font-size: 23px;
    line-height: 1.6;
  }
  .gap {
    display: inline-block;
    width: 4.5em;
    border-bottom: 3px solid var(--accent);
    margin: 0 4px;
    vertical-align: -2px;
  }
  .sv {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed var(--line);
    color: var(--mute);
  }
</style>
