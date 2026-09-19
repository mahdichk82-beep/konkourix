import type { FastifyInstance } from 'fastify'
import type { AuthService } from '../auth/auth-service.js'
import type { CurriculumServices } from '../curriculum/services.js'
import { successResponse } from '../contracts/api-response.js'
import { ApiError } from '../errors/api-error.js'
import { authenticateRequest } from '../plugins/authentication.js'
import {
  curriculumNodeParamsSchema,
  curriculumPageSchema,
  curriculumSearchSchema,
  curriculumVersionIdSchema,
} from '../schemas/curriculum.js'

type Options = { auth: AuthService; curriculum: CurriculumServices }
const parse = <T>(result: { success: boolean; data?: T }): T => {
  if (!result.success || result.data === undefined) throw new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed')
  return result.data
}

export const registerCurriculumRoutes = (app: FastifyInstance, options: Options): void => {
  const authenticated = { preHandler: [authenticateRequest(options.auth)] }
  app.get('/curriculum/versions/current', authenticated, async (request) =>
    successResponse(await options.curriculum.currentPublished(request.user!), request.context.requestId))
  app.get('/curriculum/versions/:versionId', authenticated, async (request) => {
    const { versionId } = parse(curriculumVersionIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.publishedVersion(request.user!, versionId), request.context.requestId)
  })
  app.get('/curriculum/versions/:versionId/roots', authenticated, async (request) => {
    const { versionId } = parse(curriculumVersionIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.publishedRoots(request.user!, versionId), request.context.requestId)
  })
  app.get('/curriculum/versions/:versionId/nodes/:nodeId', authenticated, async (request) => {
    const { nodeId, versionId } = parse(curriculumNodeParamsSchema.safeParse(request.params))
    return successResponse(await options.curriculum.publishedNode(request.user!, versionId, nodeId), request.context.requestId)
  })
  app.get('/curriculum/versions/:versionId/nodes/:nodeId/children', authenticated, async (request) => {
    const { nodeId, versionId } = parse(curriculumNodeParamsSchema.safeParse(request.params))
    const query = parse(curriculumPageSchema.safeParse(request.query))
    return successResponse(await options.curriculum.publishedChildren(request.user!, versionId, nodeId, query), request.context.requestId)
  })
  app.get('/curriculum/versions/:versionId/nodes/:nodeId/path', authenticated, async (request) => {
    const { nodeId, versionId } = parse(curriculumNodeParamsSchema.safeParse(request.params))
    return successResponse(await options.curriculum.publishedPath(request.user!, versionId, nodeId), request.context.requestId)
  })
  app.get('/curriculum/versions/:versionId/search', authenticated, async (request) => {
    const { versionId } = parse(curriculumVersionIdSchema.safeParse(request.params))
    const { q, ...query } = parse(curriculumSearchSchema.safeParse(request.query))
    return successResponse(await options.curriculum.publishedSearch(request.user!, versionId, q, query), request.context.requestId)
  })
}
