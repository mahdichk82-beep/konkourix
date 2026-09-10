import type { FastifyInstance } from 'fastify'
import type { AuthService } from '../auth/auth-service.js'
import { requireRoles } from '../auth/rbac.js'
import { successResponse } from '../contracts/api-response.js'
import type { DomainService } from '../domain/domain-service.js'
import { ApiError } from '../errors/api-error.js'
import { authenticateRequest } from '../plugins/authentication.js'
import {
  counselorStudentIdParamSchema,
  listCounselorStudentsSchema,
} from '../schemas/domain.js'

type CounselorStudentRouteOptions = {
  auth: AuthService
  domain: DomainService
}

const parseInput = <T>(result: { success: boolean; data?: T }): T => {
  if (!result.success || result.data === undefined) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed')
  }
  return result.data
}

export const registerCounselorStudentRoutes = (
  app: FastifyInstance,
  options: CounselorStudentRouteOptions,
): void => {
  const counselorOnly = [authenticateRequest(options.auth), requireRoles('COUNSELOR')]

  app.get(
    '/counselor/students',
    { preHandler: counselorOnly },
    async (request) =>
      successResponse(
        await options.domain.listAssignedStudents(
          request.user!,
          parseInput(listCounselorStudentsSchema.safeParse(request.query)),
        ),
        request.context.requestId,
      ),
  )

  app.get(
    '/counselor/students/:id',
    { preHandler: counselorOnly },
    async (request) =>
      successResponse(
        await options.domain.getAssignedStudent(
          request.user!,
          parseInput(counselorStudentIdParamSchema.safeParse(request.params)).id,
        ),
        request.context.requestId,
      ),
  )
}
