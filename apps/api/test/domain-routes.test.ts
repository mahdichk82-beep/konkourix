import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'
import type { AuthService } from '../src/auth/auth-service.js'
import type { PublicUser } from '../src/auth/types.js'
import { createDomainService, type DomainStore } from '../src/domain/domain-service.js'

const user: PublicUser = {
  id: 'student-1',
  email: 'student@example.com',
  phone: null,
  role: 'STUDENT',
  status: 'ACTIVE',
  createdAt: new Date('2026-09-03T00:00:00.000Z'),
  updatedAt: new Date('2026-09-03T00:00:00.000Z'),
}

const createAuth = (): AuthService => ({
  authenticateAccessToken: async () => user,
  getCurrentUser: async () => user,
  login: async () => { throw new Error('not used') },
  logout: async () => undefined,
  refresh: async () => { throw new Error('not used') },
  register: async () => { throw new Error('not used') },
})

const store: DomainStore = {
  findUserById: async () => ({ id: user.id, role: 'STUDENT', status: 'ACTIVE' }),
  findStudentProfile: async () => null,
  upsertStudentProfile: async (userId, input) => ({
    id: 'student-profile-1',
    userId,
    educationLevel: input.educationLevel ?? null,
    schoolName: input.schoolName ?? null,
    createdAt: new Date('2026-09-03T00:00:00.000Z'),
    updatedAt: new Date('2026-09-03T00:00:00.000Z'),
  }),
  findCounselorProfile: async () => null,
  upsertCounselorProfile: async (userId, input) => ({
    id: 'counselor-profile-1',
    userId,
    bio: input.bio ?? null,
    specialization: input.specialization ?? null,
    createdAt: new Date('2026-09-03T00:00:00.000Z'),
    updatedAt: new Date('2026-09-03T00:00:00.000Z'),
  }),
  listStudentRelationships: async () => [],
  listCounselorRelationships: async () => [],
  createRelationship: async () => { throw new Error('not used') },
  updateRelationship: async () => null,
}

test('student profile route uses the v1 contract and request id', async () => {
  const app = buildApp({
    auth: createAuth(),
    domain: createDomainService(store),
    environment: 'test',
    logger: false,
    prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  })

  const response = await app.inject({
    headers: { authorization: 'Bearer access-token', 'x-request-id': 'domain-route-test' },
    method: 'PATCH',
    payload: { educationLevel: 'secondary' },
    url: '/v1/me/student-profile',
  })

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['x-request-id'], 'domain-route-test')
  assert.deepEqual(response.json().data, {
    id: 'student-profile-1',
    userId: 'student-1',
    educationLevel: 'secondary',
    schoolName: null,
    createdAt: '2026-09-03T00:00:00.000Z',
    updatedAt: '2026-09-03T00:00:00.000Z',
  })

  await app.close()
})

test('domain routes reject unauthenticated requests', async () => {
  const app = buildApp({
    auth: createAuth(),
    domain: createDomainService(store),
    environment: 'test',
    logger: false,
    prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  })

  const response = await app.inject({ method: 'GET', url: '/v1/me/student-profile' })
  assert.equal(response.statusCode, 401)
  assert.equal(response.json().error.code, 'TOKEN_MISSING')

  await app.close()
})
