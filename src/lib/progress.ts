import { addDays } from './dates'
import type { Outcome } from './types'

export interface WordStat {
  /** Leitner-låda 1–5. */
  box: number
  right: number
  wrong: number
  /** Senast övad. */
  last?: string
  /** Nästa dag ordet behöver repeteras. */
  next?: string
  /** Dag då ordet senast flyttades upp, så det bara går upp en låda per dag. */
  moved?: string
}

export interface Progress {
  v: 1
  words: Record<string, WordStat>
  /** Dagar då ett pass har gjorts klart. */
  days: string[]
}

export const MAX_BOX = 5
/** Dagar till nästa repetition, per låda. */
export const INTERVALS = [0, 0, 1, 2, 4, 14]
export const KNOWN_BOX = 4

export function emptyProgress(): Progress {
  return { v: 1, words: {}, days: [] }
}

export function boxOf(p: Progress, id: string): number {
  return p.words[id]?.box ?? 0
}

export function record(p: Progress, id: string, outcome: Outcome, today: string): void {
  const s = (p.words[id] ??= { box: 1, right: 0, wrong: 0 })
  if (outcome === 'right') {
    s.right++
    if (s.moved !== today && s.box < MAX_BOX) {
      s.box++
      s.moved = today
    }
  } else {
    s.wrong++
    s.box = Math.max(1, s.box - 2)
  }
  s.last = today
  s.next = addDays(today, INTERVALS[s.box])
}

export function markDay(p: Progress, today: string): void {
  if (!p.days.includes(today)) p.days.push(today)
}

export function isDue(p: Progress, id: string, today: string): boolean {
  const s = p.words[id]
  return !s || !s.next || s.next <= today
}

export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress()
  try {
    const p = JSON.parse(raw)
    if (p?.v === 1 && typeof p.words === 'object' && Array.isArray(p.days)) return p
  } catch {}
  return emptyProgress()
}

export function exportCode(p: Progress): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(p))))
}

export function importCode(code: string): Progress | null {
  try {
    const p = parseProgress(decodeURIComponent(escape(atob(code.trim()))))
    return Object.keys(p.words).length || p.days.length ? p : null
  } catch {
    return null
  }
}
