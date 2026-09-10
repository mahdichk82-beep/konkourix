import type { FastifyInstance } from 'fastify'
import type { AuthService } from '../auth/auth-service.js'
import { requireAuth, requireRole } from '../auth/rbac.js'
import { successResponse } from '../contracts/api-response.js'

type RoleBoundaryRouteOptions = {
  auth: AuthService
}

export const registerRoleBoundaryRoutes = (
  app: FastifyInstance,
  options: RoleBoundaryRouteOptions,
): void => {
  app.get(
    '/student/session',
    { preHandler: [requireAuth(options.auth), requireRole('STUDENT')] },
    async (request) =>
      successResponse(request.user, request.context.requestId),
  )

  app.get(
    '/counselor/session',
    { preHandler: [requireAuth(options.auth), requireRole('COUNSELOR')] },
    async (request) =>
      successResponse(request.user, request.context.requestId),
  )
}
