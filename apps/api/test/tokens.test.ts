import assert from 'node:assert/strict'
import test from 'node:test'
import {
  signAccessToken,
  verifyAccessToken,
  type AccessTokenConfig,
} from '../src/auth/access-token.js'
import {
  generateRefreshToken,
  hashRefreshToken,
} from '../src/auth/refresh-token.js'

const config: AccessTokenConfig = {
  audience: 'konkourx-client',
  issuer: 'konkourx-api',
  secret: '12345678901234567890123456789012',
  ttlSeconds: 900,
}

test('access tokens contain verifiable identity claims', async () => {
  const now = new Date('2026-09-03T00:00:00.000Z')
  const token = await signAccessToken(
    { role: 'STUDENT', userId: 'user-123' },
    config,
    now,
  )

  const claims = await verifyAccessToken(token, config, now)

  assert.deepEqual(claims, {
    role: 'STUDENT',
    userId: 'user-123',
  })
})

test('access token verification rejects tampering and wrong configuration', async () => {
  const token = await signAccessToken(
    { role: 'ADMIN', userId: 'admin-123' },
    config,
  )

  assert.equal(
    await verifyAccessToken(`${token}tampered`, config),
    null,
  )
  assert.equal(
    await verifyAccessToken(token, { ...config, audience: 'other-client' }),
    null,
  )
})

test('expired access tokens are rejected', async () => {
  const issuedAt = new Date('2026-09-03T00:00:00.000Z')
  const token = await signAccessToken(
    { role: 'COUNSELOR', userId: 'counselor-123' },
    { ...config, ttlSeconds: 60 },
    issuedAt,
  )

  assert.equal(
    await verifyAccessToken(
      token,
      { ...config, ttlSeconds: 60 },
      new Date('2026-09-03T00:02:00.000Z'),
    ),
    null,
  )
})

test('refresh tokens are random and only their hashes are persisted', () => {
  const first = generateRefreshToken()
  const second = generateRefreshToken()

  assert.notEqual(first.token, second.token)
  assert.equal(first.hash, hashRefreshToken(first.token))
  assert.equal(second.hash, hashRefreshToken(second.token))
  assert.notEqual(first.hash, first.token)
})
