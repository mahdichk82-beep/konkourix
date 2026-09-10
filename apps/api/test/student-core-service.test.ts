import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError } from '../src/errors/api-error.js'
import { createStudentCoreServices, type StudentCoreStore } from '../src/student-core/services.js'
import type {
  DailyTaskRecord,
  DomainStudent,
  StudyPlanRecord,
  StudySubjectRecord,
  TopicRecord,
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
  topics: TopicRecord[]
  plans: StudyPlanRecord[]
  tasks: DailyTaskRecord[]
} => {
  const store = {
    subjects: [] as StudySubjectRecord[],
    topics: [] as TopicRecord[],
    plans: [] as StudyPlanRecord[],
    tasks: [] as DailyTaskRecord[],
    async findStudentProfileByUserId(userId: string) {
      return userId === profile.userId ? profile : null
    },
    async listSubjects() { return store.subjects },
    async findSubjectById(profileId: string, id: string) {
      return store.subjects.find((subject) => subject.id === id && subject.studentProfileId === profileId) ?? null
    },
    async createSubject(input: { studentProfileId: string; name: string; normalizedName: string }) {
      const record = { id: `subject-${store.subjects.length + 1}`, ...input, archivedAt: null, createdAt: timestamp, updatedAt: timestamp }
      store.subjects.push(record)
      return record
    },
    async updateSubject(profileId: string, id: string, input: { name?: string; normalizedName?: string; archivedAt?: Date | null }) {
      const subject = store.subjects.find((item) => item.id === id && item.studentProfileId === profileId)
      if (!subject) return null
      Object.assign(subject, input, { updatedAt: timestamp })
      return subject
    },
    async listTopics(profileId: string, subjectId: string) {
      const ownedSubjectIds = new Set(
        store.subjects
          .filter((subject) => subject.studentProfileId === profileId)
          .map((subject) => subject.id),
      )
      return store.topics.filter((topic) => topic.subjectId === subjectId && ownedSubjectIds.has(topic.subjectId))
    },
    async findTopicById(profileId: string, id: string) {
      const topic = store.topics.find((item) => item.id === id)
      if (!topic) return null
      return store.subjects.some((subject) =>
        subject.id === topic.subjectId && subject.studentProfileId === profileId,
      ) ? topic : null
    },
    async createTopic(input: { subjectId: string; title: string; normalizedTitle: string }) {
      const record = { id: `topic-${store.topics.length + 1}`, ...input, archivedAt: null, createdAt: timestamp, updatedAt: timestamp }
      store.topics.push(record)
      return record
    },
    async updateTopic(profileId: string, id: string, input: { title?: string; normalizedTitle?: string; archivedAt?: Date | null }) {
      const topic = await store.findTopicById(profileId, id)
      if (!topic) return null
      Object.assign(topic, input, { updatedAt: timestamp })
      return topic
    },
    async listPlans() { return store.plans },
    async findPlanById(profileId: string, id: string) { return store.plans.find((plan) => plan.id === id && plan.studentProfileId === profileId) ?? null },
    async createPlan(input: Omit<StudyPlanRecord, 'id' | 'createdAt' | 'updatedAt'>) {
      const record = { id: `plan-${store.plans.length + 1}`, ...input, createdAt: timestamp, updatedAt: timestamp }
      store.plans.push(record)
      return record
    },
    async updatePlan(profileId: string, id: string, input: Partial<Pick<StudyPlanRecord, 'title' | 'description' | 'status' | 'startsOn' | 'endsOn'>>) {
      const plan = store.plans.find((item) => item.id === id && item.studentProfileId === profileId)
      if (!plan) return null
      Object.assign(plan, input, { updatedAt: timestamp })
      return plan
    },
    async listTasks() { return store.tasks },
    async findTaskById(profileId: string, id: string) { return store.tasks.find((task) => task.id === id && task.studentProfileId === profileId) ?? null },
    async createTask(input: Omit<DailyTaskRecord, 'id' | 'createdAt' | 'updatedAt'>) {
      const record = { id: `task-${store.tasks.length + 1}`, ...input, createdAt: timestamp, updatedAt: timestamp }
      store.tasks.push(record)
      return record
    },
    async updateTask(profileId: string, id: string, input: Partial<Pick<DailyTaskRecord, 'studyPlanId' | 'subjectId' | 'title' | 'description' | 'scheduledFor' | 'estimatedMinutes' | 'status' | 'completedAt'>>) {
      const task = store.tasks.find((item) => item.id === id && item.studentProfileId === profileId)
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

test('student core creates normalized topics and rejects duplicate names in a subject', async () => {
  const store = createStore()
  store.subjects.push({
    id: 'subject-1',
    studentProfileId: profile.id,
    name: 'Mathematics',
    normalizedName: 'mathematics',
    archivedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  const services = createStudentCoreServices(store, () => timestamp)

  const topic = await services.topics.create(student, 'subject-1', { title: '  Functions  ' })
  assert.equal(topic.title, 'Functions')
  assert.equal(topic.normalizedTitle, 'functions')
  assert.equal(topic.subjectId, 'subject-1')

  store.createTopic = async () => {
    throw { code: 'P2002' }
  }
  await assert.rejects(
    services.topics.create(student, 'subject-1', { title: 'functions' }),
    (error: unknown) => error instanceof ApiError && error.code === 'TOPIC_CONFLICT',
  )
})

test('student core hides foreign subjects and topics from topic operations', async () => {
  const store = createStore()
  store.subjects.push({
    id: 'foreign-subject',
    studentProfileId: 'student-profile-2',
    name: 'Private subject',
    normalizedName: 'private subject',
    archivedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  store.topics.push({
    id: 'foreign-topic',
    subjectId: 'foreign-subject',
    title: 'Private topic',
    normalizedTitle: 'private topic',
    archivedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  const services = createStudentCoreServices(store, () => timestamp)

  await assert.rejects(
    services.topics.list(student, 'foreign-subject'),
    (error: unknown) => error instanceof ApiError && error.code === 'SUBJECT_NOT_FOUND',
  )
  await assert.rejects(
    services.topics.create(student, 'foreign-subject', { title: 'Escalated topic' }),
    (error: unknown) => error instanceof ApiError && error.code === 'SUBJECT_NOT_FOUND',
  )
  await assert.rejects(
    services.topics.update(student, 'foreign-topic', { title: 'Changed' }),
    (error: unknown) => error instanceof ApiError && error.code === 'TOPIC_NOT_FOUND',
  )
  assert.equal(store.topics[0]?.title, 'Private topic')
})

test('student core rejects an invalid subject for topic creation', async () => {
  const services = createStudentCoreServices(createStore(), () => timestamp)

  await assert.rejects(
    services.topics.create(student, 'missing-subject', { title: 'Functions' }),
    (error: unknown) => error instanceof ApiError && error.code === 'SUBJECT_NOT_FOUND',
  )
})

test('student core renames and archives only an owned topic', async () => {
  const store = createStore()
  store.subjects.push({
    id: 'subject-1',
    studentProfileId: profile.id,
    name: 'Physics',
    normalizedName: 'physics',
    archivedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  store.topics.push({
    id: 'topic-1',
    subjectId: 'subject-1',
    title: 'Motion',
    normalizedTitle: 'motion',
    archivedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  const services = createStudentCoreServices(store, () => timestamp)

  const renamed = await services.topics.update(student, 'topic-1', { title: '  Dynamics  ' })
  assert.equal(renamed.title, 'Dynamics')
  assert.equal(renamed.normalizedTitle, 'dynamics')

  const archived = await services.topics.update(student, 'topic-1', { archived: true })
  assert.deepEqual(archived.archivedAt, timestamp)
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

  const skipped = await services.tasks.update(student, task.id, { status: 'SKIPPED' })
  assert.equal(skipped.status, 'SKIPPED')
  assert.equal(skipped.completedAt, null)

  const reopened = await services.tasks.update(student, task.id, { status: 'PENDING' })
  assert.equal(reopened.status, 'PENDING')
  assert.equal(reopened.completedAt, null)

  await assert.rejects(
    services.tasks.get({ id: 'other-student', role: 'STUDENT', status: 'ACTIVE' }, task.id),
    (error: unknown) => error instanceof ApiError && error.code === 'STUDENT_PROFILE_REQUIRED',
  )
})

test('student core hides another student task from get and update operations', async () => {
  const store = createStore()
  store.tasks.push({
    id: 'foreign-task',
    studentProfileId: 'student-profile-2',
    studyPlanId: null,
    subjectId: null,
    title: 'Private task',
    description: null,
    scheduledFor: timestamp,
    estimatedMinutes: 20,
    status: 'PENDING',
    completedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  const services = createStudentCoreServices(store, () => timestamp)

  await assert.rejects(
    services.tasks.get(student, 'foreign-task'),
    (error: unknown) => error instanceof ApiError && error.code === 'TASK_NOT_FOUND',
  )
  await assert.rejects(
    services.tasks.update(student, 'foreign-task', { status: 'COMPLETED' }),
    (error: unknown) => error instanceof ApiError && error.code === 'TASK_NOT_FOUND',
  )
  assert.equal(store.tasks[0]?.status, 'PENDING')
})

test('student core rejects another student subject on task create and update', async () => {
  const store = createStore()
  store.subjects.push({
    id: 'foreign-subject',
    studentProfileId: 'student-profile-2',
    name: 'Private subject',
    normalizedName: 'private subject',
    archivedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  const services = createStudentCoreServices(store, () => timestamp)
  const task = await services.tasks.create(student, {
    title: 'Own task',
    description: null,
    scheduledFor: '2026-09-03',
    estimatedMinutes: null,
    status: 'PENDING',
    studyPlanId: null,
    subjectId: null,
  })

  await assert.rejects(
    services.tasks.create(student, {
      title: 'Invalid task',
      description: null,
      scheduledFor: '2026-09-03',
      estimatedMinutes: null,
      status: 'PENDING',
      studyPlanId: null,
      subjectId: 'foreign-subject',
    }),
    (error: unknown) => error instanceof ApiError && error.code === 'SUBJECT_NOT_FOUND',
  )
  await assert.rejects(
    services.tasks.update(student, task.id, { subjectId: 'foreign-subject' }),
    (error: unknown) => error instanceof ApiError && error.code === 'SUBJECT_NOT_FOUND',
  )
  assert.equal(store.tasks.length, 1)
  assert.equal(store.tasks[0]?.subjectId, null)
})

test('student core rejects another student study plan on task create and update', async () => {
  const store = createStore()
  store.plans.push({
    id: 'foreign-plan',
    studentProfileId: 'student-profile-2',
    title: 'Private plan',
    description: null,
    status: 'ACTIVE',
    startsOn: timestamp,
    endsOn: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  const services = createStudentCoreServices(store, () => timestamp)
  const task = await services.tasks.create(student, {
    title: 'Own task',
    description: null,
    scheduledFor: '2026-09-03',
    estimatedMinutes: null,
    status: 'PENDING',
    studyPlanId: null,
    subjectId: null,
  })

  await assert.rejects(
    services.tasks.create(student, {
      title: 'Invalid task',
      description: null,
      scheduledFor: '2026-09-03',
      estimatedMinutes: null,
      status: 'PENDING',
      studyPlanId: 'foreign-plan',
      subjectId: null,
    }),
    (error: unknown) => error instanceof ApiError && error.code === 'PLAN_NOT_FOUND',
  )
  await assert.rejects(
    services.tasks.update(student, task.id, { studyPlanId: 'foreign-plan' }),
    (error: unknown) => error instanceof ApiError && error.code === 'PLAN_NOT_FOUND',
  )
  assert.equal(store.tasks.length, 1)
  assert.equal(store.tasks[0]?.studyPlanId, null)
})

test('student core rejects archived subjects for new task assignments', async () => {
  const store = createStore()
  store.subjects.push({
    id: 'archived-subject',
    studentProfileId: profile.id,
    name: 'Archived subject',
    normalizedName: 'archived subject',
    archivedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  const services = createStudentCoreServices(store, () => timestamp)

  await assert.rejects(
    services.tasks.create(student, {
      title: 'Invalid task',
      description: null,
      scheduledFor: '2026-09-03',
      estimatedMinutes: null,
      status: 'PENDING',
      studyPlanId: null,
      subjectId: 'archived-subject',
    }),
    (error: unknown) => error instanceof ApiError && error.code === 'SUBJECT_ARCHIVED',
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
