<script lang="ts">
  import { onMount } from 'svelte'
  import ArrowRight from 'phosphor-svelte/lib/ArrowRightIcon'
  import CheckCircle from 'phosphor-svelte/lib/CheckCircleIcon'
  import Lightbulb from 'phosphor-svelte/lib/LightbulbIcon'
  import { pick } from '../lib/random'
  import { speak } from '../lib/speech'
  import type { Step } from '../lib/types'
  import SpeakButton from './SpeakButton.svelte'

  let { kind, step, onNext }: { kind: 'right' | 'wrong' | 'almost'; step: Step; onNext: () => void } = $props()

  const PRAISE = ['Rätt!', 'Snyggt!', 'Precis!', 'Klockrent!', 'Helt rätt!']
  const praise = pick(PRAISE)
  const w = $derived(step.word.word)
  let button: HTMLButtonElement | undefined = $state()

  onMount(() => {
    if (kind !== 'right') {
      speak(w.en)
      button?.focus()
    }
  })
</script>

<div class="fb {kind}" role="status">
  {#if kind === 'right'}
    <p class="head"><CheckCircle size={28} weight="fill" /> {step.group ? 'Alla klara!' : praise}</p>
  {:else}
    <p class="head"><Lightbulb size={26} weight="duotone" /> {kind === 'almost' ? 'Nästan! Kolla stavningen' : 'Så här är det'}</p>
    <div class="answer">
      <div>
        <p class="en">{w.en}</p>
        <p class="sv">{w.sv}</p>
      </div>
      <SpeakButton text={w.en} />
    </div>
    {#if w.example}
      <p class="ex">{w.example.en}</p>
    {/if}
    <p class="soon">Ordet kommer tillbaka strax.</p>
    <button class="btn primary block" bind:this={button} onclick={onNext}>
      Fortsätt <ArrowRight size={20} weight="bold" />
    </button>
  {/if}
</div>

<style>
  .fb {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 18px max(16px, calc((100vw - 528px) / 2)) max(20px, env(safe-area-inset-bottom));
    border-top: 1px solid var(--line);
    animation: up 0.22s var(--ease);
  }
  @keyframes up {
    from {
      transform: translateY(24px);
      opacity: 0;
    }
  }
  .right {
    background: var(--good-soft);
    color: var(--good);
  }
  .wrong,
  .almost {
    background: var(--surface);
    box-shadow: 0 -8px 24px rgb(0 0 0 / 0.08);
  }
  .almost .head {
    color: var(--warn);
  }
  .wrong .head {
    color: var(--accent);
  }
  .head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 600;
  }
  .answer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 10px 0 6px;
  }
  .en {
    font-size: 24px;
    font-weight: 600;
  }
  .sv {
    color: var(--mute);
  }
  .ex {
    font-style: italic;
    color: var(--mute);
    margin-bottom: 6px;
  }
  .soon {
    font-size: 14px;
    color: var(--mute);
    margin-bottom: 12px;
  }
</style>
