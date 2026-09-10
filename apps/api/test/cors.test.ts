import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'

const studentOrigin = 'https://app.konkourix.ir'
const counselorOrigin = 'https://counselor.konkourix.ir'

const createApp = () => buildApp({
  corsOrigins: [studentOrigin, counselorOrigin],
  environment: 'test',
  logger: false,
  prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
})

test('CORS grants credentialed access to the student origin', async () => {
  const app = createApp()
  const response = await app.inject({
    headers: { origin: studentOrigin },
    method: 'GET',
    url: '/health/live',
  })

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['access-control-allow-origin'], studentOrigin)
  assert.equal(response.headers['access-control-allow-credentials'], 'true')
  assert.equal(response.headers.vary, 'Origin')

  await app.close()
})

test('CORS grants credentialed access to the counselor origin', async () => {
  const app = createApp()
  const response = await app.inject({
    headers: { origin: counselorOrigin },
    method: 'GET',
    url: '/health/live',
  })

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['access-control-allow-origin'], counselorOrigin)
  assert.equal(response.headers['access-control-allow-credentials'], 'true')

  await app.close()
})

test('CORS rejects an unlisted browser origin without granting permission', async () => {
  const app = createApp()
  const response = await app.inject({
    headers: { origin: 'https://attacker.example' },
    method: 'GET',
    url: '/health/live',
  })

  assert.equal(response.statusCode, 403)
  assert.equal(response.json().error.code, 'ORIGIN_NOT_ALLOWED')
  assert.equal(response.headers['access-control-allow-origin'], undefined)

  await app.close()
})

test('CORS answers allowed preflight requests with the credential policy', async () => {
  const app = createApp()
  const response = await app.inject({
    headers: {
      origin: studentOrigin,
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type',
    },
    method: 'OPTIONS',
    url: '/api/v1/auth/refresh',
  })

  assert.equal(response.statusCode, 204)
  assert.equal(response.headers['access-control-allow-origin'], studentOrigin)
  assert.equal(response.headers['access-control-allow-credentials'], 'true')
  assert.match(response.headers['access-control-allow-methods'], /POST/)
  assert.match(response.headers['access-control-allow-headers'], /Content-Type/)

  await app.close()
})

test('requests without an Origin header preserve non-browser behavior', async () => {
  const app = createApp()
  const response = await app.inject({ method: 'GET', url: '/health/live' })

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['access-control-allow-origin'], undefined)

  await app.close()
})
