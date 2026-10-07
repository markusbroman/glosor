<script lang="ts">
  import { prettyDate } from '../lib/dates'
  import { boxOf } from '../lib/progress'
  import { store } from '../lib/store.svelte'
  import type { Week } from '../lib/types'
  import { refsFor } from '../lib/weeks'
  import BackHeader from './BackHeader.svelte'
  import BoxMeter from './BoxMeter.svelte'
  import SpeakButton from './SpeakButton.svelte'
  import WordIcon from './WordIcon.svelte'

  let { weeks, week, onBack }: { weeks: Week[]; week: Week | undefined; onBack: () => void } = $props()

  const ordered = [...weeks].sort((a, b) => (a === week ? -1 : b === week ? 1 : b.due.localeCompare(a.due)))
  let open = $state<string | null>(null)
</script>

<BackHeader title="Mina ord" {onBack} />

{#each ordered as w}
  <h2>{w.title} <span>· {prettyDate(w.due)}{w === week ? ' · denna vecka' : ''}</span></h2>
  <ul class="card">
    {#each refsFor(w) as ref (ref.id)}
      <li>
        <button class="row" onclick={() => (open = open === ref.id ? null : ref.id)} aria-expanded={open === ref.id}>
          <WordIcon word={ref.word} size={22} />
          <span class="txt">
            <span class="en" lang="en">{ref.word.en}</span>
            <span class="sv">{ref.word.sv}</span>
          </span>
          <BoxMeter box={boxOf(store.progress, ref.id)} />
        </button>
        {#if open === ref.id}
          <div class="more">
            {#if ref.word.example}
              <p lang="en">{ref.word.example.en}</p>
              <p class="sv">{ref.word.example.sv}</p>
            {/if}
            <SpeakButton text={ref.word.example?.en ?? ref.word.en} slow />
          </div>
        {/if}
      </li>
    {/each}
  </ul>
{/each}

<style>
  h2 {
    font-size: 17px;
    margin: 20px 4px 8px;
  }
  h2 span {
    color: var(--mute);
    font-weight: 400;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0 4px;
    box-shadow: none;
  }
  li + li {
    border-top: 1px solid var(--line);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px;
    border: 0;
    background: none;
    text-align: left;
  }
  .txt {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .en {
    font-weight: 600;
  }
  .sv {
    font-size: 15px;
    color: var(--mute);
  }
  .more {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 0 12px 14px 12px;
  }
</style>
