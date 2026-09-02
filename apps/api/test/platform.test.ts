import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'

type FakePrisma = {
  $queryRaw: () => Promise<unknown>
}

const createFakePrisma = (): FakePrisma => ({
  $queryRaw: async () => [{ '?column?': 1 }],
})

test('versioned liveness route returns the standard success contract', async () => {
  const app = buildApp({
    environment: 'test',
    logger: false,
    prisma: createFakePrisma(),
  })

  const response = await app.inject({ method: 'GET', url: '/v1/health/live' })
  const body = response.json()

  assert.equal(response.statusCode, 200)
  assert.equal(body.success, true)
  assert.deepEqual(body.data, { status: 'healthy' })
  assert.equal(typeof body.requestId, 'string')
  assert.equal(response.headers['x-request-id'], body.requestId)

  await app.close()
})

test('readiness route uses the versioned prefix and preserves valid request ids', async () => {
  const app = buildApp({
    environment: 'test',
    logger: false,
    prisma: createFakePrisma(),
  })

  const response = await app.inject({
    method: 'GET',
    url: '/v1/health',
    headers: { 'x-request-id': 'client-request-123' },
  })

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['x-request-id'], 'client-request-123')
  assert.equal(response.json().requestId, 'client-request-123')

  await app.close()
})

test('invalid request ids are replaced with generated ids', async () => {
  const app = buildApp({
    environment: 'test',
    logger: false,
    prisma: createFakePrisma(),
  })

  const response = await app.inject({
    method: 'GET',
    url: '/v1/health/live',
    headers: { 'x-request-id': 'contains spaces' },
  })
  const requestId = response.json().requestId

  assert.equal(response.statusCode, 200)
  assert.match(requestId, /^[0-9a-f-]{36}$/)
  assert.equal(response.headers['x-request-id'], requestId)

  await app.close()
})

test('unexpected errors use the standard sanitized error contract', async () => {
  const app = buildApp({
    environment: 'test',
    logger: false,
    prisma: createFakePrisma(),
  })
  app.get('/v1/test-error', async () => {
    throw new Error('secret database connection details')
  })

  const response = await app.inject({ method: 'GET', url: '/v1/test-error' })
  const body = response.json()

  assert.equal(response.statusCode, 500)
  assert.equal(body.success, false)
  assert.deepEqual(body.error, {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  })
  assert.equal(body.requestId, response.headers['x-request-id'])
  assert.equal(response.body.includes('secret database connection details'), false)

  await app.close()
})

test('unknown routes use the standard not-found error contract', async () => {
  const app = buildApp({
    environment: 'test',
    logger: false,
    prisma: createFakePrisma(),
  })

  const response = await app.inject({ method: 'GET', url: '/v1/missing' })
  const body = response.json()

  assert.equal(response.statusCode, 404)
  assert.deepEqual(body.error, {
    code: 'NOT_FOUND',
    message: 'Route not found',
  })
  assert.equal(body.requestId, response.headers['x-request-id'])

  await app.close()
})

test('security headers are applied to API responses', async () => {
  const app = buildApp({
    environment: 'test',
    logger: false,
    prisma: createFakePrisma(),
  })

  const response = await app.inject({ method: 'GET', url: '/v1/health/live' })

  assert.equal(response.headers['x-content-type-options'], 'nosniff')
  assert.equal(response.headers['x-frame-options'], 'DENY')
  assert.equal(response.headers['referrer-policy'], 'no-referrer')
  assert.equal(
    response.headers['permissions-policy'],
    'geolocation=(), microphone=(), camera=()',
  )
  assert.equal(
    response.headers['content-security-policy'],
    "default-src 'none'; frame-ancestors 'none'",
  )

  await app.close()
})
