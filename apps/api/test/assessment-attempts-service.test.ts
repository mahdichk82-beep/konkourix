import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError } from '../src/errors/api-error.js'
import {
  createAssessmentAttemptServices,
  type AssessmentAttemptStore,
} from '../src/assessment-attempts/services.js'
import type { AssessmentAttemptRecord } from '../src/assessment-attempts/types.js'

const timestamp = new Date('2026-09-13T12:00:00.000Z')
const student = { id: 'student-user', role: 'STUDENT' as const, status: 'ACTIVE' as const }
const ids = {
  attempt: '10000000-0000-4000-8000-000000000001',
  task: '20000000-0000-4000-8000-000000000001',
  subject: '30000000-0000-4000-8000-000000000001',
  topic: '40000000-0000-4000-8000-000000000001',
}

const record = (overrides: Partial<AssessmentAttemptRecord> = {}): AssessmentAttemptRecord => ({
  blankCount: 2,
  correctCount: 7,
  createdAt: timestamp,
  dailyTaskId: ids.task,
  endedAt: new Date('2026-09-13T11:00:00.000Z'),
  id: ids.attempt,
  incorrectCount: 1,
  invalidatedAt: null,
  startedAt: new Date('2026-09-13T10:30:00.000Z'),
  studentProfileId: 'student-profile',
  subjectId: ids.subject,
  title: 'Biology practice',
  topicId: ids.topic,
  updatedAt: timestamp,
  ...overrides,
})

const createStore = (overrides: Partial<AssessmentAttemptStore> = {}) => {
  let current = record()
  const store: AssessmentAttemptStore = {
    findStudentProfileByUserId: async (userId) =>
      userId === student.id ? { id: 'student-profile', userId } : null,
    findTaskById: async (_profileId, id) => id === ids.task
      ? { id, studentProfileId: 'student-profile', subjectId: ids.subject, topicId: ids.topic }
      : null,
    findSubjectById: async (_profileId, id) => id === ids.subject
      ? { archivedAt: null, id, studentProfileId: 'student-profile' }
      : null,
    findTopicById: async (_profileId, id) => id === ids.topic
      ? { archivedAt: null, id, subjectId: ids.subject }
      : null,
    listAttempts: async () => [current],
    findAttemptById: async (_profileId, id) => id === current.id ? current : null,
    createAttempt: async (input) => {
      current = record(input)
      return current
    },
    updateAttempt: async (_profileId, id, input) => {
      if (id !== current.id) return { ok: false, reason: 'ATTEMPT_NOT_FOUND' }
      if (current.invalidatedAt) return { ok: false, reason: 'ATTEMPT_INVALIDATED' }
      current = { ...current, ...input }
      return { ok: true, value: current }
    },
    invalidateAttempt: async (_profileId, id, invalidatedAt) => {
      if (id !== current.id) return { ok: false, reason: 'ATTEMPT_NOT_FOUND' }
      if (current.invalidatedAt) return { ok: false, reason: 'ATTEMPT_ALREADY_INVALIDATED' }
      current = { ...current, invalidatedAt }
      return { ok: true, value: current }
    },
    ...overrides,
  }
  return store
}

const input = {
  blankCount: 2,
  correctCount: 7,
  dailyTaskId: ids.task,
  endedAt: '2026-09-13T11:00:00.000Z',
  incorrectCount: 1,
  startedAt: '2026-09-13T10:30:00.000Z',
  subjectId: null,
  title: '  Biology practice  ',
  topicId: null,
}

test('student creates a safe completed attempt with task-derived provenance and raw facts', async () => {
  let persisted: Omit<AssessmentAttemptRecord, 'id' | 'createdAt' | 'updatedAt'> | null = null
  const store = createStore({
    createAttempt: async (value) => {
      persisted = value
      return record(value)
    },
  })
  const view = await createAssessmentAttemptServices(store).create(student, input)

  assert.equal(persisted?.studentProfileId, 'student-profile')
  assert.equal(persisted?.subjectId, ids.subject)
  assert.equal(persisted?.topicId, ids.topic)
  assert.equal(persisted?.invalidatedAt, null)
  assert.equal(view.title, 'Biology practice')
  assert.equal(view.questionCount, 10)
  assert.equal(view.durationMinutes, 30)
  assert.equal('studentProfileId' in view, false)
})

test('attempt creation validates time, non-empty totals, owned task, and topic consistency', async () => {
  const services = createAssessmentAttemptServices(createStore())
  for (const [change, code] of [
    [{ endedAt: input.startedAt }, 'ATTEMPT_TIME_INVALID'],
    [{ blankCount: 0, correctCount: 0, incorrectCount: 0 }, 'ATTEMPT_COUNTS_INVALID'],
    [{ dailyTaskId: 'foreign-task' }, 'TASK_NOT_FOUND'],
    [{ dailyTaskId: null, subjectId: ids.subject, topicId: 'foreign-topic' }, 'TOPIC_NOT_FOUND'],
  ] as const) {
    await assert.rejects(
      services.create(student, { ...input, ...change }),
      (error: unknown) => error instanceof ApiError && error.code === code,
    )
  }
})

test('valid attempt facts can be corrected but provenance is not part of the update contract', async () => {
  const services = createAssessmentAttemptServices(createStore())
  const updated = await services.update(student, ids.attempt, {
    blankCount: 1,
    correctCount: 8,
  })
  assert.equal(updated.correctCount, 8)
  assert.equal(updated.blankCount, 1)
  assert.equal(updated.dailyTaskId, ids.task)
  assert.equal(updated.questionCount, 10)
})

test('invalidation is server timed, retained in history, and prevents later edits', async () => {
  const services = createAssessmentAttemptServices(createStore(), () => timestamp)
  const invalidated = await services.invalidate(student, ids.attempt)
  assert.equal(invalidated.invalidatedAt?.toISOString(), timestamp.toISOString())

  const history = await services.list(student)
  assert.equal(history.items[0]?.invalidatedAt?.toISOString(), timestamp.toISOString())
  await assert.rejects(
    services.update(student, ids.attempt, { correctCount: 6 }),
    (error: unknown) => error instanceof ApiError && error.code === 'ATTEMPT_INVALIDATED',
  )
  await assert.rejects(
    services.invalidate(student, ids.attempt),
    (error: unknown) => error instanceof ApiError && error.code === 'ATTEMPT_ALREADY_INVALIDATED',
  )
})

test('foreign attempts are hidden and non-students cannot operate assessment attempts', async () => {
  const services = createAssessmentAttemptServices(createStore())
  await assert.rejects(
    services.get(student, 'foreign-attempt'),
    (error: unknown) => error instanceof ApiError && error.code === 'ATTEMPT_NOT_FOUND',
  )
  await assert.rejects(
    services.list({ ...student, role: 'COUNSELOR' }),
    (error: unknown) => error instanceof ApiError && error.code === 'ROLE_FORBIDDEN',
  )
})
