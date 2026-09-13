import type {
  AssessmentAttempt,
  CreateAssessmentAttemptInput,
} from './assessment-client'

export type AssessmentAttemptForm = {
  blankCount: string
  correctCount: string
  dailyTaskId: string
  endedAt: string
  incorrectCount: string
  startedAt: string
  subjectId: string
  title: string
  topicId: string
}

export const normalizeAssessmentCount = (value: string): number | null => {
  if (!/^\d+$/.test(value.trim())) return null
  const count = Number(value)
  return Number.isSafeInteger(count) ? count : null
}

const localDateTimeToIso = (value: string): string | null => {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export const buildAssessmentAttemptPayload = (
  form: AssessmentAttemptForm,
): CreateAssessmentAttemptInput | null => {
  const correctCount = normalizeAssessmentCount(form.correctCount)
  const incorrectCount = normalizeAssessmentCount(form.incorrectCount)
  const blankCount = normalizeAssessmentCount(form.blankCount)
  const startedAt = localDateTimeToIso(form.startedAt)
  const endedAt = localDateTimeToIso(form.endedAt)
  const title = form.title.trim()

  if (
    correctCount === null
    || incorrectCount === null
    || blankCount === null
    || correctCount + incorrectCount + blankCount <= 0
    || !startedAt
    || !endedAt
    || new Date(endedAt) <= new Date(startedAt)
    || !title
  ) return null

  return {
    blankCount,
    correctCount,
    dailyTaskId: form.dailyTaskId || null,
    endedAt,
    incorrectCount,
    startedAt,
    subjectId: form.subjectId || null,
    title,
    topicId: form.topicId || null,
  }
}

export const formQuestionCount = (form: AssessmentAttemptForm): number => {
  const counts = [form.correctCount, form.incorrectCount, form.blankCount]
    .map(normalizeAssessmentCount)
  return counts.some((count) => count === null)
    ? 0
    : counts.reduce<number>((total, count) => total + (count ?? 0), 0)
}

export const replaceAssessmentAttempt = (
  attempts: AssessmentAttempt[],
  updated: AssessmentAttempt,
): AssessmentAttempt[] => attempts.map((attempt) =>
  attempt.id === updated.id ? updated : attempt)

export const invalidateAssessmentAttempt = async (
  attempts: AssessmentAttempt[],
  id: string,
  request: (id: string) => Promise<AssessmentAttempt>,
): Promise<AssessmentAttempt[]> => replaceAssessmentAttempt(attempts, await request(id))
