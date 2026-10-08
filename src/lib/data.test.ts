import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { WEEKS } from './data'
import { makeCloze } from './text'

describe('veckofilerna', () => {
  it('har giltiga datum som är torsdagar', () => {
    for (const w of WEEKS) {
      expect(w.due).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(new Date(w.due + 'T12:00').getDay(), w.due).toBe(4)
    }
  })

  for (const w of WEEKS) {
    describe(w.due, () => {
      it('har ord med sv och en', () => {
        expect(w.words.length).toBeGreaterThan(0)
        for (const x of w.words) expect(x.sv && x.en).toBeTruthy()
      })
      it('har ikoner som finns i Phosphor', () => {
        for (const x of w.words) {
          if (x.icon) expect(existsSync(`node_modules/phosphor-svelte/lib/${x.icon}Icon.svelte`), x.icon).toBe(true)
        }
      })
      it('har exempelmeningar som innehåller ordet', () => {
        for (const x of w.words) if (x.example) expect(makeCloze(x.example.en, x.en), x.en).not.toBeNull()
      })
      it('har anteckningar som inte är tomma', () => {
        for (const x of w.words) if ('note' in x) expect(typeof x.note === 'string' && x.note.trim(), x.en).toBeTruthy()
      })
    })
  }
})
