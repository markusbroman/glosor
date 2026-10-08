<script lang="ts">
  import CaretDown from 'phosphor-svelte/lib/CaretDownIcon'
  import Copy from 'phosphor-svelte/lib/CopyIcon'
  import { prettyDate } from '../lib/dates'
  import { emptyProgress, exportCode, importCode } from '../lib/progress'
  import { replace, store } from '../lib/store.svelte'
  import type { Week } from '../lib/types'
  import { refsFor } from '../lib/weeks'
  import BackHeader from './BackHeader.svelte'
  import BoxMeter from './BoxMeter.svelte'

  let { weeks, week, onBack }: { weeks: Week[]; week: Week | undefined; onBack: () => void } = $props()

  let code = $state('')
  let message = $state('')
  let confirmReset = $state(false)

  const ordered = [...weeks].sort((a, b) => b.due.localeCompare(a.due))
  const stat = (id: string) => store.progress.words[id]
  const noted = ordered.map((w) => ({ week: w, words: w.words.filter((x) => x.note) })).filter((g) => g.words.length)

  async function copy() {
    const c = exportCode(store.progress)
    try {
      await navigator.clipboard.writeText(c)
      message = 'Koden är kopierad. Spara den någonstans.'
    } catch {
      code = c
      message = 'Markera och kopiera koden i rutan.'
    }
  }

  function load() {
    const p = importCode(code)
    if (!p) {
      message = 'Koden gick inte att läsa.'
      return
    }
    replace(p)
    code = ''
    message = 'Framstegen är inlästa.'
  }

  function reset() {
    if (!confirmReset) {
      confirmReset = true
      return
    }
    replace(emptyProgress())
    confirmReset = false
    message = 'Allt är nollställt.'
  }
</script>

<BackHeader title="För vuxna" {onBack} />

<section class="card info">
  <h2>Så fungerar det</h2>
  <p>Varje dag finns ett kort pass på cirka 12 frågor. Ungefär tre fjärdedelar är veckans ord och resten är äldre ord som är på tur för repetition.</p>
  <p>Varje ord har en nivå från 1 till 5. Rätt svar flyttar upp ordet en nivå per dag och fel svar flyttar ned det. Ju högre nivå, desto svårare övningar och desto längre mellan repetitionerna. Från nivå 4 räknas ordet som att det sitter.</p>
  <p>Dagen före förhöret blir passet en generalrepetition där alla veckans ord skrivs.</p>
  <p class="days">Pass gjorda: {store.progress.days.length} dagar</p>
</section>

{#each ordered as w}
  <h3>{w.title} <span>· {prettyDate(w.due)}{w === week ? ' · aktuell' : ''}</span></h3>
  <table class="card">
    <thead><tr><th>Ord</th><th>Nivå</th><th class="n">Rätt</th><th class="n">Fel</th></tr></thead>
    <tbody>
      {#each refsFor(w) as ref (ref.id)}
        {@const s = stat(ref.id)}
        <tr class:hard={s && s.wrong > s.right}>
          <td><span lang="en">{ref.word.en}</span><small>{ref.word.sv}</small></td>
          <td><BoxMeter box={s?.box ?? 0} /></td>
          <td class="n">{s?.right ?? 0}</td>
          <td class="n">{s?.wrong ?? 0}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/each}

<section class="card tools">
  <h2>Säkerhetskopia</h2>
  <p>Framstegen sparas bara i den här webbläsaren. Med en kod kan du flytta dem till en annan enhet.</p>
  <button class="btn block" onclick={copy}><Copy size={20} /> Kopiera kod</button>
  <textarea bind:value={code} rows="3" placeholder="Klistra in en kod här" aria-label="Kod"></textarea>
  <button class="btn block" onclick={load} disabled={!code.trim()}>Läs in kod</button>
  <button class="btn block danger" onclick={reset}>{confirmReset ? 'Tryck igen för att nollställa' : 'Nollställ alla framsteg'}</button>
  {#if message}<p class="msg" role="status">{message}</p>{/if}
</section>

{#if noted.length}
  <details class="card notes">
    <summary><span>Tveksamma översättningar</span><CaretDown size={20} weight="bold" /></summary>
    <p>Ord där glospappret och engelskan inte riktigt stämmer överens. Bra att känna till om ett svar rättas oväntat.</p>
    {#each noted as g}
      <h3>{g.week.title} <span>· {prettyDate(g.week.due)}</span></h3>
      <ul>
        {#each g.words as x}
          <li><strong>{x.sv}</strong> → <span lang="en">{x.en}</span><small>{x.note}</small></li>
        {/each}
      </ul>
    {/each}
  </details>
{/if}

<style>
  h2 {
    font-size: 18px;
  }
  .info,
  .tools {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 18px;
    box-shadow: none;
    font-size: 16px;
  }
  .days {
    color: var(--mute);
  }
  h3 {
    font-size: 17px;
    margin: 22px 4px 8px;
  }
  h3 span {
    color: var(--mute);
    font-weight: 400;
  }
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    box-shadow: none;
    font-size: 15px;
    overflow: hidden;
  }
  th {
    text-align: left;
    font-weight: 500;
    color: var(--mute);
    font-size: 13px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--line);
  }
  td {
    padding: 10px 12px;
    vertical-align: middle;
  }
  tr + tr td {
    border-top: 1px solid var(--line);
  }
  td small {
    display: block;
    color: var(--mute);
  }
  .n {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  tr.hard td:first-child span {
    color: var(--bad);
  }
  .tools {
    margin-top: 24px;
  }
  textarea {
    width: 100%;
    padding: 10px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--line);
    background: var(--surface-2);
    color: var(--ink);
    font: 14px ui-monospace, monospace;
  }
  .notes {
    margin-top: 24px;
    padding: 0 18px;
    box-shadow: none;
    font-size: 16px;
  }
  summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 56px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    list-style: none;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary :global(svg) {
    color: var(--mute);
    transition: transform 0.2s var(--ease);
  }
  .notes[open] summary :global(svg) {
    transform: rotate(180deg);
  }
  .notes[open] {
    padding-bottom: 18px;
  }
  .notes > p {
    color: var(--mute);
  }
  .notes h3 {
    margin: 16px 0 6px;
  }
  .notes ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .notes li {
    padding: 8px 0;
  }
  .notes li + li {
    border-top: 1px solid var(--line);
  }
  .notes small {
    display: block;
    margin-top: 2px;
    color: var(--mute);
    font-size: 15px;
  }
  .danger {
    color: var(--bad);
  }
  .msg {
    color: var(--good);
  }
</style>
