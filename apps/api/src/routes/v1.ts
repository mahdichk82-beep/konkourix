import type { FastifyPluginAsync } from 'fastify'
import type { AuthService } from '../auth/auth-service.js'
import type { DomainService } from '../domain/domain-service.js'
import {
  registerHealthRoutes,
  type HealthDatabase,
} from './health.js'
import { registerAuthRoutes } from './auth.js'
import { registerDomainProfileRoutes } from './domain-profiles.js'
import { registerDomainRelationshipRoutes } from './domain-relationships.js'

type V1RouteOptions = {
  auth?: AuthService
  domain?: DomainService
  cookieSecure?: boolean
  environment: string
  prisma: HealthDatabase
  refreshTokenTtlSeconds?: number
}

export const registerV1Routes: FastifyPluginAsync<V1RouteOptions> = async (
  app,
  options,
) => {
  registerHealthRoutes(app, options)

  if (options.auth) {
    registerAuthRoutes(app, {
      auth: options.auth,
      cookieSecure: options.cookieSecure ?? false,
      refreshTokenTtlSeconds: options.refreshTokenTtlSeconds ?? 2_592_000,
    })

    if (options.domain) {
      registerDomainProfileRoutes(app, {
        auth: options.auth,
        domain: options.domain,
      })
      registerDomainRelationshipRoutes(app, {
        auth: options.auth,
        domain: options.domain,
      })
    }
  }
}
