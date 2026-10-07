import { describe, expect, it } from 'vitest'
import { emptyProgress, record } from './progress'
import { seeded } from './random'
import { buildFree, buildSession, canUse, isRehearsalDay } from './scheduler'
import { checkAnswer, makeCloze } from './text'
import type { Week } from './types'
import { currentWeek, refsFor } from './weeks'

function week(due: string, n: number, withExamples = true): Week {
  return {
    due,
    title: due,
    words: Array.from({ length: n }, (_, i) => ({
      sv: `ord${i}`,
      en: `word${i}`,
      example: withExamples ? { en: `This is word${i} here.`, sv: `Det här är ord${i}.` } : undefined,
    })),
  }
}

describe('currentWeek', () => {
  const a = week('2026-10-08', 3)
  const b = week('2026-10-15', 3)

  it('väljer veckan med närmast kommande förhör', () => {
    expect(currentWeek([a, b], '2026-10-05')).toBe(a)
  })
  it('byter på förhörsdagen om nästa vecka finns', () => {
    expect(currentWeek([a, b], '2026-10-08')).toBe(b)
  })
  it('stannar på förhörsdagens vecka om nästa inte lagts in', () => {
    expect(currentWeek([a], '2026-10-08')).toBe(a)
  })
  it('använder senaste veckan när alla passerats', () => {
    expect(currentWeek([a, b], '2026-10-20')).toBe(b)
  })
})

describe('progress', () => {
  it('flyttar upp högst en låda per dag men ned vid varje fel', () => {
    const p = emptyProgress()
    record(p, 'x', 'right', '2026-10-01')
    record(p, 'x', 'right', '2026-10-01')
    expect(p.words.x.box).toBe(2)
    record(p, 'x', 'right', '2026-10-02')
    record(p, 'x', 'right', '2026-10-03')
    expect(p.words.x.box).toBe(4)
    record(p, 'x', 'wrong', '2026-10-03')
    expect(p.words.x.box).toBe(2)
    record(p, 'x', 'wrong', '2026-10-03')
    expect(p.words.x.box).toBe(1)
    expect(p.words.x.next).toBe('2026-10-03')
  })
})

describe('buildSession', () => {
  const old = refsFor(week('2026-10-01', 8))
  const cur = refsFor(week('2026-10-08', 7))

  it('blandar ca 75 % veckans ord med 25 % äldre ord', () => {
    const steps = buildSession({ current: cur, older: old, progress: emptyProgress(), today: '2026-10-03', rng: seeded(1) })
    const words = steps.flatMap((s) => s.group ?? [s.word])
    const reviews = steps.filter((s) => s.review)
    expect(reviews).toHaveLength(3)
    expect(steps.length).toBeLessThanOrEqual(12)
    for (const r of cur) expect(words.some((w) => w.id === r.id)).toBe(true)
  })

  it('tar inte med äldre ord som inte är på tur', () => {
    const p = emptyProgress()
    for (const r of old) record(p, r.id, 'right', '2026-10-03')
    const steps = buildSession({ current: cur, older: old, progress: p, today: '2026-10-03', rng: seeded(2) })
    expect(steps.some((s) => s.review)).toBe(false)
  })

  it('börjar nya ord med meningen och lägger in para ihop som uppvärmning', () => {
    const steps = buildSession({ current: cur, older: [], progress: emptyProgress(), today: '2026-10-03', rng: seeded(3) })
    expect(steps[0].mode).toBe('match')
    const firstSeen = new Map<string, string>()
    for (const s of steps.slice(1)) if (!firstSeen.has(s.word.id)) firstSeen.set(s.word.id, s.mode)
    expect([...firstSeen.values()].every((m) => m === 'context')).toBe(true)
  })

  it('har aldrig samma ord två gånger i rad', () => {
    for (let seed = 0; seed < 30; seed++) {
      const steps = buildSession({ current: refsFor(week('2026-10-08', 3)), older: [], progress: emptyProgress(), today: '2026-10-03', rng: seeded(seed) })
      for (let i = 1; i < steps.length; i++) expect(steps[i].word.id).not.toBe(steps[i - 1].word.id)
    }
  })

  it('har aldrig samma läge två gånger i rad när det finns alternativ', () => {
    const p = emptyProgress()
    for (const r of cur) record(p, r.id, 'right', '2026-10-01')
    for (let seed = 0; seed < 30; seed++) {
      const steps = buildSession({ current: cur, older: old, progress: p, today: '2026-10-03', rng: seeded(seed) })
      for (let i = 1; i < steps.length; i++) expect(steps[i].mode).not.toBe(steps[i - 1].mode)
    }
  })

  it('hoppar över meningslägen när exempelmening saknas', () => {
    const plain = refsFor(week('2026-10-08', 6, false))
    for (let seed = 0; seed < 30; seed++) {
      const steps = buildSession({ current: plain, older: [], progress: emptyProgress(), today: '2026-10-03', rng: seeded(seed) })
      for (const s of steps) expect(canUse(s.mode, s.word)).toBe(true)
    }
  })

  it('kör generalrepetition med producerande lägen dagen före förhöret', () => {
    expect(isRehearsalDay('2026-10-07', '2026-10-08')).toBe(true)
    expect(isRehearsalDay('2026-10-05', '2026-10-08')).toBe(false)
    const steps = buildSession({ current: cur, older: [], progress: emptyProgress(), today: '2026-10-07', rng: seeded(4) })
    expect(steps.every((s) => ['type', 'dictation', 'tiles', 'cloze'].includes(s.mode))).toBe(true)
    for (const r of cur) expect(steps.some((s) => s.word.id === r.id)).toBe(true)
  })
})

describe('buildFree', () => {
  it('memory använder högst sex par', () => {
    const steps = buildFree('memory', refsFor(week('2026-10-08', 9)), seeded(1))
    expect(steps).toHaveLength(1)
    expect(steps[0].group).toHaveLength(6)
  })
})

describe('text', () => {
  it('rättar snällt men exakt', () => {
    expect(checkAnswer(' Step by step! ', 'step by step')).toBe('right')
    expect(checkAnswer('step by stepp', 'step by step')).toBe('almost')
    expect(checkAnswer('next', 'then')).toBe('wrong')
  })
  it('hittar ordet i meningen oavsett versal', () => {
    expect(makeCloze('First, wash your hands.', 'first')).toEqual({ before: '', answer: 'First', after: ', wash your hands.' })
  })
})

describe('nya veckan', () => {
  it('varvar introduktioner med repetition', () => {
    const cur = refsFor(week('2026-10-08', 7))
    const steps = buildSession({ current: cur, older: [], progress: emptyProgress(), today: '2026-10-03', rng: seeded(5) })
    const modes = steps.map((s) => s.mode).join(',')
    expect(modes).not.toMatch(/context,context,context/)
    expect(steps.length).toBe(12)
  })
})
