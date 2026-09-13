import assert from 'node:assert/strict'
import test from 'node:test'
import type { AssessmentAttemptStore } from '../src/assessment-attempts/services.js'
import { createAssessmentAttemptServices } from '../src/assessment-attempts/services.js'
import { buildApp } from '../src/app.js'
import type { AuthService } from '../src/auth/auth-service.js'
import type { PublicUser } from '../src/auth/types.js'

const user: PublicUser = {
  createdAt: new Date('2026-09-13T00:00:00.000Z'),
  email: 'student@example.com',
  id: 'student-user',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  updatedAt: new Date('2026-09-13T00:00:00.000Z'),
}
const attemptId = '10000000-0000-4000-8000-000000000001'
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

const makeStore = (): AssessmentAttemptStore => {
  let current = {
    blankCount: 1,
    correctCount: 8,
    createdAt: new Date('2026-09-13T11:00:00.000Z'),
    dailyTaskId: null,
    endedAt: new Date('2026-09-13T11:00:00.000Z'),
    id: attemptId,
    incorrectCount: 1,
    invalidatedAt: null,
    startedAt: new Date('2026-09-13T10:30:00.000Z'),
    studentProfileId: 'student-profile',
    subjectId: null,
    title: 'Biology practice',
    topicId: null,
    updatedAt: new Date('2026-09-13T11:00:00.000Z'),
  }
  return {
    findStudentProfileByUserId: async () => ({ id: 'student-profile', userId: user.id }),
    findTaskById: async () => null,
    findSubjectById: async () => null,
    findTopicById: async () => null,
    listAttempts: async () => [current],
    findAttemptById: async (_profileId, id) => id === attemptId ? current : null,
    createAttempt: async (input) => (current = { ...current, ...input }),
    updateAttempt: async (_profileId, id, input) => {
      if (id !== attemptId) return { ok: false, reason: 'ATTEMPT_NOT_FOUND' }
      current = { ...current, ...input }
      return { ok: true, value: current }
    },
    invalidateAttempt: async (_profileId, id, invalidatedAt) => {
      if (id !== attemptId) return { ok: false, reason: 'ATTEMPT_NOT_FOUND' }
      current = { ...current, invalidatedAt }
      return { ok: true, value: current }
    },
  }
}

const createApp = (authenticatedUser: PublicUser = user) => buildApp({
  assessmentAttempts: createAssessmentAttemptServices(
    makeStore(),
    () => new Date('2026-09-13T12:00:00.000Z'),
  ),
  auth: { ...auth, authenticateAccessToken: async () => authenticatedUser },
  environment: 'test',
  logger: false,
  prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
})

const payload = {
  blankCount: 1,
  correctCount: 8,
  endedAt: '2026-09-13T11:00:00.000Z',
  incorrectCount: 1,
  startedAt: '2026-09-13T10:30:00.000Z',
  title: 'Biology practice',
}

test('assessment routes create, list, read, correct, and invalidate safe completed attempts', async () => {
  const app = createApp()
  const created = await app.inject({
    headers: { authorization: 'Bearer token' }, method: 'POST', payload,
    url: '/api/v1/student/assessment-attempts',
  })
  assert.equal(created.statusCode, 201)
  assert.equal(created.json().data.questionCount, 10)
  assert.equal(created.json().data.durationMinutes, 30)
  assert.equal('studentProfileId' in created.json().data, false)

  const listed = await app.inject({
    headers: { authorization: 'Bearer token' }, method: 'GET',
    url: '/api/v1/student/assessment-attempts',
  })
  assert.equal(listed.statusCode, 200)
  assert.equal(listed.json().data.items.length, 1)

  const read = await app.inject({
    headers: { authorization: 'Bearer token' }, method: 'GET',
    url: `/api/v1/student/assessment-attempts/${attemptId}`,
  })
  assert.equal(read.statusCode, 200)

  const corrected = await app.inject({
    headers: { authorization: 'Bearer token' }, method: 'PATCH',
    payload: { correctCount: 7, incorrectCount: 2 },
    url: `/api/v1/student/assessment-attempts/${attemptId}`,
  })
  assert.equal(corrected.statusCode, 200)
  assert.equal(corrected.json().data.questionCount, 10)

  const invalidated = await app.inject({
    headers: { authorization: 'Bearer token' }, method: 'PATCH', payload: {},
    url: `/api/v1/student/assessment-attempts/${attemptId}/invalidate`,
  })
  assert.equal(invalidated.statusCode, 200)
  assert.equal(invalidated.json().data.invalidatedAt, '2026-09-13T12:00:00.000Z')
  await app.close()
})

test('assessment routes reject ownership fields, provenance edits, invalid facts, and wrong roles', async () => {
  const app = createApp()
  for (const invalidPayload of [
    { ...payload, studentProfileId: '20000000-0000-4000-8000-000000000001' },
    { ...payload, endedAt: payload.startedAt },
    { ...payload, blankCount: 0, correctCount: 0, incorrectCount: 0 },
  ]) {
    const response = await app.inject({
      headers: { authorization: 'Bearer token' }, method: 'POST', payload: invalidPayload,
      url: '/api/v1/student/assessment-attempts',
    })
    assert.equal(response.statusCode, 400)
  }

  const provenanceEdit = await app.inject({
    headers: { authorization: 'Bearer token' }, method: 'PATCH',
    payload: { dailyTaskId: '20000000-0000-4000-8000-000000000001' },
    url: `/api/v1/student/assessment-attempts/${attemptId}`,
  })
  assert.equal(provenanceEdit.statusCode, 400)

  const counselorApp = createApp({ ...user, role: 'COUNSELOR' })
  const forbidden = await counselorApp.inject({
    headers: { authorization: 'Bearer token' }, method: 'GET',
    url: '/api/v1/student/assessment-attempts',
  })
  assert.equal(forbidden.statusCode, 403)
  await counselorApp.close()

  const anonymousApp = createApp()
  const anonymous = await anonymousApp.inject({
    method: 'GET', url: '/api/v1/student/assessment-attempts',
  })
  assert.equal(anonymous.statusCode, 401)
  await anonymousApp.close()
  await app.close()
})
