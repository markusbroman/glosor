const pad = (n: number) => String(n).padStart(2, '0')

export function iso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayISO(): string {
  return iso(new Date())
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(s: string, n: number): string {
  const d = parseISO(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseISO(to).getTime() - parseISO(from).getTime()) / 86_400_000)
}

const DAY_NAMES = ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör']
const MONTHS = ['jan', 'feb', 'mars', 'april', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec']

export function dayName(s: string): string {
  return DAY_NAMES[parseISO(s).getDay()]
}

export function prettyDate(s: string): string {
  const d = parseISO(s)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function untilText(today: string, due: string): string {
  const n = daysBetween(today, due)
  if (n < 0) return 'förhöret är klart'
  if (n === 0) return 'förhör idag'
  if (n === 1) return 'förhör i morgon'
  return `förhör om ${n} dagar`
}
