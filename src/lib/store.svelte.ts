import { emptyProgress, parseProgress, type Progress } from './progress'

const KEY = 'glosor.progress'

function load(): Progress {
  try {
    return parseProgress(localStorage.getItem(KEY))
  } catch {
    return emptyProgress()
  }
}

export const store = $state({ progress: load() })

export function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store.progress))
  } catch {}
}

export function replace(p: Progress): void {
  store.progress = p
  save()
}
