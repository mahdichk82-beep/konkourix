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
