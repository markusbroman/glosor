import type { Week } from './types'
import { sortWeeks } from './weeks'

const files = import.meta.glob<Omit<Week, 'due'> & { due?: string }>('../data/weeks/*.json', {
  eager: true,
  import: 'default',
})

export const WEEKS: Week[] = sortWeeks(
  Object.entries(files).map(([path, w]) => ({
    ...w,
    due: w.due ?? path.match(/(\d{4}-\d{2}-\d{2})\.json$/)![1],
  })),
)
