import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError } from '../src/errors/api-error.js'
import { createStudyTrackingServices, type StudyTrackingStore } from '../src/study-tracking/services.js'
import type { DomainStudent, StudentGoalRecord, StudySessionRecord } from '../src/study-tracking/types.js'

const student: DomainStudent = { id: 'student-user-1', role: 'STUDENT', status: 'ACTIVE' }
const profile = { id: 'student-profile-1', userId: student.id }
const subject = { id: 'subject-1', studentProfileId: profile.id, archivedAt: null }
const task = { id: 'task-1', studentProfileId: profile.id, subjectId: subject.id, status: 'PENDING' as const }
const secondTask = { ...task, id: 'task-2' }
const timestamp = new Date('2026-09-03T09:00:00.000Z')

const createStore = (): StudyTrackingStore & {
  sessions: StudySessionRecord[]
  goals: StudentGoalRecord[]
} => {
  let liveQueue = Promise.resolve()
  const serializeLive = <T>(operation: () => Promise<T>): Promise<T> => {
    const result = liveQueue.then(operation, operation)
    liveQueue = result.then(() => undefined, () => undefined)
    return result
  }
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
    async findActiveSession(profileId: string) {
      return store.sessions.find((item) =>
        item.studentProfileId === profileId && item.endedAt === null,
      ) ?? null
    },
    async findSessionById(profileId: string, id: string) {
      return store.sessions.find((item) => item.id === id && item.studentProfileId === profileId) ?? null
    },
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
    async startTaskSession(profileId: string, taskId: string, startedAt: Date) {
      return serializeLive(async () => {
        const target = await store.findTaskById(profileId, taskId)
        if (!target) return { ok: false as const, reason: 'TASK_NOT_FOUND' as const }
        if (target.status !== 'PENDING') {
          return { ok: false as const, reason: 'TASK_NOT_EXECUTABLE' as const }
        }
        const active = await store.findActiveSession(profileId)
        if (active) {
          return active.dailyTaskId === taskId
            ? { ok: true as const, value: active, reused: true }
            : { ok: false as const, reason: 'ACTIVE_STUDY_SESSION_EXISTS' as const }
        }
        const value = await store.createSession({
          dailyTaskId: taskId,
          endedAt: null,
          notes: null,
          startedAt,
          studentProfileId: profileId,
          subjectId: target.subjectId,
        })
        return { ok: true as const, value, reused: false }
      })
    },
    async switchTaskSession(profileId: string, taskId: string, transitionAt: Date) {
      return serializeLive(async () => {
        const target = await store.findTaskById(profileId, taskId)
        if (!target) return { ok: false as const, reason: 'TASK_NOT_FOUND' as const }
        if (target.status !== 'PENDING') {
          return { ok: false as const, reason: 'TASK_NOT_EXECUTABLE' as const }
        }
        const active = await store.findActiveSession(profileId)
        if (active?.dailyTaskId === taskId) {
          return {
            ok: true as const,
            value: { activeSession: active, finishedSession: null },
          }
        }
        let finishedSession = null
        if (active) {
          if (transitionAt <= active.startedAt) {
            return { ok: false as const, reason: 'SESSION_TIME_INVALID' as const }
          }
          active.endedAt = transitionAt
          finishedSession = active
        }
        const activeSession = await store.createSession({
          dailyTaskId: taskId,
          endedAt: null,
          notes: null,
          startedAt: transitionAt,
          studentProfileId: profileId,
          subjectId: target.subjectId,
        })
        return {
          ok: true as const,
          value: { activeSession, finishedSession },
        }
      })
    },
    async finishSession(profileId: string, id: string, endedAt: Date, notes?: string | null) {
      const record = store.sessions.find((item) => item.id === id && item.studentProfileId === profileId)
      if (!record) return { ok: false as const, reason: 'SESSION_NOT_FOUND' as const }
      if (record.endedAt) return { ok: false as const, reason: 'SESSION_ALREADY_FINISHED' as const }
      if (endedAt <= record.startedAt) return { ok: false as const, reason: 'SESSION_TIME_INVALID' as const }
      record.endedAt = endedAt
      if (notes !== undefined) record.notes = notes
      return { ok: true as const, value: record }
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
  store.findTaskById = async () => ({ ...task, subjectId: 'other-subject' })
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

test('student starts an owned pending task with server-owned session linkage and time', async () => {
  const store = createStore()
  const services = createStudyTrackingServices(store, () => timestamp)

  const session = await services.sessions.startTask(student, task.id)

  assert.equal('studentProfileId' in session, false)
  assert.equal(session.dailyTaskId, task.id)
  assert.equal(session.subjectId, subject.id)
  assert.deepEqual(session.startedAt, timestamp)
  assert.equal(session.endedAt, null)
  assert.equal(session.durationMinutes, null)
  assert.equal(store.sessions.length, 1)

  await assert.rejects(
    services.sessions.startTask(student, 'foreign-task'),
    (error: unknown) => error instanceof ApiError && error.code === 'TASK_NOT_FOUND',
  )
})

test('only pending tasks are executable and starting does not alter task lifecycle', async () => {
  const store = createStore()
  store.findTaskById = async () => ({ ...task, status: 'COMPLETED' })
  const services = createStudyTrackingServices(store, () => timestamp)

  await assert.rejects(
    services.sessions.startTask(student, task.id),
    (error: unknown) => error instanceof ApiError && error.code === 'TASK_NOT_EXECUTABLE',
  )
  assert.equal(store.sessions.length, 0)
  assert.equal((await store.findTaskById(profile.id, task.id))?.status, 'COMPLETED')
})

test('student finishes only an owned active session and duration uses server finish time', async () => {
  const store = createStore()
  store.sessions.push({
    createdAt: timestamp,
    dailyTaskId: task.id,
    endedAt: null,
    id: 'active-session',
    notes: null,
    startedAt: new Date('2026-09-03T08:15:00.000Z'),
    studentProfileId: profile.id,
    subjectId: subject.id,
    updatedAt: timestamp,
  })
  const services = createStudyTrackingServices(store, () => timestamp)
  const finished = await services.sessions.finish(student, 'active-session', { notes: 'Done' })

  assert.deepEqual(finished.endedAt, timestamp)
  assert.equal(finished.durationMinutes, 45)
  assert.equal(finished.notes, 'Done')

  await assert.rejects(
    services.sessions.finish(student, 'active-session', {}),
    (error: unknown) => error instanceof ApiError && error.code === 'SESSION_ALREADY_FINISHED',
  )

  store.sessions.push({
    ...store.sessions[0]!,
    endedAt: null,
    id: 'foreign-session',
    studentProfileId: 'other-profile',
  })
  await assert.rejects(
    services.sessions.finish(student, 'foreign-session', {}),
    (error: unknown) => error instanceof ApiError && error.code === 'SESSION_NOT_FOUND',
  )
})

test('finishing rejects a server end time that is not after session start', async () => {
  const store = createStore()
  store.sessions.push({
    createdAt: timestamp,
    dailyTaskId: task.id,
    endedAt: null,
    id: 'future-session',
    notes: null,
    startedAt: new Date('2026-09-03T10:00:00.000Z'),
    studentProfileId: profile.id,
    subjectId: subject.id,
    updatedAt: timestamp,
  })
  const services = createStudyTrackingServices(store, () => timestamp)

  await assert.rejects(
    services.sessions.finish(student, 'future-session', {}),
    (error: unknown) => error instanceof ApiError && error.code === 'SESSION_TIME_INVALID',
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

  assert.equal('studentProfileId' in session, false)
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

test('student switches A to B to A as three sequential sessions without changing tasks', async () => {
  const store = createStore()
  store.findTaskById = async (profileId, id) => {
    if (profileId !== profile.id) return null
    if (id === task.id) return task
    if (id === secondTask.id) return secondTask
    return null
  }
  const times = [
    new Date('2026-09-03T09:00:00.000Z'),
    new Date('2026-09-03T09:25:00.000Z'),
    new Date('2026-09-03T09:50:00.000Z'),
  ]
  const services = createStudyTrackingServices(store, () => times.shift()!)

  const firstBiology = await services.sessions.startTask(student, task.id)
  const mathematics = await services.sessions.switchTask(student, secondTask.id)
  const secondBiology = await services.sessions.switchTask(student, task.id)

  assert.equal(mathematics.finishedSession?.id, firstBiology.id)
  assert.deepEqual(mathematics.finishedSession?.endedAt, new Date('2026-09-03T09:25:00.000Z'))
  assert.equal(mathematics.activeSession.dailyTaskId, secondTask.id)
  assert.equal(secondBiology.finishedSession?.id, mathematics.activeSession.id)
  assert.equal(secondBiology.activeSession.dailyTaskId, task.id)
  assert.notEqual(secondBiology.activeSession.id, firstBiology.id)
  assert.equal(store.sessions.length, 3)
  assert.deepEqual(store.sessions.map(({ dailyTaskId }) => dailyTaskId), [task.id, secondTask.id, task.id])
  assert.equal(task.status, 'PENDING')
  assert.equal(secondTask.status, 'PENDING')
})

test('switch starts safely when none is active and reuses an already-active target', async () => {
  const store = createStore()
  const services = createStudyTrackingServices(store, () => timestamp)

  const started = await services.sessions.switchTask(student, task.id)
  const retried = await services.sessions.switchTask(student, task.id)

  assert.equal(started.finishedSession, null)
  assert.equal(retried.finishedSession, null)
  assert.equal(retried.activeSession.id, started.activeSession.id)
  assert.equal(store.sessions.length, 1)
})

test('serialized concurrent starts retain one live session and same-task retries reuse it', async () => {
  const store = createStore()
  store.findTaskById = async (profileId, id) => {
    if (profileId !== profile.id) return null
    return id === task.id ? task : id === secondTask.id ? secondTask : null
  }
  const services = createStudyTrackingServices(store, () => timestamp)

  const sameTask = await Promise.all([
    services.sessions.startTask(student, task.id),
    services.sessions.startTask(student, task.id),
  ])
  assert.equal(sameTask[0]?.id, sameTask[1]?.id)
  assert.equal(store.sessions.filter(({ endedAt }) => endedAt === null).length, 1)

  const otherTask = await Promise.allSettled([
    services.sessions.startTask(student, secondTask.id),
    services.sessions.startTask(student, secondTask.id),
  ])
  assert.equal(otherTask.every(({ status }) => status === 'rejected'), true)
  for (const result of otherTask) {
    if (result.status === 'rejected') {
      assert.equal(result.reason instanceof ApiError, true)
      assert.equal(result.reason.code, 'ACTIVE_STUDY_SESSION_EXISTS')
    }
  }
  assert.equal(store.sessions.filter(({ endedAt }) => endedAt === null).length, 1)
})

test('serialized concurrent switch and start cannot leave duplicate live sessions', async () => {
  const store = createStore()
  const thirdTask = { ...task, id: 'task-3' }
  store.findTaskById = async (profileId, id) => {
    if (profileId !== profile.id) return null
    return [task, secondTask, thirdTask].find((candidate) => candidate.id === id) ?? null
  }
  const times = [
    new Date('2026-09-03T08:00:00.000Z'),
    new Date('2026-09-03T08:25:00.000Z'),
    new Date('2026-09-03T08:25:00.000Z'),
  ]
  const services = createStudyTrackingServices(store, () => times.shift()!)
  await services.sessions.startTask(student, task.id)

  const results = await Promise.allSettled([
    services.sessions.switchTask(student, secondTask.id),
    services.sessions.startTask(student, thirdTask.id),
  ])

  assert.equal(results.filter(({ status }) => status === 'fulfilled').length, 1)
  assert.equal(results.filter(({ status }) => status === 'rejected').length, 1)
  assert.equal(store.sessions.filter(({ endedAt }) => endedAt === null).length, 1)
})

test('active-session query is owner scoped and generic update cannot reopen or edit live state', async () => {
  const store = createStore()
  const times = [
    new Date('2026-09-03T08:00:00.000Z'),
    timestamp,
  ]
  const services = createStudyTrackingServices(store, () => times.shift()!)
  const active = await services.sessions.startTask(student, task.id)

  assert.equal((await services.sessions.active(student))?.id, active.id)
  assert.equal(await createStudyTrackingServices(createStore()).sessions.active(student), null)
  await assert.rejects(
    services.sessions.update(student, active.id, { notes: 'client edit' }),
    (error: unknown) => error instanceof ApiError && error.code === 'SESSION_ACTIVE_UPDATE_FORBIDDEN',
  )

  const finished = await services.sessions.finish(student, active.id, {})
  const edited = await services.sessions.update(student, finished.id, {
    endedAt: '2026-09-03T09:10:00.000Z',
    startedAt: '2026-09-03T08:30:00.000Z',
  })
  assert.equal(edited.durationMinutes, 40)
  assert.equal(await services.sessions.active(student), null)
})
