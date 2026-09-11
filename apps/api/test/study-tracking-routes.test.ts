import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'
import type { AuthService } from '../src/auth/auth-service.js'
import type { PublicUser } from '../src/auth/types.js'
import { createStudyTrackingServices, type StudyTrackingStore } from '../src/study-tracking/services.js'

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
  role: 'COUNSELOR',
}

const subjectId = '00000000-0000-4000-8000-000000000001'
const taskId = '00000000-0000-4000-8000-000000000002'
const foreignTaskId = '00000000-0000-4000-8000-000000000003'

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

const store: StudyTrackingStore = {
  findStudentProfileByUserId: async () => ({ id: 'student-profile-1', userId: user.id }),
  findSubjectById: async () => ({ id: subjectId, studentProfileId: 'student-profile-1', archivedAt: null }),
  findTaskById: async (_profileId, id) => id === taskId
    ? { id: taskId, studentProfileId: 'student-profile-1', subjectId }
    : null,
  listSessions: async () => [],
  findSessionById: async () => null,
  createSession: async (input) => ({ id: '00000000-0000-4000-8000-000000000010', ...input, createdAt: new Date('2026-09-03T09:00:00.000Z'), updatedAt: new Date('2026-09-03T09:00:00.000Z') }),
  updateSession: async () => null,
  listGoals: async () => [],
  findGoalById: async () => null,
  createGoal: async (input) => ({ id: '00000000-0000-4000-8000-000000000020', ...input, createdAt: new Date('2026-09-03T09:00:00.000Z'), updatedAt: new Date('2026-09-03T09:00:00.000Z') }),
  updateGoal: async () => null,
}

const createApp = (authenticatedUser: PublicUser = user) => buildApp({
  auth: { ...auth, authenticateAccessToken: async () => authenticatedUser },
  environment: 'test',
  logger: false,
  prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  studyTracking: createStudyTrackingServices(store),
})

test('study session route uses the standard v1 contract', async () => {
  const app = createApp()
  const response = await app.inject({
    headers: { authorization: 'Bearer access-token', 'x-request-id': 'tracking-route-test' },
    method: 'POST',
    payload: {
      subjectId: '00000000-0000-4000-8000-000000000001',
      startedAt: '2026-09-03T08:00:00.000Z',
      endedAt: '2026-09-03T09:00:00.000Z',
    },
    url: '/api/v1/student/study-sessions',
  })
  assert.equal(response.statusCode, 201)
  assert.equal(response.headers['x-request-id'], 'tracking-route-test')
  assert.equal(response.json().success, true)
  assert.equal(response.json().data.durationMinutes, 60)
  await app.close()
})

test('study tracking routes reject unauthenticated requests', async () => {
  const app = createApp()
  const response = await app.inject({ method: 'GET', url: '/api/v1/student/goals' })
  assert.equal(response.statusCode, 401)
  assert.equal(response.json().error.code, 'TOKEN_MISSING')
  await app.close()
})

test('student creates a session for an owned task through the nested execution route', async () => {
  const app = createApp()
  const response = await app.inject({
    headers: { authorization: 'Bearer access-token' },
    method: 'POST',
    payload: {
      startedAt: '2026-09-03T08:00:00.000Z',
      endedAt: '2026-09-03T09:00:00.000Z',
      notes: 'Execution feedback',
    },
    url: `/api/v1/student/daily-tasks/${taskId}/sessions`,
  })

  assert.equal(response.statusCode, 201)
  assert.equal(response.json().data.studentProfileId, 'student-profile-1')
  assert.equal(response.json().data.dailyTaskId, taskId)
  assert.equal(response.json().data.subjectId, subjectId)
  assert.equal(response.json().data.durationMinutes, 60)
  await app.close()
})

test('task execution route hides foreign tasks and rejects forged ownership', async () => {
  const app = createApp()
  const foreignTask = await app.inject({
    headers: { authorization: 'Bearer access-token' },
    method: 'POST',
    payload: {
      startedAt: '2026-09-03T08:00:00.000Z',
      endedAt: '2026-09-03T09:00:00.000Z',
    },
    url: `/api/v1/student/daily-tasks/${foreignTaskId}/sessions`,
  })
  assert.equal(foreignTask.statusCode, 404)
  assert.equal(foreignTask.json().error.code, 'TASK_NOT_FOUND')

  const forgedOwner = await app.inject({
    headers: { authorization: 'Bearer access-token' },
    method: 'POST',
    payload: {
      studentProfileId: '00000000-0000-4000-8000-000000000099',
      dailyTaskId: foreignTaskId,
      subjectId,
      startedAt: '2026-09-03T08:00:00.000Z',
      endedAt: '2026-09-03T09:00:00.000Z',
    },
    url: `/api/v1/student/daily-tasks/${taskId}/sessions`,
  })
  assert.equal(forgedOwner.statusCode, 400)
  assert.equal(forgedOwner.json().error.code, 'VALIDATION_ERROR')
  await app.close()
})

test('counselor and anonymous callers cannot create student task sessions', async () => {
  const counselorApp = createApp(counselor)
  const counselorResponse = await counselorApp.inject({
    headers: { authorization: 'Bearer counselor-token' },
    method: 'POST',
    payload: {
      startedAt: '2026-09-03T08:00:00.000Z',
      endedAt: '2026-09-03T09:00:00.000Z',
    },
    url: `/api/v1/student/daily-tasks/${taskId}/sessions`,
  })
  assert.equal(counselorResponse.statusCode, 403)
  assert.equal(counselorResponse.json().error.code, 'ROLE_FORBIDDEN')
  await counselorApp.close()

  const studentApp = createApp()
  const anonymousResponse = await studentApp.inject({
    method: 'POST',
    payload: {
      startedAt: '2026-09-03T08:00:00.000Z',
      endedAt: '2026-09-03T09:00:00.000Z',
    },
    url: `/api/v1/student/daily-tasks/${taskId}/sessions`,
  })
  assert.equal(anonymousResponse.statusCode, 401)
  assert.equal(anonymousResponse.json().error.code, 'TOKEN_MISSING')
  await studentApp.close()
})
