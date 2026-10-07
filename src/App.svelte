<script lang="ts">
  import Home from './components/Home.svelte'
  import Session from './components/Session.svelte'
  import WordList from './components/WordList.svelte'
  import ParentView from './components/ParentView.svelte'
  import { WEEKS } from './lib/data'
  import { todayISO } from './lib/dates'
  import { buildFree, buildSession } from './lib/scheduler'
  import { store } from './lib/store.svelte'
  import type { Mode, Step } from './lib/types'
  import { allRefs, currentWeek, refsFor } from './lib/weeks'

  type View = { name: 'home' } | { name: 'session'; steps: Step[]; daily: boolean } | { name: 'words' } | { name: 'parent' }

  let view = $state<View>({ name: 'home' })

  // I utvecklingsläge går det att låtsas att det är en annan dag: /?idag=2026-10-05
  const today = (import.meta.env.DEV && new URLSearchParams(location.search).get('idag')) || todayISO()
  const week = currentWeek(WEEKS, today)
  const current = week ? refsFor(week) : []
  const all = allRefs(WEEKS)
  const older = all.filter((r) => r.week !== week)

  function startDaily() {
    view = { name: 'session', steps: buildSession({ current, older, progress: store.progress, today }), daily: true }
  }

  function startFree(mode: Mode) {
    view = { name: 'session', steps: buildFree(mode, current), daily: false }
  }

  const home = () => (view = { name: 'home' })
</script>

<main>
  {#if view.name === 'home'}
    <Home
      {week}
      {today}
      {current}
      onDaily={startDaily}
      onFree={startFree}
      onWords={() => (view = { name: 'words' })}
      onParent={() => (view = { name: 'parent' })}
    />
  {:else if view.name === 'session'}
    {#key view.steps}
      <Session steps={view.steps} daily={view.daily} pool={all} {week} {today} onExit={home} onAgain={startDaily} />
    {/key}
  {:else if view.name === 'words'}
    <WordList weeks={WEEKS} {week} onBack={home} />
  {:else}
    <ParentView weeks={WEEKS} {week} onBack={home} />
  {/if}
</main>

<style>
  main {
    max-width: 560px;
    margin: 0 auto;
    padding: max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom));
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }
</style>
