import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'
import type { AuthService } from '../src/auth/auth-service.js'
import type { PublicUser } from '../src/auth/types.js'
import { createStudentCoreServices, type StudentCoreStore } from '../src/student-core/services.js'
import type { DailyTaskRecord, StudySubjectRecord } from '../src/student-core/types.js'

const user: PublicUser = {
  id: 'student-user-1',
  email: 'student@example.com',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  createdAt: new Date('2026-09-03T00:00:00.000Z'),
  updatedAt: new Date('2026-09-03T00:00:00.000Z'),
}

const counselor: PublicUser = {
  ...user,
  id: 'counselor-user-1',
  email: 'counselor@example.com',
  role: 'COUNSELOR',
}

const auth: AuthService = {
  authenticateAccessToken: async () => user,
  changePassword: async () => undefined,
  getCurrentUser: async () => user,
  login: async () => { throw new Error('not used') },
  logout: async () => undefined,
  logoutAll: async () => undefined,
  refresh: async () => { throw new Error('not used') },
  register: async () => { throw new Error('not used') },
}

const store: StudentCoreStore = {
  findStudentProfileByUserId: async () => ({ id: 'student-profile-1', userId: user.id }),
  listSubjects: async () => [],
  findSubjectById: async () => null,
  createSubject: async (input) => ({ id: 'subject-1', ...input, archivedAt: null, createdAt: new Date('2026-09-03T00:00:00.000Z'), updatedAt: new Date('2026-09-03T00:00:00.000Z') }),
  updateSubject: async () => null,
  listTopics: async () => [],
  findTopicById: async () => null,
  createTopic: async (input) => ({ id: 'topic-1', ...input, archivedAt: null, createdAt: new Date('2026-09-03T00:00:00.000Z'), updatedAt: new Date('2026-09-03T00:00:00.000Z') }),
  updateTopic: async () => null,
  listPlans: async () => [],
  findPlanById: async () => null,
  createPlan: async (input) => ({ id: 'plan-1', ...input, createdAt: new Date('2026-09-03T00:00:00.000Z'), updatedAt: new Date('2026-09-03T00:00:00.000Z') }),
  updatePlan: async () => null,
  listTasks: async () => [],
  findTaskById: async () => null,
  createTask: async (input) => ({ id: 'task-1', ...input, createdAt: new Date('2026-09-03T00:00:00.000Z'), updatedAt: new Date('2026-09-03T00:00:00.000Z') }),
  updateTask: async () => null,
}

const createApp = (
  studentCoreStore: StudentCoreStore = store,
  authService: AuthService = auth,
) => buildApp({
  auth: authService,
  environment: 'test',
  logger: false,
  prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  studentCore: createStudentCoreServices(studentCoreStore),
})

test('student subject route returns the standard v1 response contract', async () => {
  const app = createApp()
  const response = await app.inject({
    headers: { authorization: 'Bearer access-token', 'x-request-id': 'student-core-route' },
    method: 'POST',
    payload: { name: 'Mathematics' },
    url: '/api/v1/student/subjects',
  })

  assert.equal(response.statusCode, 201)
  assert.equal(response.headers['x-request-id'], 'student-core-route')
  assert.equal(response.json().success, true)
  assert.equal(response.json().data.name, 'Mathematics')
  await app.close()
})

test('student core routes reject unauthenticated requests', async () => {
  const app = createApp()
  const subjectResponse = await app.inject({ method: 'GET', url: '/api/v1/student/subjects' })
  const taskResponse = await app.inject({ method: 'GET', url: '/api/v1/student/daily-tasks' })
  assert.equal(subjectResponse.statusCode, 401)
  assert.equal(subjectResponse.json().error.code, 'TOKEN_MISSING')
  assert.equal(taskResponse.statusCode, 401)
  assert.equal(taskResponse.json().error.code, 'TOKEN_MISSING')
  await app.close()
})

test('student task routes reject counselor users', async () => {
  const counselorAuth: AuthService = {
    ...auth,
    authenticateAccessToken: async () => counselor,
  }
  const app = createApp(store, counselorAuth)
  const response = await app.inject({
    headers: { authorization: 'Bearer counselor-access-token' },
    method: 'GET',
    url: '/api/v1/student/daily-tasks',
  })

  assert.equal(response.statusCode, 403)
  assert.equal(response.json().error.code, 'ROLE_FORBIDDEN')
  await app.close()
})

test('student topic route creates a topic under an owned subject', async () => {
  const subjectId = '00000000-0000-4000-8000-000000000301'
  const subject: StudySubjectRecord = {
    id: subjectId,
    studentProfileId: 'student-profile-1',
    name: 'Mathematics',
    normalizedName: 'mathematics',
    archivedAt: null,
    createdAt: new Date('2026-09-03T00:00:00.000Z'),
    updatedAt: new Date('2026-09-03T00:00:00.000Z'),
  }
  const topicStore: StudentCoreStore = {
    ...store,
    findSubjectById: async (profileId, id) =>
      profileId === subject.studentProfileId && id === subject.id ? subject : null,
  }
  const app = createApp(topicStore)
  const response = await app.inject({
    headers: { authorization: 'Bearer access-token' },
    method: 'POST',
    payload: { title: 'Functions' },
    url: `/api/v1/student/subjects/${subjectId}/topics`,
  })

  assert.equal(response.statusCode, 201)
  assert.equal(response.json().data.title, 'Functions')
  assert.equal(response.json().data.subjectId, subjectId)
  await app.close()
})

test('student topic routes reject empty titles and counselor users', async () => {
  const subjectId = '00000000-0000-4000-8000-000000000301'
  const app = createApp()
  const emptyTitle = await app.inject({
    headers: { authorization: 'Bearer access-token' },
    method: 'POST',
    payload: { title: '   ' },
    url: `/api/v1/student/subjects/${subjectId}/topics`,
  })
  assert.equal(emptyTitle.statusCode, 400)
  assert.equal(emptyTitle.json().error.code, 'VALIDATION_ERROR')
  await app.close()

  const counselorApp = createApp(store, {
    ...auth,
    authenticateAccessToken: async () => counselor,
  })
  const counselorResponse = await counselorApp.inject({
    headers: { authorization: 'Bearer counselor-access-token' },
    method: 'GET',
    url: `/api/v1/student/subjects/${subjectId}/topics`,
  })
  assert.equal(counselorResponse.statusCode, 403)
  assert.equal(counselorResponse.json().error.code, 'ROLE_FORBIDDEN')
  await counselorApp.close()
})

test('daily task date query is mapped to the scheduled date filter', async () => {
  const timestamp = new Date('2026-09-03T00:00:00.000Z')
  const tasks: DailyTaskRecord[] = [
    {
      id: '00000000-0000-4000-8000-000000000101',
      studentProfileId: 'student-profile-1',
      studyPlanId: null,
      subjectId: null,
      title: 'September third task',
      description: null,
      scheduledFor: timestamp,
      estimatedMinutes: 30,
      status: 'PENDING',
      completedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: '00000000-0000-4000-8000-000000000102',
      studentProfileId: 'student-profile-1',
      studyPlanId: null,
      subjectId: null,
      title: 'September fourth task',
      description: null,
      scheduledFor: new Date('2026-09-04T00:00:00.000Z'),
      estimatedMinutes: 30,
      status: 'PENDING',
      completedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ]
  const receivedQueries: Array<Parameters<StudentCoreStore['listTasks']>[1]> = []
  const filteringStore: StudentCoreStore = {
    ...store,
    async listTasks(_profileId, query) {
      receivedQueries.push(query)
      return query?.scheduledFor
        ? tasks.filter((task) => task.scheduledFor.getTime() === query.scheduledFor?.getTime())
        : tasks
    },
  }
  const app = createApp(filteringStore)

  const unfiltered = await app.inject({
    headers: { authorization: 'Bearer access-token' },
    method: 'GET',
    url: '/api/v1/student/daily-tasks',
  })
  const matching = await app.inject({
    headers: { authorization: 'Bearer access-token' },
    method: 'GET',
    url: '/api/v1/student/daily-tasks?date=2026-09-03',
  })
  const unrelated = await app.inject({
    headers: { authorization: 'Bearer access-token' },
    method: 'GET',
    url: '/api/v1/student/daily-tasks?date=2026-09-05',
  })

  assert.equal(unfiltered.statusCode, 200)
  assert.equal(unfiltered.json().data.items.length, 2)
  assert.equal(receivedQueries[0]?.scheduledFor, undefined)
  assert.equal(matching.json().data.items.length, 1)
  assert.equal(matching.json().data.items[0].id, tasks[0]?.id)
  assert.equal(receivedQueries[1]?.scheduledFor?.toISOString(), '2026-09-03T00:00:00.000Z')
  assert.equal('date' in (receivedQueries[1] ?? {}), false)
  assert.equal(unrelated.json().data.items.length, 0)

  await app.close()
})

test('daily task filters retain authenticated profile scope', async () => {
  const received: Array<{
    profileId: string
    query: Parameters<StudentCoreStore['listTasks']>[1]
  }> = []
  const filteringStore: StudentCoreStore = {
    ...store,
    async listTasks(profileId, query) {
      received.push({ profileId, query })
      return []
    },
  }
  const app = createApp(filteringStore)
  const subjectId = '00000000-0000-4000-8000-000000000201'
  const response = await app.inject({
    headers: { authorization: 'Bearer access-token' },
    method: 'GET',
    url: `/api/v1/student/daily-tasks?date=2026-09-03&status=PENDING&subjectId=${subjectId}&limit=20`,
  })

  assert.equal(response.statusCode, 200)
  assert.equal(received.length, 1)
  assert.equal(received[0]?.profileId, 'student-profile-1')
  assert.deepEqual(received[0]?.query, {
    limit: 20,
    scheduledFor: new Date('2026-09-03T00:00:00.000Z'),
    status: 'PENDING',
    subjectId,
  })
  await app.close()
})
