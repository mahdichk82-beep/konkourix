import assert from 'node:assert/strict'
import test from 'node:test'
import { randomUUID } from 'node:crypto'
import { createAuthService } from '../src/auth/auth-service.js'
import { hashPassword } from '../src/auth/password.js'
import type {
  AuthSessionRecord,
  AuthStore,
  AuthUserRecord,
} from '../src/auth/store.js'
import type { AuthServiceConfig } from '../src/auth/types.js'

const config: AuthServiceConfig = {
  accessToken: {
    audience: 'konkourx-client',
    issuer: 'konkourx-api',
    secret: '12345678901234567890123456789012',
    ttlSeconds: 900,
  },
  refreshTokenTtlSeconds: 2_592_000,
}

class InMemoryAuthStore implements AuthStore {
  users: AuthUserRecord[] = []
  sessions: AuthSessionRecord[] = []
  rotationConflict = false

  async findUserByIdentifier(identifier: string) {
    return (
      this.users.find(
        (user) => user.email === identifier || user.phone === identifier,
      ) ?? null
    )
  }

  async findUserById(id: string) {
    return this.users.find((user) => user.id === id) ?? null
  }

  async createStudentUser(input: {
    email: string | null
    phone: string | null
    passwordHash: string
  }) {
    const user: AuthUserRecord = {
      id: randomUUID(),
      email: input.email,
      phone: input.phone,
      passwordHash: input.passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.push(user)
    return user
  }

  async createSession(input: {
    userId: string
    tokenHash: string
    familyId: string
    expiresAt: Date
    userAgent: string | null
    ipAddress: string | null
  }) {
    const session: AuthSessionRecord = {
      id: randomUUID(),
      ...input,
      revokedAt: null,
      lastUsedAt: null,
      createdAt: new Date(),
    }
    this.sessions.push(session)
    return session
  }

  async findSessionByTokenHash(tokenHash: string) {
    return this.sessions.find((session) => session.tokenHash === tokenHash) ?? null
  }

  async rotateSession(input: {
    sessionId: string
    now: Date
    replacement: {
      userId: string
      tokenHash: string
      familyId: string
      expiresAt: Date
      userAgent: string | null
      ipAddress: string | null
    }
  }) {
    if (this.rotationConflict) return null

    const current = this.sessions.find((session) => session.id === input.sessionId)
    assert.ok(current)
    current.revokedAt = input.now
    current.lastUsedAt = input.now
    return this.createSession(input.replacement)
  }

  async revokeSession(sessionId: string, now: Date) {
    const session = this.sessions.find((item) => item.id === sessionId)
    if (session) session.revokedAt = now
  }

  async revokeSessionFamily(familyId: string, now: Date) {
    for (const session of this.sessions) {
      if (session.familyId === familyId && !session.revokedAt) {
        session.revokedAt = now
      }
    }
  }
}

const serviceFor = (store: InMemoryAuthStore, now = new Date()) =>
  createAuthService({
    config,
    now: () => now,
    store,
  })

test('registration creates an active student and an authenticated session', async () => {
  const store = new InMemoryAuthStore()
  const service = serviceFor(store)

  const result = await service.register(
    { email: 'Student@Example.com', phone: null, password: 'strong password' },
    { ipAddress: '127.0.0.1', userAgent: 'test' },
  )

  assert.equal(result.user.email, 'student@example.com')
  assert.equal(result.user.role, 'STUDENT')
  assert.equal(result.user.status, 'ACTIVE')
  assert.equal('passwordHash' in result.user, false)
  assert.equal(store.users[0]?.passwordHash.startsWith('scrypt$v1$'), true)
  assert.equal(store.sessions.length, 1)
  assert.equal(result.refreshToken.length > 20, true)
})

test('login rejects invalid credentials without exposing account existence', async () => {
  const store = new InMemoryAuthStore()
  const service = serviceFor(store)

  await assert.rejects(
    service.login('missing@example.com', 'wrong password', {}),
    { code: 'INVALID_CREDENTIALS', statusCode: 401 },
  )

  await service.register(
    { email: 'student@example.com', phone: null, password: 'strong password' },
    {},
  )

  await assert.rejects(
    service.login('student@example.com', 'wrong password', {}),
    { code: 'INVALID_CREDENTIALS', statusCode: 401 },
  )
})

test('login authenticates a registered student', async () => {
  const store = new InMemoryAuthStore()
  const service = serviceFor(store)
  await service.register(
    { email: 'student@example.com', phone: null, password: 'strong password' },
    {},
  )

  const result = await service.login(
    'STUDENT@example.com',
    'strong password',
    {},
  )

  assert.equal(result.user.role, 'STUDENT')
  assert.equal(result.user.email, 'student@example.com')
  assert.equal(store.sessions.length, 2)
})

test('login authenticates a server-assigned counselor role', async () => {
  const store = new InMemoryAuthStore()
  store.users.push({
    id: randomUUID(),
    email: 'counselor@example.com',
    phone: null,
    passwordHash: await hashPassword('counselor password'),
    role: 'COUNSELOR',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  const service = serviceFor(store)

  const result = await service.login(
    'COUNSELOR@example.com',
    'counselor password',
    {},
  )

  assert.equal(result.user.role, 'COUNSELOR')
  assert.equal(result.user.email, 'counselor@example.com')
  assert.equal(store.sessions.at(-1)?.userId, result.user.id)
})

test('refresh rotates a session and reused tokens revoke the session family', async () => {
  const store = new InMemoryAuthStore()
  const service = serviceFor(store)
  const initial = await service.register(
    { email: 'student@example.com', phone: null, password: 'strong password' },
    {},
  )

  const rotated = await service.refresh(initial.refreshToken, {})

  assert.notEqual(rotated.refreshToken, initial.refreshToken)
  assert.equal(store.sessions.length, 2)

  await assert.rejects(
    service.refresh(initial.refreshToken, {}),
    { code: 'SESSION_REUSED', statusCode: 401 },
  )
  assert.equal(store.sessions.every((session) => session.revokedAt !== null), true)
})

test('logout revokes the refresh session and current user excludes credentials', async () => {
  const store = new InMemoryAuthStore()
  const service = serviceFor(store)
  const initial = await service.register(
    { email: 'student@example.com', phone: null, password: 'strong password' },
    {},
  )

  await service.logout(initial.refreshToken)

  assert.equal(store.sessions[0]?.revokedAt !== null, true)
  const user = await service.getCurrentUser(initial.user.id)
  assert.equal('passwordHash' in user, false)
  assert.equal(user.id, initial.user.id)
})

test('refresh rejects an expired server-side session', async () => {
  const store = new InMemoryAuthStore()
  const service = serviceFor(store)
  const initial = await service.register(
    { email: 'student@example.com', phone: null, password: 'strong password' },
    {},
  )
  store.sessions[0]!.expiresAt = new Date(0)

  await assert.rejects(
    service.refresh(initial.refreshToken, {}),
    { code: 'SESSION_INVALID', statusCode: 401 },
  )
  assert.notEqual(store.sessions[0]?.revokedAt, null)
})

test('refresh fails closed when session rotation loses an update race', async () => {
  const store = new InMemoryAuthStore()
  const service = serviceFor(store)
  const initial = await service.register(
    { email: 'student@example.com', phone: null, password: 'strong password' },
    {},
  )
  store.rotationConflict = true

  await assert.rejects(
    service.refresh(initial.refreshToken, {}),
    { code: 'SESSION_REUSED', statusCode: 401 },
  )
})
