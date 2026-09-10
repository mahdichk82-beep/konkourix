import type { FastifyInstance } from 'fastify'
import { ApiError } from '../errors/api-error.js'

const authRateLimitRoutes = [
  '/v1/auth/register',
  '/v1/auth/login',
  '/v1/auth/refresh',
] as const

type AuthRateLimitRoute = (typeof authRateLimitRoutes)[number]

export type AuthRateLimitPolicy = {
  maxAttempts: number
  windowMs: number
}

export type AuthRateLimitOptions = {
  maxTrackedKeys?: number
  now?: () => number
  policies?: Partial<Record<AuthRateLimitRoute, AuthRateLimitPolicy>>
}

type RateLimitBucket = {
  attempts: number
  resetAt: number
}

const defaultPolicies: Record<AuthRateLimitRoute, AuthRateLimitPolicy> = {
  '/v1/auth/register': { maxAttempts: 10, windowMs: 10 * 60_000 },
  '/v1/auth/login': { maxAttempts: 20, windowMs: 60_000 },
  '/v1/auth/refresh': { maxAttempts: 60, windowMs: 60_000 },
}

const assertPositiveInteger = (value: number, name: string): void => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }
}

export const registerAuthRateLimit = (
  app: FastifyInstance,
  options: AuthRateLimitOptions = {},
): void => {
  const policies = { ...defaultPolicies, ...options.policies }
  const maxTrackedKeys = options.maxTrackedKeys ?? 10_000
  const now = options.now ?? Date.now
  const buckets = new Map<string, RateLimitBucket>()
  let nextSweepAt = 0

  assertPositiveInteger(maxTrackedKeys, 'maxTrackedKeys')
  for (const [route, policy] of Object.entries(policies)) {
    assertPositiveInteger(policy.maxAttempts, `${route} maxAttempts`)
    assertPositiveInteger(policy.windowMs, `${route} windowMs`)
  }

  app.addHook('onRequest', async (request, reply) => {
    if (request.method !== 'POST') return

    const path = request.routeOptions.url as AuthRateLimitRoute
    const policy = policies[path]
    if (!policy) return

    const currentTime = now()
    if (currentTime >= nextSweepAt) {
      for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= currentTime) buckets.delete(key)
      }
      nextSweepAt = currentTime + 60_000
    }

    const key = `${request.ip}\u0000${path}`
    let bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= currentTime) {
      if (!bucket && buckets.size >= maxTrackedKeys) {
        const oldestKey = buckets.keys().next().value
        if (typeof oldestKey === 'string') buckets.delete(oldestKey)
      }

      bucket = {
        attempts: 0,
        resetAt: currentTime + policy.windowMs,
      }
      buckets.set(key, bucket)
    }

    if (bucket.attempts >= policy.maxAttempts) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((bucket.resetAt - currentTime) / 1000),
      )
      reply.header('retry-after', String(retryAfterSeconds))
      throw new ApiError(429, 'RATE_LIMITED', 'Too many authentication attempts')
    }

    bucket.attempts += 1
  })

  app.addHook('onClose', async () => {
    buckets.clear()
  })
}
