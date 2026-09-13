import assert from 'node:assert/strict'
import test from 'node:test'
import type { AssessmentAttempt } from './assessment-client.ts'
import {
  buildAssessmentAttemptPayload,
  formQuestionCount,
  invalidateAssessmentAttempt,
  normalizeAssessmentCount,
} from './assessment-attempts.ts'

const form = {
  blankCount: '2',
  correctCount: '7',
  dailyTaskId: 'task-1',
  endedAt: '2026-09-13T11:00',
  incorrectCount: '1',
  startedAt: '2026-09-13T10:30',
  subjectId: 'subject-1',
  title: '  آزمون زیست  ',
  topicId: 'topic-1',
}

const attempt: AssessmentAttempt = {
  blankCount: 2,
  correctCount: 7,
  createdAt: '2026-09-13T11:00:00.000Z',
  dailyTaskId: 'task-1',
  durationMinutes: 30,
  endedAt: '2026-09-13T11:00:00.000Z',
  id: 'attempt-1',
  incorrectCount: 1,
  invalidatedAt: null,
  questionCount: 10,
  startedAt: '2026-09-13T10:30:00.000Z',
  subjectId: 'subject-1',
  title: 'آزمون زیست',
  topicId: 'topic-1',
  updatedAt: '2026-09-13T11:00:00.000Z',
}

test('assessment entry builds a strict completed-attempt payload with derived total', () => {
  const payload = buildAssessmentAttemptPayload(form)
  assert.equal(payload?.title, 'آزمون زیست')
  assert.equal(payload?.correctCount, 7)
  assert.equal(payload?.incorrectCount, 1)
  assert.equal(payload?.blankCount, 2)
  assert.match(payload?.startedAt ?? '', /Z$/)
  assert.equal(formQuestionCount(form), 10)
})

test('assessment count normalization rejects fractions, negatives, and empty values', () => {
  assert.equal(normalizeAssessmentCount('0'), 0)
  assert.equal(normalizeAssessmentCount('12'), 12)
  assert.equal(normalizeAssessmentCount('-1'), null)
  assert.equal(normalizeAssessmentCount('1.5'), null)
  assert.equal(normalizeAssessmentCount(''), null)
  assert.equal(buildAssessmentAttemptPayload({ ...form, correctCount: '0', incorrectCount: '0', blankCount: '0' }), null)
})

test('history invalidation replaces the persisted row and preserves state on failure', async () => {
  const invalidated = { ...attempt, invalidatedAt: '2026-09-13T12:00:00.000Z' }
  const next = await invalidateAssessmentAttempt([attempt], attempt.id, async () => invalidated)
  assert.equal(next[0]?.invalidatedAt, invalidated.invalidatedAt)
  assert.equal(next[0]?.questionCount, 10)
  assert.equal(next[0]?.durationMinutes, 30)

  const original = [attempt]
  await assert.rejects(
    invalidateAssessmentAttempt(original, attempt.id, async () => { throw new Error('failed') }),
    /failed/,
  )
  assert.deepEqual(original, [attempt])
})
