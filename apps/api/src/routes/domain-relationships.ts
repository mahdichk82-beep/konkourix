import type { FastifyInstance } from 'fastify'
import type { AuthService } from '../auth/auth-service.js'
import { requireRoles } from '../auth/rbac.js'
import { successResponse } from '../contracts/api-response.js'
import type { DomainService } from '../domain/domain-service.js'
import { authenticateRequest } from '../plugins/authentication.js'
import { ApiError } from '../errors/api-error.js'
import { createRelationshipSchema, updateRelationshipSchema } from '../schemas/domain.js'

type DomainRelationshipRouteOptions = {
  auth: AuthService
  domain: DomainService
}

const parseBody = <T>(result: { success: boolean; data?: T }): T => {
  if (!result.success || result.data === undefined) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed')
  }
  return result.data
}

export const registerDomainRelationshipRoutes = (
  app: FastifyInstance,
  options: DomainRelationshipRouteOptions,
): void => {
  app.get(
    '/me/counselor-relationships',
    { preHandler: [authenticateRequest(options.auth), requireRoles('STUDENT')] },
    async (request) =>
      successResponse(
        await options.domain.listStudentRelationships(request.user!),
        request.context.requestId,
      ),
  )

  app.get(
    '/me/student-relationships',
    { preHandler: [authenticateRequest(options.auth), requireRoles('COUNSELOR')] },
    async (request) =>
      successResponse(
        await options.domain.listCounselorRelationships(request.user!),
        request.context.requestId,
      ),
  )

  app.post(
    '/admin/student-counselor-relationships',
    { preHandler: [authenticateRequest(options.auth), requireRoles('ADMIN')] },
    async (request, reply) =>
      reply.status(201).send(
        successResponse(
          await options.domain.createRelationship(
            request.user!,
            parseBody(createRelationshipSchema.safeParse(request.body)),
          ),
          request.context.requestId,
        ),
      ),
  )

  app.patch(
    '/admin/student-counselor-relationships/:relationshipId',
    { preHandler: [authenticateRequest(options.auth), requireRoles('ADMIN')] },
    async (request) => {
      const params = request.params as { relationshipId?: string }
      if (!params.relationshipId) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Relationship id is required')
      }

      return successResponse(
        await options.domain.updateRelationship(
          request.user!,
          params.relationshipId,
          parseBody(updateRelationshipSchema.safeParse(request.body)).status,
        ),
        request.context.requestId,
      )
    },
  )
}
