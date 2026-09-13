import type { FastifyInstance } from 'fastify'
import type { AssessmentAttemptServices } from '../assessment-attempts/services.js'
import type { AuthService } from '../auth/auth-service.js'
import { requireRoles } from '../auth/rbac.js'
import { successResponse } from '../contracts/api-response.js'
import { ApiError } from '../errors/api-error.js'
import { authenticateRequest } from '../plugins/authentication.js'
import {
  assessmentAttemptIdSchema,
  createAssessmentAttemptSchema,
  invalidateAssessmentAttemptSchema,
  listAssessmentAttemptsSchema,
  updateAssessmentAttemptSchema,
} from '../schemas/assessment-attempts.js'

type AssessmentAttemptRouteOptions = {
  assessmentAttempts: AssessmentAttemptServices
  auth: AuthService
}

const parseInput = <T>(result: { success: boolean; data?: T }): T => {
  if (!result.success || result.data === undefined) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed')
  }
  return result.data
}

const parseId = (params: unknown): string =>
  parseInput(assessmentAttemptIdSchema.safeParse(params)).id

export const registerAssessmentAttemptRoutes = (
  app: FastifyInstance,
  options: AssessmentAttemptRouteOptions,
): void => {
  const studentOnly = {
    preHandler: [authenticateRequest(options.auth), requireRoles('STUDENT')],
  }

  app.post('/student/assessment-attempts', studentOnly, async (request, reply) =>
    reply.status(201).send(successResponse(
      await options.assessmentAttempts.create(
        request.user!,
        parseInput(createAssessmentAttemptSchema.safeParse(request.body)),
      ),
      request.context.requestId,
    )),
  )

  app.get('/student/assessment-attempts', studentOnly, async (request) =>
    successResponse(
      await options.assessmentAttempts.list(
        request.user!,
        parseInput(listAssessmentAttemptsSchema.safeParse(request.query)),
      ),
      request.context.requestId,
    ),
  )

  app.get('/student/assessment-attempts/:id', studentOnly, async (request) =>
    successResponse(
      await options.assessmentAttempts.get(request.user!, parseId(request.params)),
      request.context.requestId,
    ),
  )

  app.patch('/student/assessment-attempts/:id', studentOnly, async (request) =>
    successResponse(
      await options.assessmentAttempts.update(
        request.user!,
        parseId(request.params),
        parseInput(updateAssessmentAttemptSchema.safeParse(request.body)),
      ),
      request.context.requestId,
    ),
  )

  app.patch('/student/assessment-attempts/:id/invalidate', studentOnly, async (request) => {
    parseInput(invalidateAssessmentAttemptSchema.safeParse(request.body ?? {}))
    return successResponse(
      await options.assessmentAttempts.invalidate(request.user!, parseId(request.params)),
      request.context.requestId,
    )
  })
}
