import Fastify, { type FastifyInstance } from 'fastify'
import cookie from '@fastify/cookie'
import type { AuthService } from './auth/auth-service.js'
import type { DomainService } from './domain/domain-service.js'
import { generateRequestId, registerRequestContext } from './plugins/request-context.js'
import { registerSecurityHeaders } from './plugins/security.js'
import { registerErrorHandling } from './errors/error-handler.js'
import { registerHealthRoutes, type HealthDatabase } from './routes/health.js'
import { registerV1Routes } from './routes/v1.js'

export type BuildAppOptions = {
  auth?: AuthService
  domain?: DomainService
  cookieSecure?: boolean
  environment: string
  logger?: boolean
  prisma: HealthDatabase
  refreshTokenTtlSeconds?: number
}

export const buildApp = ({
  environment,
  auth,
  domain,
  cookieSecure = false,
  logger = true,
  prisma,
  refreshTokenTtlSeconds = 2_592_000,
}: BuildAppOptions): FastifyInstance => {
  const app = Fastify({
    genReqId: generateRequestId,
    logger,
    requestIdHeader: false,
  })

  registerErrorHandling(app)
  registerRequestContext(app)
  registerSecurityHeaders(app)
  app.register(cookie)

  const routeOptions = {
    auth,
    domain,
    cookieSecure,
    environment,
    prisma,
    refreshTokenTtlSeconds,
  }

  app.register(registerV1Routes, {
    ...routeOptions,
    prefix: '/v1',
  })

  registerHealthRoutes(app, routeOptions)

  return app
}
