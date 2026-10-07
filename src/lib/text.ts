export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^\p{L}\p{N}' ]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function distance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[b.length]
}

export type Check = 'right' | 'almost' | 'wrong'

/** Rätt, nästan rätt (ett litet stavfel) eller fel. */
export function checkAnswer(given: string, target: string): Check {
  const g = normalize(given)
  const t = normalize(target)
  if (g === t) return 'right'
  if (t.length >= 4 && distance(g, t) <= 1) return 'almost'
  return 'wrong'
}

export interface Cloze {
  before: string
  answer: string
  after: string
}

/** Delar upp en exempelmening runt ordet, oavsett stor/liten bokstav. */
export function makeCloze(sentence: string, target: string): Cloze | null {
  const i = sentence.toLowerCase().indexOf(target.toLowerCase())
  if (i < 0) return null
  return {
    before: sentence.slice(0, i),
    answer: sentence.slice(i, i + target.length),
    after: sentence.slice(i + target.length),
  }
}

export function words(sentence: string): string[] {
  return sentence.split(/\s+/).filter(Boolean)
}
