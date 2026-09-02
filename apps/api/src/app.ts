import Fastify, { type FastifyInstance } from 'fastify'
import { generateRequestId, registerRequestContext } from './plugins/request-context.js'
import { registerSecurityHeaders } from './plugins/security.js'
import { registerErrorHandling } from './errors/error-handler.js'
import { registerHealthRoutes, type HealthDatabase } from './routes/health.js'
import { registerV1Routes } from './routes/v1.js'

export type BuildAppOptions = {
  environment: string
  logger?: boolean
  prisma: HealthDatabase
}

export const buildApp = ({
  environment,
  logger = true,
  prisma,
}: BuildAppOptions): FastifyInstance => {
  const app = Fastify({
    genReqId: generateRequestId,
    logger,
    requestIdHeader: false,
  })

  registerErrorHandling(app)
  registerRequestContext(app)
  registerSecurityHeaders(app)

  const routeOptions = {
    environment,
    prisma,
  }

  app.register(registerV1Routes, {
    ...routeOptions,
    prefix: '/v1',
  })

  registerHealthRoutes(app, routeOptions)

  return app
}
