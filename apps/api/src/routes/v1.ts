import type { FastifyPluginAsync } from 'fastify'
import type { AuthService } from '../auth/auth-service.js'
import type { DomainService } from '../domain/domain-service.js'
import type { StudentCoreServices } from '../student-core/services.js'
import type { StudyTrackingServices } from '../study-tracking/services.js'
import {
  registerHealthRoutes,
  type HealthDatabase,
} from './health.js'
import { registerAuthRoutes } from './auth.js'
import { registerDomainProfileRoutes } from './domain-profiles.js'
import { registerDomainRelationshipRoutes } from './domain-relationships.js'
import { registerStudentCoreRoutes } from './student-core.js'
import { registerStudyTrackingRoutes } from './study-tracking.js'

type V1RouteOptions = {
  auth?: AuthService
  domain?: DomainService
  studentCore?: StudentCoreServices
  studyTracking?: StudyTrackingServices
  cookieDomain?: string
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
      cookieDomain: options.cookieDomain,
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

    if (options.studentCore) {
      registerStudentCoreRoutes(app, {
        auth: options.auth,
        studentCore: options.studentCore,
      })
    }

    if (options.studyTracking) {
      registerStudyTrackingRoutes(app, {
        auth: options.auth,
        studyTracking: options.studyTracking,
      })
    }
  }
}
