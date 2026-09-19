import type {
  CreateNodeInput,
  CreateVersionInput,
  CurriculumActor,
  CurriculumAuditRecord,
  CurriculumCapability,
  CurriculumCapabilityGrantRecord,
  CurriculumImportIssueRecord,
  CurriculumImportManifest,
  CurriculumImportRecord,
  CurriculumNodeRecord,
  CurriculumNodeTypeRecord,
  CurriculumRelationshipRecord,
  CurriculumReviewOutcome,
  CurriculumReviewRecord,
  CurriculumSourceRecord,
  CurriculumValidationRecord,
  CurriculumVersionRecord,
  LegacyCurriculumDecision,
  LegacyCurriculumKind,
  Page,
  PageQuery,
  RequestContext,
  UpdateNodeInput,
  UpdateVersionInput,
  ValidationResult,
} from './types.js'

export type StoreCommandResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string; currentRevision?: number; existing?: unknown }

export type RelationshipInput = {
  expectedRevision: number
  sourceVersionId: string
  sourceNodeId: string
  targetVersionId: string
  targetNodeId: string
  type: CurriculumRelationshipRecord['type']
  rationale: string
  reason: string
}

export type MappingInput = {
  fromVersionId: string
  fromNodeId: string
  toVersionId: string
  toNodeId: string
  mappingType: 'SAME_IDENTITY' | 'REPLACED_BY' | 'SPLIT_INTO' | 'MERGED_INTO' | 'EQUIVALENT_TO'
  confidence?: number | null
  rationale: string
  supersedesMappingId?: string | null
}

export type LegacyMappingInput = {
  legacyKind: LegacyCurriculumKind
  legacyId: string
  curriculumVersionId?: string | null
  curriculumNodeId?: string | null
  decision: LegacyCurriculumDecision
  rationale: string
  supersedesMappingId?: string | null
}

export interface CurriculumStore {
  hasCapability(userId: string, capability: CurriculumCapability, at: Date): Promise<boolean>
  findActiveAdmin(userId: string): Promise<{ id: string } | null>
  listCapabilityGrants(query?: PageQuery & { userId?: string }): Promise<Page<CurriculumCapabilityGrantRecord>>
  grantCapability(actor: CurriculumActor, input: { userId: string; capability: CurriculumCapability; expiresAt?: Date | null; reason: string }, context: RequestContext): Promise<StoreCommandResult<CurriculumCapabilityGrantRecord>>
  revokeCapability(actor: CurriculumActor, grantId: string, reason: string, context: RequestContext): Promise<StoreCommandResult<CurriculumCapabilityGrantRecord>>
  bootstrapPermissionAdministrator(operatorAdminUserId: string, adminUserId: string, reason: string): Promise<StoreCommandResult<CurriculumCapabilityGrantRecord>>

  findCurrentPublishedVersion(): Promise<CurriculumVersionRecord | null>
  findPublishedVersion(id: string): Promise<CurriculumVersionRecord | null>
  findVersion(id: string): Promise<CurriculumVersionRecord | null>
  listVersions(query?: PageQuery & { status?: CurriculumVersionRecord['status'] }): Promise<Page<CurriculumVersionRecord>>
  createVersion(actor: CurriculumActor, input: CreateVersionInput, context: RequestContext): Promise<StoreCommandResult<CurriculumVersionRecord>>
  updateVersion(actor: CurriculumActor, versionId: string, input: UpdateVersionInput, context: RequestContext): Promise<StoreCommandResult<CurriculumVersionRecord>>
  listNodeTypes(): Promise<CurriculumNodeTypeRecord[]>
  listRoots(versionId: string, publishedOnly: boolean): Promise<CurriculumNodeRecord[]>
  findNode(versionId: string, nodeId: string, publishedOnly: boolean): Promise<CurriculumNodeRecord | null>
  listChildren(versionId: string, nodeId: string, publishedOnly: boolean, query?: PageQuery): Promise<Page<CurriculumNodeRecord>>
  getPath(versionId: string, nodeId: string, publishedOnly: boolean): Promise<CurriculumNodeRecord[] | null>
  getPaths(versionId: string, nodeIds: string[], publishedOnly: boolean): Promise<Map<string, CurriculumNodeRecord[]>>
  searchNodes(versionId: string, search: string, publishedOnly: boolean, query?: PageQuery): Promise<Page<CurriculumNodeRecord>>
  createNode(actor: CurriculumActor, versionId: string, input: CreateNodeInput, context: RequestContext): Promise<StoreCommandResult<CurriculumNodeRecord>>
  updateNode(actor: CurriculumActor, versionId: string, nodeId: string, input: UpdateNodeInput, context: RequestContext): Promise<StoreCommandResult<CurriculumNodeRecord>>
  deleteNode(actor: CurriculumActor, versionId: string, nodeId: string, expectedRevision: number, reason: string, context: RequestContext): Promise<StoreCommandResult<{ id: string }>>

  listRelationships(versionId: string, query?: PageQuery): Promise<Page<CurriculumRelationshipRecord>>
  createRelationship(actor: CurriculumActor, versionId: string, input: RelationshipInput, context: RequestContext): Promise<StoreCommandResult<CurriculumRelationshipRecord>>
  updateRelationship(actor: CurriculumActor, versionId: string, relationshipId: string, input: { expectedRevision: number; rationale?: string; type?: CurriculumRelationshipRecord['type']; reason: string }, context: RequestContext): Promise<StoreCommandResult<CurriculumRelationshipRecord>>
  deleteRelationship(actor: CurriculumActor, versionId: string, relationshipId: string, expectedRevision: number, reason: string, context: RequestContext): Promise<StoreCommandResult<{ id: string }>>

  executeImport(actor: CurriculumActor, versionId: string, manifest: CurriculumImportManifest, context: RequestContext): Promise<StoreCommandResult<CurriculumImportRecord>>
  listImports(versionId: string, query?: PageQuery): Promise<Page<CurriculumImportRecord>>
  findImport(importId: string): Promise<CurriculumImportRecord | null>
  listSourceRecords(importId: string, query?: PageQuery): Promise<Page<CurriculumSourceRecord>>
  listImportIssues(importId: string, query?: PageQuery & { disposition?: string; blocking?: boolean }): Promise<Page<CurriculumImportIssueRecord>>
  resolveImportIssue(actor: CurriculumActor, importId: string, issueId: string, input: { disposition: Exclude<CurriculumImportIssueRecord['disposition'], 'OPEN'>; resolution: unknown; reason: string }, context: RequestContext): Promise<StoreCommandResult<CurriculumImportIssueRecord>>

  validateVersion(actor: CurriculumActor, versionId: string, context: RequestContext): Promise<StoreCommandResult<CurriculumValidationRecord>>
  listValidations(versionId: string, query?: PageQuery): Promise<Page<CurriculumValidationRecord>>
  findValidation(validationId: string): Promise<CurriculumValidationRecord | null>
  submitReview(actor: CurriculumActor, versionId: string, expectedRevision: number, validationId: string, reason: string, context: RequestContext): Promise<StoreCommandResult<CurriculumVersionRecord>>
  recordReviewDecision(actor: CurriculumActor, versionId: string, input: { expectedRevision: number; validationId: string; decision: CurriculumReviewOutcome; findings: string }, context: RequestContext): Promise<StoreCommandResult<CurriculumReviewRecord>>
  listReviewDecisions(versionId: string, query?: PageQuery): Promise<Page<CurriculumReviewRecord>>
  publishVersion(actor: CurriculumActor, versionId: string, input: { expectedRevision: number; validationId: string; reviewDecisionId: string; idempotencyKey: string; reason: string; separationOfDutyExceptionReason?: string | null }, context: RequestContext): Promise<StoreCommandResult<CurriculumVersionRecord>>

  listNodeMappings(query?: PageQuery & { fromVersionId?: string; toVersionId?: string }): Promise<Page<unknown>>
  createNodeMapping(actor: CurriculumActor, input: MappingInput, context: RequestContext): Promise<StoreCommandResult<unknown>>
  listLegacyMappings(query?: PageQuery & { legacyKind?: LegacyCurriculumKind }): Promise<Page<unknown>>
  createLegacyMapping(actor: CurriculumActor, input: LegacyMappingInput, context: RequestContext): Promise<StoreCommandResult<unknown>>
  listAudit(query?: PageQuery & { actorUserId?: string; action?: string; versionId?: string }): Promise<Page<CurriculumAuditRecord>>

  collectValidation(versionId: string): Promise<ValidationResult>
}
