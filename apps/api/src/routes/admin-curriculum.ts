import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { AuthService } from '../auth/auth-service.js'
import { successResponse } from '../contracts/api-response.js'
import type { CurriculumServices } from '../curriculum/services.js'
import { ApiError } from '../errors/api-error.js'
import { authenticateRequest } from '../plugins/authentication.js'
import {
  adminGrantIdSchema,
  adminImportIdSchema,
  adminImportIssueParamsSchema,
  adminNodeParamsSchema,
  adminPageSchema,
  adminRelationshipParamsSchema,
  adminValidationIdSchema,
  adminVersionIdSchema,
  createGrantSchema,
  createLegacyMappingSchema,
  createNodeMappingSchema,
  createNodeSchema,
  createRelationshipSchema,
  createVersionSchema,
  importManifestSchema,
  listAuditSchema,
  listGrantsSchema,
  listIssuesSchema,
  listLegacyMappingsSchema,
  listNodeMappingsSchema,
  listVersionsSchema,
  publishVersionSchema,
  resolveIssueSchema,
  reviewDecisionSchema,
  revisionReasonSchema,
  revokeGrantSchema,
  submitReviewSchema,
  updateNodeSchema,
  updateRelationshipSchema,
  updateVersionSchema,
} from '../schemas/admin-curriculum.js'

type Options = { auth: AuthService; curriculum: CurriculumServices }
const parse = <T>(result: { success: boolean; data?: T }): T => {
  if (!result.success || result.data === undefined) throw new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed')
  return result.data
}
const context = (request: { context: { requestId: string } }) => ({ requestId: request.context.requestId })

export const registerAdminCurriculumRoutes = (app: FastifyInstance, options: Options): void => {
  const authenticated = { preHandler: [authenticateRequest(options.auth)] }

  app.get('/admin/curriculum/node-types', authenticated, async (request) =>
    successResponse(await options.curriculum.listNodeTypes(request.user!), request.context.requestId))
  app.get('/admin/curriculum/versions', authenticated, async (request) =>
    successResponse(await options.curriculum.listVersions(request.user!, parse(listVersionsSchema.safeParse(request.query))), request.context.requestId))
  app.post('/admin/curriculum/versions', authenticated, async (request, reply) => {
    const input = parse(createVersionSchema.safeParse(request.body))
    return reply.status(201).send(successResponse(await options.curriculum.createVersion(request.user!, {
      ...input,
      effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
    }, context(request)), request.context.requestId))
  })
  app.get('/admin/curriculum/versions/:versionId', authenticated, async (request) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.getVersion(request.user!, versionId), request.context.requestId)
  })
  app.patch('/admin/curriculum/versions/:versionId', authenticated, async (request) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    const input = parse(updateVersionSchema.safeParse(request.body))
    return successResponse(await options.curriculum.updateVersion(request.user!, versionId, {
      ...input,
      effectiveFrom: input.effectiveFrom === undefined ? undefined : input.effectiveFrom === null ? null : new Date(input.effectiveFrom),
    }, context(request)), request.context.requestId)
  })
  app.get('/admin/curriculum/versions/:versionId/roots', authenticated, async (request) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.adminRoots(request.user!, versionId), request.context.requestId)
  })
  app.post('/admin/curriculum/versions/:versionId/nodes', authenticated, async (request, reply) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    const input = parse(createNodeSchema.safeParse(request.body))
    return reply.status(201).send(successResponse(await options.curriculum.createNode(request.user!, versionId, input, context(request)), request.context.requestId))
  })
  app.get('/admin/curriculum/versions/:versionId/nodes/:nodeId', authenticated, async (request) => {
    const { nodeId, versionId } = parse(adminNodeParamsSchema.safeParse(request.params))
    return successResponse(await options.curriculum.adminNode(request.user!, versionId, nodeId), request.context.requestId)
  })
  app.patch('/admin/curriculum/versions/:versionId/nodes/:nodeId', authenticated, async (request) => {
    const { nodeId, versionId } = parse(adminNodeParamsSchema.safeParse(request.params))
    return successResponse(await options.curriculum.updateNode(request.user!, versionId, nodeId, parse(updateNodeSchema.safeParse(request.body)), context(request)), request.context.requestId)
  })
  app.delete('/admin/curriculum/versions/:versionId/nodes/:nodeId', authenticated, async (request) => {
    const { nodeId, versionId } = parse(adminNodeParamsSchema.safeParse(request.params))
    return successResponse(await options.curriculum.deleteNode(request.user!, versionId, nodeId, parse(revisionReasonSchema.safeParse(request.body)), context(request)), request.context.requestId)
  })

  app.get('/admin/curriculum/versions/:versionId/relationships', authenticated, async (request) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.listRelationships(request.user!, versionId, parse(adminPageSchema.safeParse(request.query))), request.context.requestId)
  })
  app.post('/admin/curriculum/versions/:versionId/relationships', authenticated, async (request, reply) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    return reply.status(201).send(successResponse(await options.curriculum.createRelationship(request.user!, versionId, parse(createRelationshipSchema.safeParse(request.body)), context(request)), request.context.requestId))
  })
  app.patch('/admin/curriculum/versions/:versionId/relationships/:relationshipId', authenticated, async (request) => {
    const { relationshipId, versionId } = parse(adminRelationshipParamsSchema.safeParse(request.params))
    return successResponse(await options.curriculum.updateRelationship(request.user!, versionId, relationshipId, parse(updateRelationshipSchema.safeParse(request.body)), context(request)), request.context.requestId)
  })
  app.delete('/admin/curriculum/versions/:versionId/relationships/:relationshipId', authenticated, async (request) => {
    const { relationshipId, versionId } = parse(adminRelationshipParamsSchema.safeParse(request.params))
    return successResponse(await options.curriculum.deleteRelationship(request.user!, versionId, relationshipId, parse(revisionReasonSchema.safeParse(request.body)), context(request)), request.context.requestId)
  })

  app.get('/admin/curriculum/versions/:versionId/imports', authenticated, async (request) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.listImports(request.user!, versionId, parse(adminPageSchema.safeParse(request.query))), request.context.requestId)
  })
  app.post('/admin/curriculum/versions/:versionId/imports', authenticated, async (request, reply) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    return reply.status(201).send(successResponse(await options.curriculum.executeImport(request.user!, versionId, parse(importManifestSchema.safeParse(request.body)), context(request)), request.context.requestId))
  })
  app.get('/admin/curriculum/imports/:importId', authenticated, async (request) => {
    const { importId } = parse(adminImportIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.getImport(request.user!, importId), request.context.requestId)
  })
  app.get('/admin/curriculum/imports/:importId/source-records', authenticated, async (request) => {
    const { importId } = parse(adminImportIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.listSourceRecords(request.user!, importId, parse(adminPageSchema.safeParse(request.query))), request.context.requestId)
  })
  app.get('/admin/curriculum/imports/:importId/issues', authenticated, async (request) => {
    const { importId } = parse(adminImportIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.listImportIssues(request.user!, importId, parse(listIssuesSchema.safeParse(request.query))), request.context.requestId)
  })
  app.post('/admin/curriculum/imports/:importId/issues/:issueId/decisions', authenticated, async (request) => {
    const { importId, issueId } = parse(adminImportIssueParamsSchema.safeParse(request.params))
    return successResponse(await options.curriculum.resolveImportIssue(request.user!, importId, issueId, parse(resolveIssueSchema.safeParse(request.body)), context(request)), request.context.requestId)
  })

  app.post('/admin/curriculum/versions/:versionId/validations', authenticated, async (request, reply) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    parse(z.object({}).strict().safeParse(request.body ?? {}))
    return reply.status(201).send(successResponse(await options.curriculum.validateVersion(request.user!, versionId, context(request)), request.context.requestId))
  })
  app.get('/admin/curriculum/versions/:versionId/validations', authenticated, async (request) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.listValidations(request.user!, versionId, parse(adminPageSchema.safeParse(request.query))), request.context.requestId)
  })
  app.get('/admin/curriculum/validations/:validationId', authenticated, async (request) => {
    const { validationId } = parse(adminValidationIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.getValidation(request.user!, validationId), request.context.requestId)
  })
  app.post('/admin/curriculum/versions/:versionId/submit-review', authenticated, async (request) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.submitReview(request.user!, versionId, parse(submitReviewSchema.safeParse(request.body)), context(request)), request.context.requestId)
  })
  app.post('/admin/curriculum/versions/:versionId/review-decisions', authenticated, async (request, reply) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    return reply.status(201).send(successResponse(await options.curriculum.recordReviewDecision(request.user!, versionId, parse(reviewDecisionSchema.safeParse(request.body)), context(request)), request.context.requestId))
  })
  app.get('/admin/curriculum/versions/:versionId/review-decisions', authenticated, async (request) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.listReviewDecisions(request.user!, versionId, parse(adminPageSchema.safeParse(request.query))), request.context.requestId)
  })
  app.post('/admin/curriculum/versions/:versionId/publish', authenticated, async (request) => {
    const { versionId } = parse(adminVersionIdSchema.safeParse(request.params))
    return successResponse(await options.curriculum.publishVersion(request.user!, versionId, parse(publishVersionSchema.safeParse(request.body)), context(request)), request.context.requestId)
  })

  app.get('/admin/curriculum/node-mappings', authenticated, async (request) =>
    successResponse(await options.curriculum.listNodeMappings(request.user!, parse(listNodeMappingsSchema.safeParse(request.query))), request.context.requestId))
  app.post('/admin/curriculum/node-mappings', authenticated, async (request, reply) =>
    reply.status(201).send(successResponse(await options.curriculum.createNodeMapping(request.user!, parse(createNodeMappingSchema.safeParse(request.body)), context(request)), request.context.requestId)))
  app.get('/admin/curriculum/legacy-mappings', authenticated, async (request) =>
    successResponse(await options.curriculum.listLegacyMappings(request.user!, parse(listLegacyMappingsSchema.safeParse(request.query))), request.context.requestId))
  app.post('/admin/curriculum/legacy-mappings', authenticated, async (request, reply) =>
    reply.status(201).send(successResponse(await options.curriculum.createLegacyMapping(request.user!, parse(createLegacyMappingSchema.safeParse(request.body)), context(request)), request.context.requestId)))
  app.get('/admin/curriculum/audit', authenticated, async (request) =>
    successResponse(await options.curriculum.listAudit(request.user!, parse(listAuditSchema.safeParse(request.query))), request.context.requestId))

  app.get('/admin/curriculum/capability-grants', authenticated, async (request) =>
    successResponse(await options.curriculum.listCapabilityGrants(request.user!, parse(listGrantsSchema.safeParse(request.query))), request.context.requestId))
  app.post('/admin/curriculum/capability-grants', authenticated, async (request, reply) => {
    const input = parse(createGrantSchema.safeParse(request.body))
    return reply.status(201).send(successResponse(await options.curriculum.grantCapability(request.user!, {
      ...input, expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    }, context(request)), request.context.requestId))
  })
  app.post('/admin/curriculum/capability-grants/:grantId/revoke', authenticated, async (request) => {
    const { grantId } = parse(adminGrantIdSchema.safeParse(request.params))
    const { reason } = parse(revokeGrantSchema.safeParse(request.body))
    return successResponse(await options.curriculum.revokeCapability(request.user!, grantId, reason, context(request)), request.context.requestId)
  })
}
