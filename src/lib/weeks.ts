import type { Week, WordRef } from './types'

export function wordId(week: Week, en: string): string {
  return `${week.due}:${en.toLowerCase()}`
}

export function sortWeeks(weeks: Week[]): Week[] {
  return [...weeks].sort((a, b) => a.due.localeCompare(b.due))
}

/**
 * Veckan som tränas nu: den med tidigaste förhörsdatum som inte passerats.
 * På förhörsdagen byts till nästa vecka så fort den har lagts in.
 * Finns ingen kommande vecka används den senaste.
 */
export function currentWeek(weeks: Week[], today: string): Week | undefined {
  const sorted = sortWeeks(weeks)
  const upcoming = sorted.filter((w) => w.due >= today)
  if (upcoming.length === 0) return sorted.at(-1)
  if (upcoming[0].due === today && upcoming.length > 1) return upcoming[1]
  return upcoming[0]
}

export function refsFor(week: Week): WordRef[] {
  return week.words.map((word) => ({ id: wordId(week, word.en), week, word }))
}

export function allRefs(weeks: Week[]): WordRef[] {
  return sortWeeks(weeks).flatMap(refsFor)
}
