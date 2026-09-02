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
  assert.deepEqual(response.json(), {
    success: true,
    data: { status: 'healthy' },
  })
  assert.equal(prisma.queryCount, 0)

  await app.close()
})

test('readiness health check reports a connected database', async () => {
  const prisma = createFakePrisma()
  const app = buildApp({ environment: 'test', logger: false, prisma })

  const response = await app.inject({ method: 'GET', url: '/health' })

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), {
    success: true,
    data: {
      status: 'healthy',
      environment: 'test',
      database: 'connected',
    },
  })
  assert.equal(prisma.queryCount, 1)

  await app.close()
})

test('readiness health check hides database errors and returns service unavailable', async () => {
  const prisma = createFakePrisma(true)
  const app = buildApp({ environment: 'test', logger: false, prisma })

  const response = await app.inject({ method: 'GET', url: '/health' })

  assert.equal(response.statusCode, 503)
  assert.deepEqual(response.json(), {
    success: false,
    data: {
      status: 'unhealthy',
      database: 'disconnected',
    },
  })
  assert.equal(response.body.includes('database connection failed'), false)
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
