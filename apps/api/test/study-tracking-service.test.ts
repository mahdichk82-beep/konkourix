import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError } from '../src/errors/api-error.js'
import { createStudyTrackingServices, type StudyTrackingStore } from '../src/study-tracking/services.js'
import type { DomainStudent, StudentGoalRecord, StudySessionRecord } from '../src/study-tracking/types.js'

const student: DomainStudent = { id: 'student-user-1', role: 'STUDENT', status: 'ACTIVE' }
const profile = { id: 'student-profile-1', userId: student.id }
const subject = { id: 'subject-1', studentProfileId: profile.id, archivedAt: null }
const task = { id: 'task-1', studentProfileId: profile.id, subjectId: subject.id }
const timestamp = new Date('2026-09-03T09:00:00.000Z')

const createStore = (): StudyTrackingStore & {
  sessions: StudySessionRecord[]
  goals: StudentGoalRecord[]
} => {
  const store = {
    sessions: [] as StudySessionRecord[],
    goals: [] as StudentGoalRecord[],
    async findStudentProfileByUserId(userId: string) { return userId === profile.userId ? profile : null },
    async findSubjectById(_profileId: string, id: string) { return id === subject.id ? subject : null },
    async findTaskById(profileId: string, id: string) {
      return profileId === profile.id && id === task.id ? task : null
    },
    async listSessions(_profileId: string, query?: { dailyTaskId?: string }) {
      return query?.dailyTaskId
        ? store.sessions.filter((session) => session.dailyTaskId === query.dailyTaskId)
        : store.sessions
    },
    async findSessionById(_profileId: string, id: string) { return store.sessions.find((item) => item.id === id) ?? null },
    async createSession(input: Omit<StudySessionRecord, 'id' | 'createdAt' | 'updatedAt'>) {
      const record = { id: `session-${store.sessions.length + 1}`, ...input, createdAt: timestamp, updatedAt: timestamp }
      store.sessions.push(record)
      return record
    },
    async updateSession(_profileId: string, id: string, input: Partial<Pick<StudySessionRecord, 'subjectId' | 'dailyTaskId' | 'startedAt' | 'endedAt' | 'notes'>>) {
      const record = store.sessions.find((item) => item.id === id)
      if (!record) return null
      Object.assign(record, input, { updatedAt: timestamp })
      return record
    },
    async listGoals() { return store.goals },
    async findGoalById(_profileId: string, id: string) { return store.goals.find((item) => item.id === id) ?? null },
    async createGoal(input: Omit<StudentGoalRecord, 'id' | 'createdAt' | 'updatedAt'>) {
      const record = { id: `goal-${store.goals.length + 1}`, ...input, createdAt: timestamp, updatedAt: timestamp }
      store.goals.push(record)
      return record
    },
    async updateGoal(_profileId: string, id: string, input: Partial<Pick<StudentGoalRecord, 'subjectId' | 'title' | 'description' | 'targetDate' | 'status' | 'completedAt'>>) {
      const record = store.goals.find((item) => item.id === id)
      if (!record) return null
      Object.assign(record, input, { updatedAt: timestamp })
      return record
    },
  }
  return store
}

test('study sessions require ordered timestamps and calculate duration', async () => {
  const services = createStudyTrackingServices(createStore(), () => timestamp)
  const session = await services.sessions.create(student, {
    subjectId: subject.id,
    dailyTaskId: task.id,
    startedAt: '2026-09-03T08:00:00.000Z',
    endedAt: '2026-09-03T09:00:00.000Z',
    notes: 'Algebra review',
  })

  assert.equal(session.durationMinutes, 60)

  await assert.rejects(
    services.sessions.create(student, {
      subjectId: subject.id,
      dailyTaskId: null,
      startedAt: '2026-09-03T10:00:00.000Z',
      endedAt: '2026-09-03T09:00:00.000Z',
      notes: null,
    }),
    (error: unknown) => error instanceof ApiError && error.code === 'SESSION_TIME_INVALID',
  )
})

test('study sessions reject a task linked to a different subject', async () => {
  const store = createStore()
  store.findTaskById = async () => ({ id: task.id, studentProfileId: profile.id, subjectId: 'other-subject' })
  const services = createStudyTrackingServices(store)

  await assert.rejects(
    services.sessions.create(student, {
      subjectId: subject.id,
      dailyTaskId: task.id,
      startedAt: '2026-09-03T08:00:00.000Z',
      endedAt: '2026-09-03T09:00:00.000Z',
      notes: null,
    }),
    (error: unknown) => error instanceof ApiError && error.code === 'TASK_SUBJECT_MISMATCH',
  )
})

test('task execution derives session ownership and relationships for an owned task', async () => {
  const store = createStore()
  const services = createStudyTrackingServices(store)

  const session = await services.sessions.createForTask(student, task.id, {
    startedAt: '2026-09-03T08:00:00.000Z',
    endedAt: '2026-09-03T08:45:00.000Z',
    notes: 'Task execution',
  })

  assert.equal(session.studentProfileId, profile.id)
  assert.equal(session.dailyTaskId, task.id)
  assert.equal(session.subjectId, subject.id)
  assert.equal(session.durationMinutes, 45)
  assert.equal(store.sessions.length, 1)
})

test('task execution supports owned subjectless tasks and rejects inaccessible tasks', async () => {
  const store = createStore()
  store.findTaskById = async (profileId, id) => (
    profileId === profile.id && id === task.id
      ? { ...task, subjectId: null }
      : null
  )
  const services = createStudyTrackingServices(store)

  const session = await services.sessions.createForTask(student, task.id, {
    startedAt: '2026-09-03T08:00:00.000Z',
    endedAt: '2026-09-03T09:00:00.000Z',
    notes: null,
  })
  assert.equal(session.subjectId, null)

  await assert.rejects(
    services.sessions.createForTask(student, 'foreign-task', {
      startedAt: '2026-09-03T08:00:00.000Z',
      endedAt: '2026-09-03T09:00:00.000Z',
      notes: null,
    }),
    (error: unknown) => error instanceof ApiError && error.code === 'TASK_NOT_FOUND',
  )
})

test('task-specific session reads require an owned task and preserve duration calculation', async () => {
  const store = createStore()
  store.sessions.push({
    createdAt: timestamp,
    dailyTaskId: task.id,
    endedAt: new Date('2026-09-03T09:30:00.000Z'),
    id: 'session-existing',
    notes: null,
    startedAt: new Date('2026-09-03T09:00:00.000Z'),
    studentProfileId: profile.id,
    subjectId: subject.id,
    updatedAt: timestamp,
  })
  const services = createStudyTrackingServices(store)

  const result = await services.sessions.list(student, { dailyTaskId: task.id })
  assert.equal(result.items[0]?.durationMinutes, 30)

  await assert.rejects(
    services.sessions.list(student, { dailyTaskId: 'foreign-task' }),
    (error: unknown) => error instanceof ApiError && error.code === 'TASK_NOT_FOUND',
  )
})

test('student goals set completedAt only when completed', async () => {
  const store = createStore()
  const services = createStudyTrackingServices(store, () => timestamp)
  const goal = await services.goals.create(student, {
    subjectId: subject.id,
    title: 'Master algebra',
    description: null,
    targetDate: '2026-09-30',
  })
  assert.equal(goal.status, 'ACTIVE')
  assert.equal(goal.completedAt, null)

  const completed = await services.goals.update(student, goal.id, { status: 'COMPLETED' })
  assert.deepEqual(completed.completedAt, timestamp)
})
