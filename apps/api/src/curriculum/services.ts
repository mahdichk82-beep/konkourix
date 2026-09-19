import { ApiError } from '../errors/api-error.js'
import type { CurriculumStore, LegacyMappingInput, MappingInput, RelationshipInput, StoreCommandResult } from './store.js'
import type {
  CreateNodeInput,
  CreateVersionInput,
  CurriculumActor,
  CurriculumCapability,
  CurriculumImportIssueRecord,
  CurriculumImportManifest,
  CurriculumNodeRecord,
  CurriculumReviewOutcome,
  CurriculumVersionRecord,
  LegacyCurriculumKind,
  PageQuery,
  RequestContext,
  UpdateNodeInput,
  UpdateVersionInput,
} from './types.js'

const reasonErrors: Record<string, [number, string, string]> = {
  ADMIN_NOT_FOUND: [404, 'ADMIN_NOT_FOUND', 'Active administrator not found'],
  ACTIVE_GRANT_EXISTS: [409, 'CURRICULUM_GRANT_EXISTS', 'An active capability grant already exists'],
  BLOCKING_IMPORT_ISSUES: [409, 'CURRICULUM_BLOCKED', 'Unresolved blocking import issues prevent this operation'],
  CAPABILITY_REVOKED: [403, 'CURRICULUM_CAPABILITY_FORBIDDEN', 'Curriculum capability is no longer effective'],
  BOOTSTRAP_ALREADY_COMPLETED: [409, 'CURRICULUM_BOOTSTRAP_COMPLETE', 'Curriculum permission bootstrap is already complete'],
  DUPLICATE_LABEL: [409, 'CURRICULUM_VERSION_LABEL_EXISTS', 'Curriculum version label already exists'],
  DUPLICATE_POSITION: [409, 'CURRICULUM_POSITION_CONFLICT', 'Curriculum sibling position is already used'],
  DUPLICATE_RELATIONSHIP: [409, 'CURRICULUM_RELATIONSHIP_EXISTS', 'Curriculum relationship already exists'],
  DUPLICATE_MAPPING: [409, 'CURRICULUM_MAPPING_EXISTS', 'This mapping decision already exists'],
  GRANT_NOT_FOUND: [404, 'CURRICULUM_GRANT_NOT_FOUND', 'Capability grant not found'],
  IMPORT_NOT_FOUND: [404, 'CURRICULUM_IMPORT_NOT_FOUND', 'Curriculum import not found'],
  IMPORT_FAILED: [500, 'CURRICULUM_IMPORT_FAILED', 'Curriculum import failed and was retained for review'],
  IMPORT_MANIFEST_INVALID: [400, 'CURRICULUM_IMPORT_MANIFEST_INVALID', 'Curriculum import manifest failed integrity or structural validation'],
  IMPORT_PAYLOAD_CONFLICT: [409, 'CURRICULUM_IMPORT_IDEMPOTENCY_CONFLICT', 'Idempotency key was used with a different import payload'],
  ISSUE_ALREADY_RESOLVED: [409, 'CURRICULUM_ISSUE_RESOLVED', 'Curriculum import issue is already resolved'],
  ISSUE_NOT_FOUND: [404, 'CURRICULUM_ISSUE_NOT_FOUND', 'Curriculum import issue not found'],
  LEGACY_RECORD_NOT_FOUND: [404, 'LEGACY_CURRICULUM_RECORD_NOT_FOUND', 'Legacy curriculum record not found'],
  MAPPING_NOT_FOUND: [404, 'CURRICULUM_MAPPING_NOT_FOUND', 'Curriculum mapping not found'],
  NODE_HAS_DEPENDENTS: [409, 'CURRICULUM_NODE_HAS_DEPENDENTS', 'Curriculum node has children or governed references'],
  NODE_NOT_FOUND: [404, 'CURRICULUM_NODE_NOT_FOUND', 'Curriculum node not found'],
  NODE_TYPE_INACTIVE: [409, 'CURRICULUM_NODE_TYPE_INACTIVE', 'Curriculum node type is inactive'],
  NODE_TYPE_NOT_FOUND: [400, 'CURRICULUM_NODE_TYPE_INVALID', 'Curriculum node type is invalid'],
  PARENT_NOT_FOUND: [400, 'CURRICULUM_PARENT_INVALID', 'Curriculum parent is not present in this version'],
  PARENT_CYCLE: [409, 'CURRICULUM_PARENT_CYCLE', 'Curriculum node move would create a cycle'],
  PARENT_TYPE_INVALID: [409, 'CURRICULUM_PARENT_TYPE_INVALID', 'Curriculum parent type is not allowed for this node type'],
  PUBLICATION_ALREADY_COMMITTED: [409, 'CURRICULUM_PUBLICATION_COMMITTED', 'This publication request has already committed'],
  RELATIONSHIP_NOT_FOUND: [404, 'CURRICULUM_RELATIONSHIP_NOT_FOUND', 'Curriculum relationship not found'],
  REVIEW_NOT_APPROVED: [409, 'CURRICULUM_REVIEW_REQUIRED', 'A current approved review is required'],
  REVIEW_NOT_FOUND: [404, 'CURRICULUM_REVIEW_NOT_FOUND', 'Curriculum review decision not found'],
  SELF_GRANT_FORBIDDEN: [403, 'CURRICULUM_SELF_GRANT_FORBIDDEN', 'Curriculum self-grant is forbidden'],
  SEPARATION_OF_DUTY_EXCEPTION_REQUIRED: [409, 'CURRICULUM_SEPARATION_OF_DUTY_REQUIRED', 'An audited separation-of-duty exception is required'],
  SOLE_PERMISSION_GRANT_REVOKE_FORBIDDEN: [409, 'CURRICULUM_PERMISSION_LOCKOUT', 'The sole permission-management authority cannot revoke itself'],
  SOURCE_RECORD_MISMATCH: [409, 'CURRICULUM_SOURCE_CONFLICT', 'Stable source record conflicts with existing provenance'],
  STALE_REVISION: [409, 'CURRICULUM_STALE_REVISION', 'Curriculum draft revision is stale'],
  VALIDATION_FAILED: [409, 'CURRICULUM_VALIDATION_FAILED', 'Curriculum validation contains blockers'],
  VALIDATION_NOT_CURRENT: [409, 'CURRICULUM_VALIDATION_STALE', 'Validation does not match the current draft revision'],
  VALIDATION_NOT_FOUND: [404, 'CURRICULUM_VALIDATION_NOT_FOUND', 'Curriculum validation run not found'],
  VERSION_NOT_EDITABLE: [409, 'CURRICULUM_VERSION_IMMUTABLE', 'Curriculum version is not editable'],
  VERSION_NOT_FOUND: [404, 'CURRICULUM_VERSION_NOT_FOUND', 'Curriculum version not found'],
  VERSION_NOT_IN_REVIEW: [409, 'CURRICULUM_REVIEW_STATE_INVALID', 'Curriculum version is not in review'],
}

const unwrap = <T>(result: StoreCommandResult<T>): T => {
  if (result.ok) return result.value
  const [status, code, message] = reasonErrors[result.reason] ?? [409, 'CURRICULUM_CONFLICT', 'Curriculum operation could not be completed']
  const details = {
    ...(result.currentRevision === undefined ? {} : { currentRevision: result.currentRevision }),
    ...(result.existing === undefined ? {} : { evidence: result.existing }),
  }
  throw new ApiError(status, code, message, Object.keys(details).length ? details : undefined)
}

const requireActive = (actor: CurriculumActor): void => {
  if (actor.status !== 'ACTIVE') {
    throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Account is inactive')
  }
}

const requireConsumer = (actor: CurriculumActor): void => {
  requireActive(actor)
  if (!['STUDENT', 'COUNSELOR', 'ADMIN'].includes(actor.role)) {
    throw new ApiError(403, 'ROLE_FORBIDDEN', 'Curriculum read access is unavailable')
  }
}

const normalizeSearch = (value: string): string => value.normalize('NFKC').trim().toLocaleLowerCase('fa-IR')

const toPublishedVersionView = (version: CurriculumVersionRecord) => ({
  effectiveFrom: version.effectiveFrom,
  id: version.id,
  publishedAt: version.publishedAt,
  sourceSummary: version.sourceSummary,
  status: version.status,
  supersededAt: version.supersededAt,
  versionLabel: version.versionLabel,
})

const toPublishedNodeView = (node: CurriculumNodeRecord) => ({
  availabilityStatus: node.availabilityStatus,
  curriculumNodeId: node.curriculumNodeId,
  curriculumVersionId: node.curriculumVersionId,
  deprecationReason: node.deprecationReason,
  displayName: node.displayName,
  nodeTypeCode: node.nodeTypeCode,
  parentNodeId: node.parentNodeId,
  siblingPosition: node.siblingPosition,
})

export type CurriculumServices = ReturnType<typeof createCurriculumServices>

export const createCurriculumServices = (
  store: CurriculumStore,
  now = () => new Date(),
) => {
  const requireCapability = async (actor: CurriculumActor, capability: CurriculumCapability): Promise<void> => {
    requireActive(actor)
    if (actor.role !== 'ADMIN') {
      throw new ApiError(403, 'ROLE_FORBIDDEN', 'Administrator access is required')
    }
    if (!await store.hasCapability(actor.id, capability, now())) {
      throw new ApiError(403, 'CURRICULUM_CAPABILITY_FORBIDDEN', 'Curriculum capability is required')
    }
  }

  const requireAnyCapability = async (actor: CurriculumActor, capabilities: CurriculumCapability[]): Promise<void> => {
    requireActive(actor)
    if (actor.role !== 'ADMIN') throw new ApiError(403, 'ROLE_FORBIDDEN', 'Administrator access is required')
    for (const capability of capabilities) {
      if (await store.hasCapability(actor.id, capability, now())) return
    }
    throw new ApiError(403, 'CURRICULUM_CAPABILITY_FORBIDDEN', 'Curriculum capability is required')
  }

  const publishedVersion = async (actor: CurriculumActor, versionId?: string) => {
    requireConsumer(actor)
    const version = versionId
      ? await store.findPublishedVersion(versionId)
      : await store.findCurrentPublishedVersion()
    if (!version) {
      throw new ApiError(404, 'CURRICULUM_VERSION_NOT_FOUND', 'Published curriculum version not found')
    }
    return version
  }

  return {
    async currentPublished(actor: CurriculumActor) {
      return toPublishedVersionView(await publishedVersion(actor))
    },
    async publishedVersion(actor: CurriculumActor, versionId: string) {
      return toPublishedVersionView(await publishedVersion(actor, versionId))
    },
    async publishedRoots(actor: CurriculumActor, versionId: string) {
      await publishedVersion(actor, versionId)
      return (await store.listRoots(versionId, true)).map(toPublishedNodeView)
    },
    async publishedNode(actor: CurriculumActor, versionId: string, nodeId: string) {
      await publishedVersion(actor, versionId)
      const node = await store.findNode(versionId, nodeId, true)
      if (!node) throw new ApiError(404, 'CURRICULUM_NODE_NOT_FOUND', 'Curriculum node not found')
      return toPublishedNodeView(node)
    },
    async publishedChildren(actor: CurriculumActor, versionId: string, nodeId: string, query?: PageQuery) {
      await publishedVersion(actor, versionId)
      if (!await store.findNode(versionId, nodeId, true)) throw new ApiError(404, 'CURRICULUM_NODE_NOT_FOUND', 'Curriculum node not found')
      const page = await store.listChildren(versionId, nodeId, true, query)
      return { ...page, items: page.items.map(toPublishedNodeView) }
    },
    async publishedPath(actor: CurriculumActor, versionId: string, nodeId: string) {
      await publishedVersion(actor, versionId)
      const path = await store.getPath(versionId, nodeId, true)
      if (!path) throw new ApiError(404, 'CURRICULUM_NODE_NOT_FOUND', 'Curriculum node not found')
      return path.map(toPublishedNodeView)
    },
    async publishedSearch(actor: CurriculumActor, versionId: string, search: string, query?: PageQuery) {
      await publishedVersion(actor, versionId)
      const page = await store.searchNodes(versionId, normalizeSearch(search), true, query)
      const paths = await store.getPaths(versionId, page.items.map((node) => node.curriculumNodeId), true)
      return {
        ...page,
        items: page.items.map((node) => ({
          ...toPublishedNodeView(node),
          ancestry: (paths.get(node.curriculumNodeId) ?? [])
            .slice(0, -1)
            .map(toPublishedNodeView),
        })),
      }
    },

    async listNodeTypes(actor: CurriculumActor) {
      await requireAnyCapability(actor, [
        'CURRICULUM_DRAFT_READ', 'CURRICULUM_DRAFT_EDIT', 'CURRICULUM_IMPORT_OPERATE',
        'CURRICULUM_SOURCE_READ', 'CURRICULUM_ISSUE_RESOLVE', 'CURRICULUM_REVIEW_DECIDE',
        'CURRICULUM_PUBLISH', 'CURRICULUM_MAPPING_APPROVE', 'CURRICULUM_AUDIT_READ',
        'CURRICULUM_PERMISSION_MANAGE',
      ])
      return store.listNodeTypes()
    },
    async listVersions(actor: CurriculumActor, query?: PageQuery & { status?: CurriculumVersionRecord['status'] }) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_READ')
      return store.listVersions(query)
    },
    async createVersion(actor: CurriculumActor, input: CreateVersionInput, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_EDIT')
      return unwrap(await store.createVersion(actor, input, context))
    },
    async getVersion(actor: CurriculumActor, versionId: string) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_READ')
      const version = await store.findVersion(versionId)
      if (!version) throw new ApiError(404, 'CURRICULUM_VERSION_NOT_FOUND', 'Curriculum version not found')
      return version
    },
    async updateVersion(actor: CurriculumActor, versionId: string, input: UpdateVersionInput, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_EDIT')
      return unwrap(await store.updateVersion(actor, versionId, input, context))
    },
    async adminRoots(actor: CurriculumActor, versionId: string) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_READ')
      return store.listRoots(versionId, false)
    },
    async adminNode(actor: CurriculumActor, versionId: string, nodeId: string) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_READ')
      const node = await store.findNode(versionId, nodeId, false)
      if (!node) throw new ApiError(404, 'CURRICULUM_NODE_NOT_FOUND', 'Curriculum node not found')
      return node
    },
    async createNode(actor: CurriculumActor, versionId: string, input: CreateNodeInput, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_EDIT')
      return unwrap(await store.createNode(actor, versionId, { ...input, searchName: normalizeSearch(input.searchName) }, context))
    },
    async updateNode(actor: CurriculumActor, versionId: string, nodeId: string, input: UpdateNodeInput, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_EDIT')
      return unwrap(await store.updateNode(actor, versionId, nodeId, {
        ...input,
        searchName: input.searchName === undefined ? undefined : normalizeSearch(input.searchName),
      }, context))
    },
    async deleteNode(actor: CurriculumActor, versionId: string, nodeId: string, input: { expectedRevision: number; reason: string }, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_EDIT')
      return unwrap(await store.deleteNode(actor, versionId, nodeId, input.expectedRevision, input.reason, context))
    },

    async listRelationships(actor: CurriculumActor, versionId: string, query?: PageQuery) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_READ')
      return store.listRelationships(versionId, query)
    },
    async createRelationship(actor: CurriculumActor, versionId: string, input: RelationshipInput, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_EDIT')
      return unwrap(await store.createRelationship(actor, versionId, input, context))
    },
    async updateRelationship(actor: CurriculumActor, versionId: string, relationshipId: string, input: { expectedRevision: number; rationale?: string; type?: RelationshipInput['type']; reason: string }, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_EDIT')
      return unwrap(await store.updateRelationship(actor, versionId, relationshipId, input, context))
    },
    async deleteRelationship(actor: CurriculumActor, versionId: string, relationshipId: string, input: { expectedRevision: number; reason: string }, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_EDIT')
      return unwrap(await store.deleteRelationship(actor, versionId, relationshipId, input.expectedRevision, input.reason, context))
    },

    async executeImport(actor: CurriculumActor, versionId: string, manifest: CurriculumImportManifest, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_IMPORT_OPERATE')
      return unwrap(await store.executeImport(actor, versionId, manifest, context))
    },
    async listImports(actor: CurriculumActor, versionId: string, query?: PageQuery) {
      await requireCapability(actor, 'CURRICULUM_IMPORT_OPERATE')
      return store.listImports(versionId, query)
    },
    async getImport(actor: CurriculumActor, importId: string) {
      await requireCapability(actor, 'CURRICULUM_IMPORT_OPERATE')
      const record = await store.findImport(importId)
      if (!record) throw new ApiError(404, 'CURRICULUM_IMPORT_NOT_FOUND', 'Curriculum import not found')
      return record
    },
    async listSourceRecords(actor: CurriculumActor, importId: string, query?: PageQuery) {
      await requireCapability(actor, 'CURRICULUM_SOURCE_READ')
      return store.listSourceRecords(importId, query)
    },
    async listImportIssues(actor: CurriculumActor, importId: string, query?: PageQuery & { disposition?: string; blocking?: boolean }) {
      await requireAnyCapability(actor, ['CURRICULUM_ISSUE_RESOLVE', 'CURRICULUM_REVIEW_DECIDE'])
      return store.listImportIssues(importId, query)
    },
    async resolveImportIssue(actor: CurriculumActor, importId: string, issueId: string, input: { disposition: Exclude<CurriculumImportIssueRecord['disposition'], 'OPEN'>; resolution: unknown; reason: string }, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_ISSUE_RESOLVE')
      return unwrap(await store.resolveImportIssue(actor, importId, issueId, input, context))
    },

    async validateVersion(actor: CurriculumActor, versionId: string, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_READ')
      return unwrap(await store.validateVersion(actor, versionId, context))
    },
    async listValidations(actor: CurriculumActor, versionId: string, query?: PageQuery) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_READ')
      return store.listValidations(versionId, query)
    },
    async getValidation(actor: CurriculumActor, validationId: string) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_READ')
      const validation = await store.findValidation(validationId)
      if (!validation) throw new ApiError(404, 'CURRICULUM_VALIDATION_NOT_FOUND', 'Curriculum validation run not found')
      return validation
    },
    async submitReview(actor: CurriculumActor, versionId: string, input: { expectedRevision: number; validationId: string; reason: string }, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_DRAFT_EDIT')
      return unwrap(await store.submitReview(actor, versionId, input.expectedRevision, input.validationId, input.reason, context))
    },
    async recordReviewDecision(actor: CurriculumActor, versionId: string, input: { expectedRevision: number; validationId: string; decision: CurriculumReviewOutcome; findings: string }, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_REVIEW_DECIDE')
      return unwrap(await store.recordReviewDecision(actor, versionId, input, context))
    },
    async listReviewDecisions(actor: CurriculumActor, versionId: string, query?: PageQuery) {
      await requireAnyCapability(actor, ['CURRICULUM_DRAFT_READ', 'CURRICULUM_REVIEW_DECIDE'])
      return store.listReviewDecisions(versionId, query)
    },
    async publishVersion(actor: CurriculumActor, versionId: string, input: { expectedRevision: number; validationId: string; reviewDecisionId: string; idempotencyKey: string; reason: string; separationOfDutyExceptionReason?: string | null }, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_PUBLISH')
      return unwrap(await store.publishVersion(actor, versionId, input, context))
    },

    async listNodeMappings(actor: CurriculumActor, query?: PageQuery & { fromVersionId?: string; toVersionId?: string }) {
      await requireAnyCapability(actor, ['CURRICULUM_MAPPING_APPROVE', 'CURRICULUM_AUDIT_READ'])
      return store.listNodeMappings(query)
    },
    async createNodeMapping(actor: CurriculumActor, input: MappingInput, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_MAPPING_APPROVE')
      return unwrap(await store.createNodeMapping(actor, input, context))
    },
    async listLegacyMappings(actor: CurriculumActor, query?: PageQuery & { legacyKind?: LegacyCurriculumKind }) {
      await requireCapability(actor, 'CURRICULUM_MAPPING_APPROVE')
      return store.listLegacyMappings(query)
    },
    async createLegacyMapping(actor: CurriculumActor, input: LegacyMappingInput, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_MAPPING_APPROVE')
      return unwrap(await store.createLegacyMapping(actor, input, context))
    },
    async listAudit(actor: CurriculumActor, query?: PageQuery & { actorUserId?: string; action?: string; versionId?: string }) {
      await requireCapability(actor, 'CURRICULUM_AUDIT_READ')
      return store.listAudit(query)
    },
    async listCapabilityGrants(actor: CurriculumActor, query?: PageQuery & { userId?: string }) {
      await requireCapability(actor, 'CURRICULUM_PERMISSION_MANAGE')
      return store.listCapabilityGrants(query)
    },
    async grantCapability(actor: CurriculumActor, input: { userId: string; capability: CurriculumCapability; expiresAt?: Date | null; reason: string }, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_PERMISSION_MANAGE')
      if (actor.id === input.userId) throw new ApiError(403, 'CURRICULUM_SELF_GRANT_FORBIDDEN', 'Curriculum self-grant is forbidden')
      if (!await store.findActiveAdmin(input.userId)) throw new ApiError(404, 'ADMIN_NOT_FOUND', 'Active administrator not found')
      return unwrap(await store.grantCapability(actor, input, context))
    },
    async revokeCapability(actor: CurriculumActor, grantId: string, reason: string, context: RequestContext) {
      await requireCapability(actor, 'CURRICULUM_PERMISSION_MANAGE')
      return unwrap(await store.revokeCapability(actor, grantId, reason, context))
    },
  }
}
