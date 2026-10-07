export type Rng = () => number

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pick<T>(items: readonly T[], rng: Rng = Math.random): T {
  return items[Math.floor(rng() * items.length)]
}

/** Deterministisk slump för tester. */
export function seeded(seed: number): Rng {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

/** Index i blandad ordning, aldrig i rätt ordning om det går att undvika. */
export function scramble(items: readonly string[], rng: Rng = Math.random): number[] {
  const idx = items.map((_, i) => i)
  if (new Set(items).size < 2) return idx
  for (let tries = 0; tries < 20; tries++) {
    const order = shuffle(idx, rng)
    if (order.some((v, i) => items[v] !== items[i])) return order
  }
  return idx.reverse()
}
