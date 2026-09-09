import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError } from '../src/errors/api-error.js'
import { createStudentCoreServices, type StudentCoreStore } from '../src/student-core/services.js'
import type {
  DailyTaskRecord,
  DomainStudent,
  StudyPlanRecord,
  StudySubjectRecord,
} from '../src/student-core/types.js'

const student: DomainStudent = {
  id: 'student-user-1',
  role: 'STUDENT',
  status: 'ACTIVE',
}

const profile = { id: 'student-profile-1', userId: student.id }
const timestamp = new Date('2026-09-03T00:00:00.000Z')

const createStore = (): StudentCoreStore & {
  subjects: StudySubjectRecord[]
  plans: StudyPlanRecord[]
  tasks: DailyTaskRecord[]
} => {
  const store = {
    subjects: [] as StudySubjectRecord[],
    plans: [] as StudyPlanRecord[],
    tasks: [] as DailyTaskRecord[],
    async findStudentProfileByUserId(userId: string) {
      return userId === profile.userId ? profile : null
    },
    async listSubjects() { return store.subjects },
    async findSubjectById(_profileId: string, id: string) {
      return store.subjects.find((subject) => subject.id === id) ?? null
    },
    async createSubject(input: { studentProfileId: string; name: string; normalizedName: string }) {
      const record = { id: `subject-${store.subjects.length + 1}`, ...input, archivedAt: null, createdAt: timestamp, updatedAt: timestamp }
      store.subjects.push(record)
      return record
    },
    async updateSubject(_profileId: string, id: string, input: { name?: string; normalizedName?: string; archivedAt?: Date | null }) {
      const subject = store.subjects.find((item) => item.id === id)
      if (!subject) return null
      Object.assign(subject, input, { updatedAt: timestamp })
      return subject
    },
    async listPlans() { return store.plans },
    async findPlanById(_profileId: string, id: string) { return store.plans.find((plan) => plan.id === id) ?? null },
    async createPlan(input: Omit<StudyPlanRecord, 'id' | 'createdAt' | 'updatedAt'>) {
      const record = { id: `plan-${store.plans.length + 1}`, ...input, createdAt: timestamp, updatedAt: timestamp }
      store.plans.push(record)
      return record
    },
    async updatePlan(_profileId: string, id: string, input: Partial<Pick<StudyPlanRecord, 'title' | 'description' | 'status' | 'startsOn' | 'endsOn'>>) {
      const plan = store.plans.find((item) => item.id === id)
      if (!plan) return null
      Object.assign(plan, input, { updatedAt: timestamp })
      return plan
    },
    async listTasks() { return store.tasks },
    async findTaskById(_profileId: string, id: string) { return store.tasks.find((task) => task.id === id) ?? null },
    async createTask(input: Omit<DailyTaskRecord, 'id' | 'createdAt' | 'updatedAt'>) {
      const record = { id: `task-${store.tasks.length + 1}`, ...input, createdAt: timestamp, updatedAt: timestamp }
      store.tasks.push(record)
      return record
    },
    async updateTask(_profileId: string, id: string, input: Partial<Pick<DailyTaskRecord, 'studyPlanId' | 'subjectId' | 'title' | 'description' | 'scheduledFor' | 'estimatedMinutes' | 'status' | 'completedAt'>>) {
      const task = store.tasks.find((item) => item.id === id)
      if (!task) return null
      Object.assign(task, input, { updatedAt: timestamp })
      return task
    },
  }
  return store
}

const prismaPage = <T extends { id: string }>(
  items: T[],
  query?: { cursor?: string; limit?: number },
): T[] => {
  const start = query?.cursor
    ? Math.max(items.findIndex((item) => item.id === query.cursor) + 1, 0)
    : 0
  return items.slice(start, start + (query?.limit ?? 50) + 1)
}

test('student core creates normalized subjects and rejects duplicate ownership', async () => {
  const store = createStore()
  const services = createStudentCoreServices(store, () => timestamp)
  const subject = await services.subjects.create(student, { name: '  Mathematics  ' })

  assert.equal(subject.name, 'Mathematics')
  assert.equal(subject.normalizedName, 'mathematics')

  store.createSubject = async () => {
    throw { code: 'P2002' }
  }
  await assert.rejects(
    services.subjects.create(student, { name: 'mathematics' }),
    (error: unknown) => error instanceof ApiError && error.code === 'SUBJECT_CONFLICT',
  )
})

test('student core rejects plans whose end date precedes the start date', async () => {
  const store = createStore()
  const services = createStudentCoreServices(store, () => timestamp)

  await assert.rejects(
    services.plans.create(student, {
      title: 'Exam preparation',
      description: null,
      startsOn: '2026-09-10',
      endsOn: '2026-09-01',
    }),
    (error: unknown) => error instanceof ApiError && error.code === 'PLAN_DATE_INVALID',
  )
})

test('student core completes tasks with a completion timestamp and protects ownership', async () => {
  const store = createStore()
  const services = createStudentCoreServices(store, () => timestamp)
  const task = await services.tasks.create(student, {
    title: 'Read chapter one',
    description: null,
    scheduledFor: '2026-09-03',
    estimatedMinutes: 30,
    status: 'PENDING',
    studyPlanId: null,
    subjectId: null,
  })

  const updated = await services.tasks.update(student, task.id, { status: 'COMPLETED' })
  assert.equal(updated.status, 'COMPLETED')
  assert.deepEqual(updated.completedAt, timestamp)

  await assert.rejects(
    services.tasks.get({ id: 'other-student', role: 'STUDENT', status: 'ACTIVE' }, task.id),
    (error: unknown) => error instanceof ApiError && error.code === 'STUDENT_PROFILE_REQUIRED',
  )
})

test('student core plan and task pages use lookahead rows without repeating the cursor', async () => {
  const store = createStore()
  store.plans.push(
    ...['plan-1', 'plan-2', 'plan-3'].map((id, index): StudyPlanRecord => ({
      id,
      studentProfileId: profile.id,
      title: id,
      description: null,
      status: 'ACTIVE',
      startsOn: new Date(`2026-09-0${3 - index}T00:00:00.000Z`),
      endsOn: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
  )
  store.tasks.push(
    ...['task-1', 'task-2', 'task-3'].map((id, index): DailyTaskRecord => ({
      id,
      studentProfileId: profile.id,
      studyPlanId: null,
      subjectId: null,
      title: id,
      description: null,
      scheduledFor: new Date(`2026-09-0${3 - index}T00:00:00.000Z`),
      estimatedMinutes: null,
      status: 'PENDING',
      completedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
  )
  store.listPlans = async (_profileId, query) => prismaPage(store.plans, query)
  store.listTasks = async (_profileId, query) => prismaPage(store.tasks, query)
  const services = createStudentCoreServices(store)

  const planPage1 = await services.plans.list(student, { limit: 2 })
  const planPage2 = await services.plans.list(student, { cursor: 'plan-2', limit: 2 })
  assert.deepEqual(planPage1.items.map(({ id }) => id), ['plan-1', 'plan-2'])
  assert.equal(planPage1.nextCursor, 'plan-2')
  assert.deepEqual(planPage2.items.map(({ id }) => id), ['plan-3'])
  assert.equal(planPage2.nextCursor, null)

  const taskPage1 = await services.tasks.list(student, { limit: 2 })
  const taskPage2 = await services.tasks.list(student, { cursor: 'task-2', limit: 2 })
  assert.deepEqual(taskPage1.items.map(({ id }) => id), ['task-1', 'task-2'])
  assert.equal(taskPage1.nextCursor, 'task-2')
  assert.deepEqual(taskPage2.items.map(({ id }) => id), ['task-3'])
  assert.equal(taskPage2.nextCursor, null)
})
