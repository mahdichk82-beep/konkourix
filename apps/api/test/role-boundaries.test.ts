import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'
import type { AuthService } from '../src/auth/auth-service.js'
import type { PublicUser } from '../src/auth/types.js'

const createUser = (role: PublicUser['role']): PublicUser => ({
  id: `${role.toLowerCase()}-1`,
  email: `${role.toLowerCase()}@example.com`,
  phone: null,
  role,
  status: 'ACTIVE',
  createdAt: new Date('2026-09-10T00:00:00.000Z'),
  updatedAt: new Date('2026-09-10T00:00:00.000Z'),
})

const createApp = () => {
  const auth: AuthService = {
    authenticateAccessToken: async (token) => {
      if (token === 'student-token') return createUser('STUDENT')
      if (token === 'counselor-token') return createUser('COUNSELOR')
      throw Object.assign(new Error('invalid'), {
        code: 'TOKEN_INVALID',
        statusCode: 401,
      })
    },
    getCurrentUser: async () => createUser('STUDENT'),
    login: async () => { throw new Error('unused') },
    logout: async () => undefined,
    refresh: async () => { throw new Error('unused') },
    register: async () => { throw new Error('unused') },
  }

  return buildApp({
    auth,
    environment: 'test',
    logger: false,
    prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  })
}

test('student cannot access the counselor route boundary', async () => {
  const app = createApp()
  const response = await app.inject({
    headers: { authorization: 'Bearer student-token' },
    method: 'GET',
    url: '/api/v1/counselor/session',
  })

  assert.equal(response.statusCode, 403)
  assert.equal(response.json().error.code, 'ROLE_FORBIDDEN')
  await app.close()
})

test('counselor cannot access the student route boundary', async () => {
  const app = createApp()
  const response = await app.inject({
    headers: { authorization: 'Bearer counselor-token' },
    method: 'GET',
    url: '/api/v1/student/session',
  })

  assert.equal(response.statusCode, 403)
  assert.equal(response.json().error.code, 'ROLE_FORBIDDEN')
  await app.close()
})

test('each role can access its own route boundary', async () => {
  const app = createApp()
  const student = await app.inject({
    headers: { authorization: 'Bearer student-token' },
    method: 'GET',
    url: '/api/v1/student/session',
  })
  const counselor = await app.inject({
    headers: { authorization: 'Bearer counselor-token' },
    method: 'GET',
    url: '/api/v1/counselor/session',
  })

  assert.equal(student.statusCode, 200)
  assert.equal(student.json().data.role, 'STUDENT')
  assert.equal(counselor.statusCode, 200)
  assert.equal(counselor.json().data.role, 'COUNSELOR')
  await app.close()
})
