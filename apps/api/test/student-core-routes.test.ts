import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'
import type { AuthService } from '../src/auth/auth-service.js'
import type { PublicUser } from '../src/auth/types.js'
import { createStudentCoreServices, type StudentCoreStore } from '../src/student-core/services.js'

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
  getCurrentUser: async () => user,
  login: async () => { throw new Error('not used') },
  logout: async () => undefined,
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

const createApp = () => buildApp({
  auth,
  environment: 'test',
  logger: false,
  prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  studentCore: createStudentCoreServices(store),
})

test('student subject route returns the standard v1 response contract', async () => {
  const app = createApp()
  const response = await app.inject({
    headers: { authorization: 'Bearer access-token', 'x-request-id': 'student-core-route' },
    method: 'POST',
    payload: { name: 'Mathematics' },
    url: '/v1/student/subjects',
  })

  assert.equal(response.statusCode, 201)
  assert.equal(response.headers['x-request-id'], 'student-core-route')
  assert.equal(response.json().success, true)
  assert.equal(response.json().data.name, 'Mathematics')
  await app.close()
})

test('student core routes reject unauthenticated requests', async () => {
  const app = createApp()
  const response = await app.inject({ method: 'GET', url: '/v1/student/subjects' })
  assert.equal(response.statusCode, 401)
  assert.equal(response.json().error.code, 'TOKEN_MISSING')
  await app.close()
})
