import assert from 'node:assert/strict'
import test from 'node:test'
import type { AuthService } from '../src/auth/auth-service.js'
import type { PublicUser } from '../src/auth/types.js'
import {
  createCounselorTaskServices,
  type CounselorTaskStore,
} from '../src/counselor-tasks/services.js'
import type {
  CounselorStudentSubject,
  CounselorStudentTopic,
  CounselorTaskView,
  CreateCounselorTaskRecordInput,
} from '../src/counselor-tasks/types.js'
import { ApiError } from '../src/errors/api-error.js'
import { buildApp } from '../src/app.js'
import type { DailyTaskRecord } from '../src/student-core/types.js'

const ids = {
  counselorA: '10000000-0000-4000-8000-000000000001',
  counselorB: '10000000-0000-4000-8000-000000000002',
  studentUser: '20000000-0000-4000-8000-000000000001',
  studentA: '30000000-0000-4000-8000-000000000001',
  studentB: '30000000-0000-4000-8000-000000000002',
  studentUnassigned: '30000000-0000-4000-8000-000000000003',
  subjectA: '40000000-0000-4000-8000-000000000001',
  subjectB: '40000000-0000-4000-8000-000000000002',
  archivedSubject: '40000000-0000-4000-8000-000000000003',
  topicA: '50000000-0000-4000-8000-000000000001',
  topicB: '50000000-0000-4000-8000-000000000002',
  archivedTopic: '50000000-0000-4000-8000-000000000003',
} as const

const timestamp = new Date('2026-09-11T00:00:00.000Z')

const publicUser = (id: string, role: PublicUser['role']): PublicUser => ({
  id,
  email: `${id}@example.com`,
  phone: null,
  role,
  status: 'ACTIVE',
  createdAt: timestamp,
  updatedAt: timestamp,
})

const usersByToken = new Map<string, PublicUser>([
  ['counselor-a', publicUser(ids.counselorA, 'COUNSELOR')],
  ['counselor-b', publicUser(ids.counselorB, 'COUNSELOR')],
  ['student', publicUser(ids.studentUser, 'STUDENT')],
])

const createAuth = (): AuthService => ({
  authenticateAccessToken: async (token) => {
    const user = usersByToken.get(token)
    if (!user) throw new ApiError(401, 'TOKEN_INVALID', 'Access token is invalid')
    return user
  },
  changePassword: async () => undefined,
  getCurrentUser: async () => { throw new Error('not used') },
  login: async () => { throw new Error('not used') },
  logout: async () => undefined,
  logoutAll: async () => undefined,
  refresh: async () => { throw new Error('not used') },
  register: async () => { throw new Error('not used') },
})

type SubjectFixture = CounselorStudentSubject & {
  archived: boolean
  studentProfileId: string
}
type TopicFixture = CounselorStudentTopic & { archived: boolean }

const subjectFixtures: SubjectFixture[] = [
  { id: ids.subjectA, name: 'زیست‌شناسی', studentProfileId: ids.studentA, archived: false },
  { id: ids.subjectB, name: 'ریاضی', studentProfileId: ids.studentB, archived: false },
  { id: ids.archivedSubject, name: 'درس بایگانی', studentProfileId: ids.studentA, archived: true },
]
const topicFixtures: TopicFixture[] = [
  { id: ids.topicA, subjectId: ids.subjectA, title: 'ژنتیک', archived: false },
  { id: ids.topicB, subjectId: ids.subjectB, title: 'تابع', archived: false },
  { id: ids.archivedTopic, subjectId: ids.subjectA, title: 'مبحث بایگانی', archived: true },
]

const assignments = new Map<string, string[]>([
  [ids.counselorA, [ids.studentA]],
  [ids.counselorB, [ids.studentB]],
])

const createStore = (): CounselorTaskStore & { tasks: DailyTaskRecord[] } => {
  const store = {
    tasks: [] as DailyTaskRecord[],
    async listAssignedStudentTasks(
      counselorUserId: string,
      studentProfileId: string,
      query: { cursor?: string; limit?: number },
    ) {
      if (!(assignments.get(counselorUserId) ?? []).includes(studentProfileId)) {
        return { ok: false as const, reason: 'STUDENT_NOT_FOUND' as const }
      }
      const tasks: CounselorTaskView[] = store.tasks
        .filter((task) => task.studentProfileId === studentProfileId)
        .map(({ createdByUserId: _createdByUserId, ...task }) => task)
      const start = query.cursor
        ? Math.max(tasks.findIndex(({ id }) => id === query.cursor) + 1, 0)
        : 0
      return {
        ok: true as const,
        value: tasks.slice(start, start + (query.limit ?? 50) + 1),
      }
    },
    async listAssignedStudentSubjects(
      counselorUserId: string,
      studentProfileId: string,
      query: { cursor?: string; limit?: number },
    ) {
      if (!(assignments.get(counselorUserId) ?? []).includes(studentProfileId)) {
        return { ok: false as const, reason: 'STUDENT_NOT_FOUND' as const }
      }
      const subjects = subjectFixtures
        .filter((subject) => subject.studentProfileId === studentProfileId && !subject.archived)
        .map(({ id, name }) => ({ id, name }))
      const start = query.cursor
        ? Math.max(subjects.findIndex(({ id }) => id === query.cursor) + 1, 0)
        : 0
      return {
        ok: true as const,
        value: subjects.slice(start, start + (query.limit ?? 50) + 1),
      }
    },
    async listAssignedStudentTopics(
      counselorUserId: string,
      studentProfileId: string,
      subjectId: string,
      query: { cursor?: string; limit?: number },
    ) {
      if (!(assignments.get(counselorUserId) ?? []).includes(studentProfileId)) {
        return { ok: false as const, reason: 'STUDENT_NOT_FOUND' as const }
      }
      const subject = subjectFixtures.find((candidate) =>
        candidate.id === subjectId
        && candidate.studentProfileId === studentProfileId
        && !candidate.archived,
      )
      if (!subject) return { ok: false as const, reason: 'SUBJECT_NOT_FOUND' as const }
      const topics = topicFixtures
        .filter((topic) => topic.subjectId === subjectId && !topic.archived)
        .map(({ id, title }) => ({ id, subjectId, title }))
      const start = query.cursor
        ? Math.max(topics.findIndex(({ id }) => id === query.cursor) + 1, 0)
        : 0
      return {
        ok: true as const,
        value: topics.slice(start, start + (query.limit ?? 50) + 1),
      }
    },
    async createAssignedStudentTask(
      counselorUserId: string,
      studentProfileId: string,
      input: CreateCounselorTaskRecordInput,
    ) {
      if (!(assignments.get(counselorUserId) ?? []).includes(studentProfileId)) {
        return { ok: false as const, reason: 'STUDENT_NOT_FOUND' as const }
      }
      if (input.subjectId) {
        const subject = subjectFixtures.find((candidate) =>
          candidate.id === input.subjectId && candidate.studentProfileId === studentProfileId,
        )
        if (!subject) return { ok: false as const, reason: 'SUBJECT_NOT_FOUND' as const }
        if (subject.archived) return { ok: false as const, reason: 'SUBJECT_ARCHIVED' as const }
      }
      if (input.topicId) {
        if (!input.subjectId) {
          return { ok: false as const, reason: 'TOPIC_SUBJECT_REQUIRED' as const }
        }
        const ownedSubjectIds = new Set(
          subjectFixtures
            .filter(({ studentProfileId: owner }) => owner === studentProfileId)
            .map(({ id }) => id),
        )
        const topic = topicFixtures.find((candidate) =>
          candidate.id === input.topicId && ownedSubjectIds.has(candidate.subjectId),
        )
        if (!topic) return { ok: false as const, reason: 'TOPIC_NOT_FOUND' as const }
        if (topic.subjectId !== input.subjectId) {
          return { ok: false as const, reason: 'TOPIC_SUBJECT_MISMATCH' as const }
        }
        if (topic.archived) return { ok: false as const, reason: 'TOPIC_ARCHIVED' as const }
      }
      const record: DailyTaskRecord = {
        id: `60000000-0000-4000-8000-${String(store.tasks.length + 1).padStart(12, '0')}`,
        ...input,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      store.tasks.push(record)
      return { ok: true as const, value: record }
    },
  }
  return store
}

const createApp = (store = createStore()) => ({
  app: buildApp({
    auth: createAuth(),
    counselorTasks: createCounselorTaskServices(store),
    environment: 'test',
    logger: false,
    prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  }),
  store,
})

const createRequest = (
  app: ReturnType<typeof createApp>['app'],
  token: string,
  studentProfileId: string,
  payload: Record<string, unknown>,
) => app.inject({
  headers: { authorization: `Bearer ${token}` },
  method: 'POST',
  payload,
  url: `/api/v1/counselor/students/${studentProfileId}/tasks`,
})

const listRequest = (
  app: ReturnType<typeof createApp>['app'],
  studentProfileId: string,
  token?: string,
) => app.inject({
  headers: token ? { authorization: `Bearer ${token}` } : undefined,
  method: 'GET',
  url: `/api/v1/counselor/students/${studentProfileId}/tasks`,
})

const taskRecord = (
  id: string,
  overrides: Partial<DailyTaskRecord> = {},
): DailyTaskRecord => ({
  completedAt: null,
  createdAt: timestamp,
  createdByUserId: ids.studentUser,
  description: null,
  estimatedMinutes: null,
  id,
  scheduledFor: new Date('2026-09-12T00:00:00.000Z'),
  source: 'PERSONAL',
  status: 'PENDING',
  studentProfileId: ids.studentA,
  studyPlanId: null,
  subjectId: null,
  title: 'Task',
  topicId: null,
  updatedAt: timestamp,
  ...overrides,
})

test('assigned counselor sees personal and counselor-created tasks without creator identity', async () => {
  const { app, store } = createApp()
  const completedAt = new Date('2026-09-12T10:30:00.000Z')
  store.tasks.push(
    taskRecord('60000000-0000-4000-8000-000000000010', {
      completedAt,
      status: 'COMPLETED',
      title: 'Personal completed task',
    }),
    taskRecord('60000000-0000-4000-8000-000000000011', {
      createdByUserId: ids.counselorB,
      source: 'COUNSELOR',
      title: 'Counselor task',
    }),
    taskRecord('60000000-0000-4000-8000-000000000012', {
      studentProfileId: ids.studentB,
      title: 'Other student task',
    }),
  )

  const response = await listRequest(app, ids.studentA, 'counselor-a')

  assert.equal(response.statusCode, 200)
  assert.deepEqual(
    response.json().data.items.map((task: { source: string }) => task.source),
    ['PERSONAL', 'COUNSELOR'],
  )
  assert.equal(response.json().data.items[0].completedAt, completedAt.toISOString())
  assert.equal(response.json().data.items[0].status, 'COMPLETED')
  assert.equal(response.json().data.items[1].status, 'PENDING')
  assert.equal(
    response.json().data.items.every((task: Record<string, unknown>) => !('createdByUserId' in task)),
    true,
  )
  await app.close()
})

test('counselor cannot list tasks for unassigned or another counselor assigned students', async () => {
  const { app } = createApp()

  for (const studentProfileId of [ids.studentUnassigned, ids.studentB]) {
    const response = await listRequest(app, studentProfileId, 'counselor-a')
    assert.equal(response.statusCode, 404)
    assert.equal(response.json().error.code, 'STUDENT_NOT_FOUND')
  }
  await app.close()
})

test('student and unauthenticated callers cannot list counselor-scoped tasks', async () => {
  const { app } = createApp()
  const studentResponse = await listRequest(app, ids.studentA, 'student')
  assert.equal(studentResponse.statusCode, 403)
  assert.equal(studentResponse.json().error.code, 'ROLE_FORBIDDEN')

  const unauthenticated = await listRequest(app, ids.studentA)
  assert.equal(unauthenticated.statusCode, 401)
  assert.equal(unauthenticated.json().error.code, 'TOKEN_MISSING')
  await app.close()
})

test('assigned counselor creates a pending counselor task with server-owned provenance', async () => {
  const { app, store } = createApp()
  const response = await createRequest(app, 'counselor-a', ids.studentA, {
    title: 'مرور ژنتیک',
    description: 'فصل وراثت مرور شود',
    scheduledFor: '2026-09-12',
    estimatedMinutes: 45,
    subjectId: ids.subjectA,
    topicId: ids.topicA,
  })

  assert.equal(response.statusCode, 201)
  assert.equal(response.json().data.source, 'COUNSELOR')
  assert.equal(response.json().data.status, 'PENDING')
  assert.equal(response.json().data.completedAt, null)
  assert.equal(response.json().data.studentProfileId, ids.studentA)
  assert.equal(response.json().data.subjectId, ids.subjectA)
  assert.equal(response.json().data.topicId, ids.topicA)
  assert.equal(response.json().data.studyPlanId, null)
  assert.equal('createdByUserId' in response.json().data, false)
  assert.equal(store.tasks[0]?.createdByUserId, ids.counselorA)
  assert.equal(store.tasks[0]?.studentProfileId, ids.studentA)
  assert.equal(store.tasks[0]?.source, 'COUNSELOR')
  assert.equal(store.tasks[0]?.status, 'PENDING')
  assert.equal(store.tasks[0]?.completedAt, null)
  await app.close()
})

test('counselor cannot create tasks for unassigned or another counselor assigned students', async () => {
  const { app, store } = createApp()

  for (const studentProfileId of [ids.studentUnassigned, ids.studentB]) {
    const response = await createRequest(app, 'counselor-a', studentProfileId, {
      title: 'کار غیرمجاز',
      scheduledFor: '2026-09-12',
    })
    assert.equal(response.statusCode, 404)
    assert.equal(response.json().error.code, 'STUDENT_NOT_FOUND')
  }
  assert.equal(store.tasks.length, 0)
  await app.close()
})

test('student and unauthenticated callers cannot use counselor task creation', async () => {
  const { app } = createApp()
  const studentResponse = await createRequest(app, 'student', ids.studentA, {
    title: 'کار غیرمجاز',
    scheduledFor: '2026-09-12',
  })
  assert.equal(studentResponse.statusCode, 403)
  assert.equal(studentResponse.json().error.code, 'ROLE_FORBIDDEN')

  const unauthenticated = await app.inject({
    method: 'POST',
    payload: { title: 'کار غیرمجاز', scheduledFor: '2026-09-12' },
    url: `/api/v1/counselor/students/${ids.studentA}/tasks`,
  })
  assert.equal(unauthenticated.statusCode, 401)
  assert.equal(unauthenticated.json().error.code, 'TOKEN_MISSING')
  await app.close()
})

test('counselor task schema rejects forged ownership, provenance, lifecycle, and plan fields', async () => {
  const { app, store } = createApp()
  const controlledFields = [
    { source: 'PERSONAL' },
    { createdByUserId: ids.studentUser },
    { studentProfileId: ids.studentB },
    { ownerId: ids.studentUser },
    { creatorId: ids.studentUser },
    { status: 'COMPLETED' },
    { completedAt: '2026-09-12T10:00:00.000Z' },
    { studyPlanId: '70000000-0000-4000-8000-000000000001' },
  ]

  for (const controlledField of controlledFields) {
    const response = await createRequest(app, 'counselor-a', ids.studentA, {
      title: 'ورودی جعل‌شده',
      scheduledFor: '2026-09-12',
      ...controlledField,
    })
    assert.equal(response.statusCode, 400)
    assert.equal(response.json().error.code, 'VALIDATION_ERROR')
  }
  assert.equal(store.tasks.length, 0)
  await app.close()
})

test('counselor cannot attach another student subject or topic', async () => {
  const { app, store } = createApp()
  const foreignSubject = await createRequest(app, 'counselor-a', ids.studentA, {
    title: 'درس دانش‌آموز دیگر',
    scheduledFor: '2026-09-12',
    subjectId: ids.subjectB,
  })
  assert.equal(foreignSubject.statusCode, 404)
  assert.equal(foreignSubject.json().error.code, 'SUBJECT_NOT_FOUND')

  const foreignTopic = await createRequest(app, 'counselor-a', ids.studentA, {
    title: 'مبحث دانش‌آموز دیگر',
    scheduledFor: '2026-09-12',
    subjectId: ids.subjectA,
    topicId: ids.topicB,
  })
  assert.equal(foreignTopic.statusCode, 404)
  assert.equal(foreignTopic.json().error.code, 'TOPIC_NOT_FOUND')
  assert.equal(store.tasks.length, 0)
  await app.close()
})

test('counselor cannot attach archived topics or subjects', async () => {
  const { app, store } = createApp()
  const archivedTopic = await createRequest(app, 'counselor-a', ids.studentA, {
    title: 'مبحث بایگانی',
    scheduledFor: '2026-09-12',
    subjectId: ids.subjectA,
    topicId: ids.archivedTopic,
  })
  assert.equal(archivedTopic.statusCode, 409)
  assert.equal(archivedTopic.json().error.code, 'TOPIC_ARCHIVED')

  const archivedSubject = await createRequest(app, 'counselor-a', ids.studentA, {
    title: 'درس بایگانی',
    scheduledFor: '2026-09-12',
    subjectId: ids.archivedSubject,
  })
  assert.equal(archivedSubject.statusCode, 409)
  assert.equal(archivedSubject.json().error.code, 'SUBJECT_ARCHIVED')
  assert.equal(store.tasks.length, 0)
  await app.close()
})

test('counselor resource selectors expose only active resources for assigned students', async () => {
  const { app } = createApp()
  const subjects = await app.inject({
    headers: { authorization: 'Bearer counselor-a' },
    method: 'GET',
    url: `/api/v1/counselor/students/${ids.studentA}/subjects`,
  })
  assert.equal(subjects.statusCode, 200)
  assert.deepEqual(subjects.json().data.items, [{ id: ids.subjectA, name: 'زیست‌شناسی' }])

  const topics = await app.inject({
    headers: { authorization: 'Bearer counselor-a' },
    method: 'GET',
    url: `/api/v1/counselor/students/${ids.studentA}/subjects/${ids.subjectA}/topics`,
  })
  assert.equal(topics.statusCode, 200)
  assert.deepEqual(topics.json().data.items, [{
    id: ids.topicA,
    subjectId: ids.subjectA,
    title: 'ژنتیک',
  }])

  const crossCounselor = await app.inject({
    headers: { authorization: 'Bearer counselor-a' },
    method: 'GET',
    url: `/api/v1/counselor/students/${ids.studentB}/subjects`,
  })
  assert.equal(crossCounselor.statusCode, 404)
  assert.equal(crossCounselor.json().error.code, 'STUDENT_NOT_FOUND')
  await app.close()
})
