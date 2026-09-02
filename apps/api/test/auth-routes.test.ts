import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'
import type { AuthService } from '../src/auth/auth-service.js'
import type { PublicUser } from '../src/auth/types.js'

const user: PublicUser = {
  id: 'user-123',
  email: 'student@example.com',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  createdAt: new Date('2026-09-03T00:00:00.000Z'),
  updatedAt: new Date('2026-09-03T00:00:00.000Z'),
}

const authResult = {
  accessToken: 'access-token',
  expiresIn: 900,
  refreshToken: 'refresh-token',
  user,
}

const createAuthService = (): AuthService => ({
  authenticateAccessToken: async () => user,
  getCurrentUser: async () => user,
  login: async () => authResult,
  logout: async () => undefined,
  refresh: async () => authResult,
  register: async () => authResult,
})

const createApp = () =>
  buildApp({
    auth: createAuthService(),
    environment: 'test',
    logger: false,
    prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  })

test('registration returns an access token and HttpOnly refresh cookie', async () => {
  const app = createApp()
  const response = await app.inject({
    method: 'POST',
    payload: {
      email: 'student@example.com',
      password: 'strong password',
    },
    url: '/v1/auth/register',
  })
  const body = response.json()

  assert.equal(response.statusCode, 201)
  assert.equal(body.success, true)
  assert.equal(body.data.accessToken, 'access-token')
  assert.deepEqual(body.data.user, {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  })
  assert.match(response.headers['set-cookie'], /refresh_token=refresh-token/)
  assert.match(response.headers['set-cookie'], /HttpOnly/)

  await app.close()
})

test('login returns a standard response contract', async () => {
  const app = createApp()
  const response = await app.inject({
    method: 'POST',
    payload: {
      identifier: 'student@example.com',
      password: 'strong password',
    },
    url: '/v1/auth/login',
  })
  const body = response.json()

  assert.equal(response.statusCode, 200)
  assert.equal(body.success, true)
  assert.equal(body.data.expiresIn, 900)
  assert.equal(typeof body.requestId, 'string')

  await app.close()
})

test('refresh reads the HttpOnly cookie and rotates the session cookie', async () => {
  const app = createApp()
  const response = await app.inject({
    headers: { cookie: 'refresh_token=old-refresh-token' },
    method: 'POST',
    url: '/v1/auth/refresh',
  })

  assert.equal(response.statusCode, 200)
  assert.equal(response.json().data.accessToken, 'access-token')
  assert.match(response.headers['set-cookie'], /refresh_token=refresh-token/)

  await app.close()
})

test('logout clears the refresh cookie', async () => {
  const app = createApp()
  const response = await app.inject({
    headers: { cookie: 'refresh_token=refresh-token' },
    method: 'POST',
    url: '/v1/auth/logout',
  })

  assert.equal(response.statusCode, 200)
  assert.match(response.headers['set-cookie'], /refresh_token=;/)

  await app.close()
})

test('current-user endpoint requires a bearer token and returns a sanitized user', async () => {
  const app = createApp()

  const unauthorized = await app.inject({ method: 'GET', url: '/v1/auth/me' })
  assert.equal(unauthorized.statusCode, 401)

  const authorized = await app.inject({
    headers: { authorization: 'Bearer access-token' },
    method: 'GET',
    url: '/v1/auth/me',
  })

  assert.equal(authorized.statusCode, 200)
  assert.deepEqual(authorized.json().data, {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  })

  await app.close()
})
