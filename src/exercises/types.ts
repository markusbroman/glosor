import type { Outcome, Step, WordRef } from '../lib/types'

export interface Result {
  id: string
  outcome: Outcome
}

export interface ExerciseProps {
  step: Step
  pool: WordRef[]
  /** Anropas en gång när uppgiften är avgjord. `almost` = litet stavfel. */
  onAnswer: (results: Result[], almost?: boolean) => void
}
