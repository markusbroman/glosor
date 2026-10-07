import { shuffle, type Rng } from './random'
import type { WordRef } from './types'

/** Felaktiga svarsalternativ: helst från samma vecka, aldrig samma text som rätt svar. */
export function distractors(target: WordRef, pool: WordRef[], n = 3, rng: Rng = Math.random): WordRef[] {
  const same = shuffle(pool.filter((r) => r.week === target.week), rng)
  const other = shuffle(pool.filter((r) => r.week !== target.week), rng)
  const out: WordRef[] = []
  const seen = new Set([target.word.en.toLowerCase(), target.word.sv.toLowerCase()])
  for (const r of [...same, ...other]) {
    if (out.length >= n) break
    if (seen.has(r.word.en.toLowerCase()) || seen.has(r.word.sv.toLowerCase())) continue
    seen.add(r.word.en.toLowerCase())
    seen.add(r.word.sv.toLowerCase())
    out.push(r)
  }
  return out
}

export function withDistractors(target: WordRef, pool: WordRef[], n = 3): WordRef[] {
  return shuffle([target, ...distractors(target, pool, n)])
}
