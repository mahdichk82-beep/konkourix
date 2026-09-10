import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'
import type { AuthService } from '../src/auth/auth-service.js'
import type { PublicUser } from '../src/auth/types.js'
import { createStudentCoreServices, type StudentCoreStore } from '../src/student-core/services.js'
import type { DailyTaskRecord } from '../src/student-core/types.js'

const user: PublicUser = {
  id: 'student-user-1',
  email: 'student@example.com',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  createdAt: new Date('2026-09-03T00:00:00.000Z'),
  updatedAt: new Date('2026-09-03T00:00:00.000Z'),
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
  listPlans: async () => [],
  findPlanById: async () => null,
  createPlan: async (input) => ({ id: 'plan-1', ...input, createdAt: new Date('2026-09-03T00:00:00.000Z'), updatedAt: new Date('2026-09-03T00:00:00.000Z') }),
  updatePlan: async () => null,
  listTasks: async () => [],
  findTaskById: async () => null,
  createTask: async (input) => ({ id: 'task-1', ...input, createdAt: new Date('2026-09-03T00:00:00.000Z'), updatedAt: new Date('2026-09-03T00:00:00.000Z') }),
  updateTask: async () => null,
}

const createApp = (studentCoreStore: StudentCoreStore = store) => buildApp({
  auth,
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
  const response = await app.inject({ method: 'GET', url: '/api/v1/student/subjects' })
  assert.equal(response.statusCode, 401)
  assert.equal(response.json().error.code, 'TOKEN_MISSING')
  await app.close()
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
