export interface Example {
  en: string
  sv: string
}

export interface Word {
  sv: string
  en: string
  /** Phosphor-ikonens namn utan "Icon", t.ex. "Stairs". */
  icon?: string
  example?: Example
}

export interface Week {
  /** Förhörsdatum, YYYY-MM-DD. Används även som id. */
  due: string
  title: string
  words: Word[]
}

export interface WordRef {
  id: string
  week: Week
  word: Word
}

export type Mode =
  | 'match'
  | 'choice-sv'
  | 'choice-en'
  | 'context'
  | 'listen'
  | 'cloze'
  | 'order'
  | 'tiles'
  | 'type'
  | 'dictation'
  | 'say'
  | 'memory'

export interface Step {
  mode: Mode
  word: WordRef
  /** Fler ord för lägen som tränar flera samtidigt (para ihop, memory). */
  group?: WordRef[]
  review: boolean
  retry?: boolean
}

export type Outcome = 'right' | 'wrong'
