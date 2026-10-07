import { daysBetween } from './dates'
import { boxOf, isDue, type Progress } from './progress'
import { pick, shuffle, type Rng } from './random'
import type { Mode, Step, WordRef } from './types'

export const SESSION_SIZE = 12
export const REVIEW_SHARE = 0.25

const NEEDS_EXAMPLE: Mode[] = ['context', 'cloze', 'order']

const BY_BOX: Record<number, Mode[]> = {
  0: ['choice-en', 'choice-sv', 'listen'],
  1: ['choice-en', 'choice-sv', 'context', 'listen'],
  2: ['listen', 'choice-sv', 'cloze', 'tiles'],
  3: ['cloze', 'order', 'tiles', 'dictation'],
  4: ['type', 'dictation', 'say', 'order'],
  5: ['type', 'dictation', 'say', 'cloze'],
}

/** Lägen där hon själv producerar ordet – används för generalrepetitionen. */
const PRODUCE: Mode[] = ['type', 'dictation', 'tiles', 'cloze']

export const FREE_MODES: Mode[] = ['memory', 'match', 'tiles', 'listen', 'order', 'say']

export function canUse(mode: Mode, ref: WordRef): boolean {
  return !NEEDS_EXAMPLE.includes(mode) || !!ref.word.example
}

export function pickMode(
  ref: WordRef,
  box: number,
  previous: Mode | undefined,
  rng: Rng,
  pool: Mode[] = BY_BOX[Math.min(box, 5)],
): Mode {
  if (box === 0 && ref.word.example) return 'context'
  const usable = pool.filter((m) => canUse(m, ref))
  const varied = usable.filter((m) => m !== previous)
  return pick(varied.length ? varied : usable.length ? usable : ['choice-sv'], rng)
}

/** Lägen som passar som "andra försök" efter ett fel: lättare än det som gick fel. */
export function retryMode(ref: WordRef, failed: Mode): Mode {
  if (failed === 'choice-sv') return ref.word.example ? 'context' : 'choice-en'
  return 'choice-sv'
}

export function isRehearsalDay(today: string, due: string): boolean {
  const n = daysBetween(today, due)
  return n === 0 || n === 1
}

interface Input {
  current: WordRef[]
  older: WordRef[]
  progress: Progress
  today: string
  size?: number
  rng?: Rng
}

function byBox(refs: WordRef[], p: Progress, rng: Rng): WordRef[] {
  return shuffle(refs, rng).sort((a, b) => boxOf(p, a.id) - boxOf(p, b.id))
}

/** Bygger dagens pass: mest veckans ord, plus äldre ord som är på tur. */
export function buildSession({ current, older, progress, today, size = SESSION_SIZE, rng = Math.random }: Input): Step[] {
  const rehearsal = current.length > 0 && isRehearsalDay(today, current[0].week.due)

  const dueOld = byBox(
    older.filter((r) => isDue(progress, r.id, today)),
    progress,
    rng,
  )
  const reviewSlots = Math.min(dueOld.length, Math.round(size * REVIEW_SHARE))
  const reviews = dueOld.slice(0, reviewSlots)

  // Veckans ord: alla minst en gång (svagast först), sedan en extra runda för de svagaste.
  const currentSlots = rehearsal ? Math.max(size - reviewSlots, current.length) : size - reviewSlots
  const sorted = byBox(current, progress, rng)
  const firstRound = sorted.slice(0, currentSlots)
  const extras: WordRef[] = []
  while (firstRound.length + extras.length < currentSlots && sorted.length) {
    extras.push(...sorted.slice(0, currentSlots - firstRound.length - extras.length))
  }
  // Varva nya ord med repetition av ord som just introducerats, så det inte blir lika i rad.
  const picks: WordRef[] = []
  firstRound.forEach((ref, i) => {
    picks.push(ref)
    const placed = new Set(picks.slice(0, -1).map((r) => r.id))
    const k = extras.findIndex((e) => placed.has(e.id))
    if (i % 2 === 1 && k >= 0) picks.push(...extras.splice(k, 1))
  })
  picks.push(...extras)

  // Para ihop som uppvärmning när många ord är nya.
  const fresh = current.filter((r) => boxOf(progress, r.id) <= 1)
  const steps: Step[] = []
  if (!rehearsal && fresh.length >= 4 && picks.length > 4) {
    const group = shuffle(fresh, rng).slice(0, 5)
    steps.push({ mode: 'match', word: group[0], group, review: false })
    picks.pop()
  }

  // Lägg in repetitionsorden jämnt utspridda.
  const order: { ref: WordRef; review: boolean }[] = picks.map((ref) => ({ ref, review: false }))
  reviews.forEach((ref, i) => {
    const at = Math.round(((i + 1) * order.length) / (reviews.length + 1)) + i
    order.splice(at, 0, { ref, review: true })
  })
  spreadDuplicates(order)

  let previous: Mode | undefined = steps.at(-1)?.mode
  const seenInSession = new Set<string>()
  for (const { ref, review } of order) {
    const box = boxOf(progress, ref.id)
    // Andra gången samma ord dyker upp är det inte nytt längre.
    const effective = box === 0 && seenInSession.has(ref.id) ? 1 : box
    const mode = rehearsal && !review ? pickMode(ref, 5, previous, rng, PRODUCE) : pickMode(ref, effective, previous, rng)
    steps.push({ mode, word: ref, review })
    seenInSession.add(ref.id)
    previous = mode
  }
  return steps
}

/** Ser till att samma ord inte kommer två gånger i rad. */
function spreadDuplicates<T extends { ref: WordRef }>(list: T[]): void {
  for (let i = 1; i < list.length; i++) {
    if (list[i].ref.id !== list[i - 1].ref.id) continue
    const j = list.findIndex((x, k) => k > i && x.ref.id !== list[i].ref.id && list[k - 1]?.ref.id !== list[i].ref.id)
    if (j > 0) [list[i], list[j]] = [list[j], list[i]]
  }
}

/** Fri träning: ett valt läge med veckans ord. */
export function buildFree(mode: Mode, current: WordRef[], rng: Rng = Math.random): Step[] {
  if (mode === 'memory' || mode === 'match') {
    const group = shuffle(current, rng).slice(0, 6)
    return group.length ? [{ mode, word: group[0], group, review: false }] : []
  }
  return shuffle(current.filter((r) => canUse(mode, r)), rng).map((word) => ({ mode, word, review: false }))
}
