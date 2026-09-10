import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'
import type { AuthService } from '../src/auth/auth-service.js'
import type { PublicUser } from '../src/auth/types.js'
import { operationalErrorFields } from '../src/lib/operational-logging.js'

const user: PublicUser = {
  id: 'rate-limit-user',
  email: 'student@example.com',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  createdAt: new Date('2026-09-10T00:00:00.000Z'),
  updatedAt: new Date('2026-09-10T00:00:00.000Z'),
}

const createAuthService = (): AuthService => ({
  authenticateAccessToken: async () => user,
  getCurrentUser: async () => user,
  login: async () => ({
    accessToken: 'access-token',
    expiresIn: 900,
    refreshToken: 'refresh-token',
    user,
  }),
  logout: async () => undefined,
  refresh: async () => ({
    accessToken: 'access-token',
    expiresIn: 900,
    refreshToken: 'refresh-token',
    user,
  }),
  register: async () => ({
    accessToken: 'access-token',
    expiresIn: 900,
    refreshToken: 'refresh-token',
    user,
  }),
})

test('auth rate limiting returns the standard error contract and retry window', async () => {
  const app = buildApp({
    auth: createAuthService(),
    authRateLimit: {
      now: () => 1_000,
      policies: {
        '/v1/auth/login': { maxAttempts: 2, windowMs: 60_000 },
      },
    },
    environment: 'test',
    logger: false,
    prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  })

  const request = () =>
    app.inject({
      method: 'POST',
      payload: {
        identifier: 'student@example.com',
        password: 'strong password',
      },
      url: '/v1/auth/login',
    })

  assert.equal((await request()).statusCode, 200)
  assert.equal((await request()).statusCode, 200)

  const limited = await request()
  assert.equal(limited.statusCode, 429)
  assert.equal(limited.headers['retry-after'], '60')
  assert.deepEqual(limited.json().error, {
    code: 'RATE_LIMITED',
    message: 'Too many authentication attempts',
  })
  assert.equal(typeof limited.json().requestId, 'string')

  const liveness = await app.inject({ method: 'GET', url: '/v1/health/live' })
  assert.equal(liveness.statusCode, 200)

  await app.close()
})

test('operational error fields omit messages and stacks that may contain secrets', () => {
  const error = Object.assign(
    new Error('do-not-log-sensitive-internal-detail'),
    { code: 'P1001' },
  )

  assert.deepEqual(operationalErrorFields(error), {
    errorCode: 'P1001',
    errorName: 'Error',
  })
  assert.equal(JSON.stringify(operationalErrorFields(error)).includes('sensitive'), false)
})
