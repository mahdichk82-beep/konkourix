import type { FastifyInstance } from 'fastify'
import type { AuthService } from '../auth/auth-service.js'
import { requireRoles } from '../auth/rbac.js'
import type { CounselorTaskServices } from '../counselor-tasks/services.js'
import { successResponse } from '../contracts/api-response.js'
import { ApiError } from '../errors/api-error.js'
import { authenticateRequest } from '../plugins/authentication.js'
import {
  counselorStudentTaskParamSchema,
  counselorStudentTopicParamSchema,
  createCounselorTaskSchema,
  listCounselorTaskResourcesSchema,
} from '../schemas/counselor-tasks.js'

type CounselorTaskRouteOptions = {
  auth: AuthService
  counselorTasks: CounselorTaskServices
}

const parseInput = <T>(result: { success: boolean; data?: T }): T => {
  if (!result.success || result.data === undefined) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed')
  }
  return result.data
}

export const registerCounselorTaskRoutes = (
  app: FastifyInstance,
  options: CounselorTaskRouteOptions,
): void => {
  const counselorOnly = {
    preHandler: [authenticateRequest(options.auth), requireRoles('COUNSELOR')],
  }

  app.get(
    '/counselor/students/:studentProfileId/subjects',
    counselorOnly,
    async (request) => {
      const { studentProfileId } = parseInput(
        counselorStudentTaskParamSchema.safeParse(request.params),
      )
      const query = parseInput(listCounselorTaskResourcesSchema.safeParse(request.query))
      return successResponse(
        await options.counselorTasks.listSubjects(request.user!, studentProfileId, query),
        request.context.requestId,
      )
    },
  )

  app.get(
    '/counselor/students/:studentProfileId/subjects/:subjectId/topics',
    counselorOnly,
    async (request) => {
      const { studentProfileId, subjectId } = parseInput(
        counselorStudentTopicParamSchema.safeParse(request.params),
      )
      const query = parseInput(listCounselorTaskResourcesSchema.safeParse(request.query))
      return successResponse(
        await options.counselorTasks.listTopics(
          request.user!,
          studentProfileId,
          subjectId,
          query,
        ),
        request.context.requestId,
      )
    },
  )

  app.post(
    '/counselor/students/:studentProfileId/tasks',
    counselorOnly,
    async (request, reply) => {
      const { studentProfileId } = parseInput(
        counselorStudentTaskParamSchema.safeParse(request.params),
      )
      const input = parseInput(createCounselorTaskSchema.safeParse(request.body))
      return reply.status(201).send(
        successResponse(
          await options.counselorTasks.create(request.user!, studentProfileId, input),
          request.context.requestId,
        ),
      )
    },
  )
}
