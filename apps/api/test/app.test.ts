import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'
import { closeResources } from '../src/lib/lifecycle.js'

type FakePrisma = {
  queryCount: number
  shouldFail: boolean
  $queryRaw: () => Promise<unknown>
}

const createFakePrisma = (shouldFail = false): FakePrisma => {
  const fakePrisma: FakePrisma = {
    queryCount: 0,
    shouldFail,
    $queryRaw: async () => {
      fakePrisma.queryCount += 1

      if (fakePrisma.shouldFail) {
        throw new Error('database connection failed')
      }

      return [{ '?column?': 1 }]
    },
  }

  return fakePrisma
}

test('liveness health check does not access the database', async () => {
  const prisma = createFakePrisma()
  const app = buildApp({ environment: 'test', logger: false, prisma })

  const response = await app.inject({ method: 'GET', url: '/health/live' })

  assert.equal(response.statusCode, 200)
  const body = response.json()

  assert.equal(body.success, true)
  assert.deepEqual(body.data, { status: 'healthy' })
  assert.equal(typeof body.requestId, 'string')
  assert.equal(response.headers['x-request-id'], body.requestId)
  assert.equal(prisma.queryCount, 0)

  await app.close()
})

test('readiness health check reports a connected database', async () => {
  const prisma = createFakePrisma()
  const app = buildApp({ environment: 'test', logger: false, prisma })

  const response = await app.inject({ method: 'GET', url: '/health' })

  assert.equal(response.statusCode, 200)
  const body = response.json()

  assert.equal(body.success, true)
  assert.deepEqual(body.data, {
    status: 'healthy',
    environment: 'test',
    database: 'connected',
  })
  assert.equal(typeof body.requestId, 'string')
  assert.equal(response.headers['x-request-id'], body.requestId)
  assert.equal(prisma.queryCount, 1)

  await app.close()
})

test('readiness health check hides database errors and returns service unavailable', async () => {
  const prisma = createFakePrisma(true)
  const app = buildApp({ environment: 'test', logger: false, prisma })

  const response = await app.inject({ method: 'GET', url: '/health' })

  assert.equal(response.statusCode, 503)
  const body = response.json()

  assert.deepEqual(body.error, {
    code: 'DATABASE_UNAVAILABLE',
    message: 'Database is unavailable',
  })
  assert.equal(body.success, false)
  assert.equal(response.body.includes('database connection failed'), false)
  assert.equal(body.requestId, response.headers['x-request-id'])
  assert.equal(prisma.queryCount, 1)

  await app.close()
})

test('shutdown closes the HTTP app before disconnecting Prisma', async () => {
  const events: string[] = []
  const app = {
    close: async () => {
      events.push('app.close')
    },
  }
  const prisma = {
    $disconnect: async () => {
      events.push('prisma.disconnect')
    },
  }

  await closeResources(app, prisma)

  assert.deepEqual(events, ['app.close', 'prisma.disconnect'])
})

test('forwarded request metadata is trusted only for an explicit proxy address', async () => {
  const prisma = createFakePrisma()
  const untrusted = buildApp({ environment: 'test', logger: false, prisma })
  untrusted.get('/request-metadata', async (request) => ({
    ip: request.ip,
    protocol: request.protocol,
  }))

  const headers = {
    'x-forwarded-for': '203.0.113.10',
    'x-forwarded-proto': 'https',
  }
  const untrustedResponse = await untrusted.inject({
    headers,
    method: 'GET',
    url: '/request-metadata',
  })

  assert.deepEqual(untrustedResponse.json(), {
    ip: '127.0.0.1',
    protocol: 'http',
  })
  await untrusted.close()

  const trusted = buildApp({
    environment: 'test',
    logger: false,
    prisma,
    trustProxy: ['127.0.0.1'],
  })
  trusted.get('/request-metadata', async (request) => ({
    ip: request.ip,
    protocol: request.protocol,
  }))

  const trustedResponse = await trusted.inject({
    headers,
    method: 'GET',
    url: '/request-metadata',
  })

  assert.deepEqual(trustedResponse.json(), {
    ip: '203.0.113.10',
    protocol: 'https',
  })
  await trusted.close()
})
