import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'
import { requireRoles } from '../src/auth/rbac.js'
import type { AuthService } from '../src/auth/auth-service.js'
import type { PublicUser } from '../src/auth/types.js'
import { authenticateRequest } from '../src/plugins/authentication.js'

const createUser = (role: PublicUser['role']): PublicUser => ({
  id: 'user-123',
  email: 'user@example.com',
  phone: null,
  role,
  status: 'ACTIVE',
  createdAt: new Date('2026-09-03T00:00:00.000Z'),
  updatedAt: new Date('2026-09-03T00:00:00.000Z'),
})

const createApp = (role: PublicUser['role']) => {
  const user = createUser(role)
  const auth: AuthService = {
    authenticateAccessToken: async () => user,
    changePassword: async () => undefined,
    getCurrentUser: async () => user,
    login: async () => {
      throw new Error('unused')
    },
    logout: async () => undefined,
    logoutAll: async () => undefined,
    refresh: async () => {
      throw new Error('unused')
    },
    register: async () => {
      throw new Error('unused')
    },
  }
  const app = buildApp({
    auth,
    environment: 'test',
    logger: false,
    prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  })

  app.get(
    '/api/v1/test/admin-only',
    {
      preHandler: [authenticateRequest(auth), requireRoles('ADMIN')],
    },
    async () => ({ success: true }),
  )

  return app
}

test('RBAC allows an authorized role through the route guard', async () => {
  const app = createApp('ADMIN')
  const response = await app.inject({
    headers: { authorization: 'Bearer valid-token' },
    method: 'GET',
    url: '/api/v1/test/admin-only',
  })

  assert.equal(response.statusCode, 200)
  await app.close()
})

test('RBAC rejects an authenticated user with an insufficient role', async () => {
  const app = createApp('STUDENT')
  const response = await app.inject({
    headers: { authorization: 'Bearer valid-token' },
    method: 'GET',
    url: '/api/v1/test/admin-only',
  })
  const body = response.json()

  assert.equal(response.statusCode, 403)
  assert.deepEqual(body.error, {
    code: 'ROLE_FORBIDDEN',
    message: 'Insufficient role permissions',
  })
  await app.close()
})
