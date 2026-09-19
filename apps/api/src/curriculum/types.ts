import type { PublicUser } from '../auth/types.js'

export const curriculumCapabilities = [
  'CURRICULUM_DRAFT_READ',
  'CURRICULUM_DRAFT_EDIT',
  'CURRICULUM_IMPORT_OPERATE',
  'CURRICULUM_SOURCE_READ',
  'CURRICULUM_ISSUE_RESOLVE',
  'CURRICULUM_REVIEW_DECIDE',
  'CURRICULUM_PUBLISH',
  'CURRICULUM_MAPPING_APPROVE',
  'CURRICULUM_AUDIT_READ',
  'CURRICULUM_PERMISSION_MANAGE',
] as const

export type CurriculumCapability = typeof curriculumCapabilities[number]
export type CurriculumActor = PublicUser
export type CurriculumVersionStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'SUPERSEDED'
export type CurriculumNodeAvailability = 'ACTIVE' | 'DEPRECATED' | 'RETIRED'
export type CurriculumRelationshipType =
  | 'PREREQUISITE'
  | 'APPLICABILITY'
  | 'EQUIVALENCE'
  | 'PREDECESSOR'
  | 'SUCCESSOR'
  | 'SPLIT'
  | 'MERGE'
  | 'REPLACEMENT'
export type CurriculumRelationshipStatus = 'PROPOSED' | 'APPROVED' | 'SUPERSEDED'
export type CurriculumImportStatus = 'CREATED' | 'VALIDATING' | 'COMPLETED' | 'FAILED'
export type CurriculumSourceDisposition =
  | 'PENDING'
  | 'ACCEPTED'
  | 'UNCHANGED'
  | 'AMBIGUOUS'
  | 'REJECTED'
  | 'EXCLUDED'
export type CurriculumIssueDisposition =
  | 'OPEN'
  | 'RESOLVED'
  | 'EXCLUDED'
  | 'MORE_EVIDENCE_REQUIRED'
export type CurriculumReviewOutcome = 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'
export type CurriculumMappingType =
  | 'SAME_IDENTITY'
  | 'REPLACED_BY'
  | 'SPLIT_INTO'
  | 'MERGED_INTO'
  | 'EQUIVALENT_TO'
export type LegacyCurriculumKind = 'STUDY_SUBJECT' | 'TOPIC'
export type LegacyCurriculumDecision = 'PROPOSED' | 'CONFIRMED' | 'AMBIGUOUS' | 'LEGACY_ONLY'

export type Page<T> = { items: T[]; nextCursor: string | null }
export type PageQuery = { cursor?: string; limit?: number }

export type CurriculumVersionRecord = {
  id: string
  versionLabel: string
  status: CurriculumVersionStatus
  basedOnVersionId: string | null
  effectiveFrom: Date | null
  sourceSummary: string | null
  revision: number
  createdById: string
  reviewedAt: Date | null
  publishedById: string | null
  publishedAt: Date | null
  supersededAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type CurriculumNodeTypeRecord = {
  id: string
  code: string
  displayName: string
  displayNameFa: string | null
  isActive: boolean
  allowedParentCodes: unknown
  metadata: unknown
  createdAt: Date
  updatedAt: Date
}

export type CurriculumNodeRecord = {
  curriculumVersionId: string
  curriculumNodeId: string
  nodeTypeId: string
  nodeTypeCode: string
  parentNodeId: string | null
  displayName: string
  sourceDisplayName: string
  searchName: string
  siblingPosition: number
  sourceOrder: number | null
  availabilityStatus: CurriculumNodeAvailability
  deprecationReason: string | null
  provenance: unknown
  createdAt: Date
  updatedAt: Date
}

export type CurriculumRelationshipRecord = {
  id: string
  curriculumVersionId: string
  sourceVersionId: string
  sourceNodeId: string
  targetVersionId: string
  targetNodeId: string
  type: CurriculumRelationshipType
  status: CurriculumRelationshipStatus
  rationale: string
  createdById: string
  approvedById: string | null
  approvedAt: Date | null
  supersededById: string | null
  createdAt: Date
  updatedAt: Date
}

export type CurriculumImportRecord = {
  id: string
  targetVersionId: string
  manifestSchemaVersion: string
  manifestChecksum: string
  sourceArtifactName: string
  sourceArtifactSha256: string
  transcriptionId: string
  transcriptionSha256: string
  idempotencyKey: string
  payloadChecksum: string
  status: CurriculumImportStatus
  acceptedCount: number
  unchangedCount: number
  ambiguousCount: number
  rejectedCount: number
  excludedCount: number
  report: unknown
  failureCode: string | null
  importedById: string
  retryOfImportId: string | null
  startedAt: Date
  completedAt: Date | null
  failedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type CurriculumSourceRecord = {
  id: string
  importId: string
  sourceRecordKey: string
  rawText: string
  displayLabel: string
  sourceLocator: string
  sourceOrder: number
  proposedNodeTypeCode: string | null
  parentSourceRecordKey: string | null
  structuralHints: unknown
  ambiguityMarkers: unknown
  checksum: string
  disposition: CurriculumSourceDisposition
  matchedCurriculumVersionId: string | null
  matchedCurriculumNodeId: string | null
  createdAt: Date
}

export type CurriculumImportIssueRecord = {
  id: string
  importId: string
  sourceRecordId: string | null
  code: string
  severity: 'INFO' | 'WARNING' | 'ERROR'
  details: unknown
  isBlocking: boolean
  disposition: CurriculumIssueDisposition
  resolution: unknown
  resolutionReason: string | null
  resolvedById: string | null
  resolvedAt: Date | null
  createdAt: Date
}

export type CurriculumValidationRecord = {
  id: string
  versionId: string
  draftRevision: number
  initiatedById: string
  status: 'RUNNING' | 'PASSED' | 'FAILED'
  blockerCount: number
  warningCount: number
  result: unknown
  startedAt: Date
  completedAt: Date | null
}

export type CurriculumReviewRecord = {
  id: string
  versionId: string
  draftRevision: number
  validationRunId: string
  reviewerId: string
  decision: CurriculumReviewOutcome
  findings: string
  decidedAt: Date
  invalidatedAt: Date | null
  invalidatedReason: string | null
}

export type CurriculumCapabilityGrantRecord = {
  id: string
  userId: string
  capability: CurriculumCapability
  scope: 'GLOBAL'
  expiresAt: Date | null
  grantedById: string
  grantReason: string
  grantedAt: Date
  revokedById: string | null
  revokeReason: string | null
  revokedAt: Date | null
}

export type CurriculumAuditRecord = {
  id: string
  actorUserId: string | null
  actorKind: string
  capability: CurriculumCapability | null
  action: string
  outcome: 'SUCCEEDED' | 'REJECTED' | 'FAILED'
  targetKind: string
  targetId: string | null
  versionId: string | null
  nodeId: string | null
  importId: string | null
  mappingId: string | null
  grantId: string | null
  reason: string | null
  beforeState: unknown
  afterState: unknown
  requestId: string | null
  occurredAt: Date
}

export type CreateVersionInput = {
  versionLabel: string
  basedOnVersionId?: string | null
  effectiveFrom?: Date | null
  sourceSummary?: string | null
  reason: string
}

export type UpdateVersionInput = {
  expectedRevision: number
  versionLabel?: string
  effectiveFrom?: Date | null
  sourceSummary?: string | null
  reason: string
}

export type CreateNodeInput = {
  expectedRevision: number
  nodeTypeCode: string
  parentNodeId?: string | null
  displayName: string
  sourceDisplayName: string
  searchName: string
  siblingPosition: number
  sourceOrder?: number | null
  availabilityStatus?: CurriculumNodeAvailability
  deprecationReason?: string | null
  provenance?: unknown
  identityNote?: string | null
  reason: string
}

export type UpdateNodeInput = {
  expectedRevision: number
  nodeTypeCode?: string
  parentNodeId?: string | null
  displayName?: string
  sourceDisplayName?: string
  searchName?: string
  siblingPosition?: number
  sourceOrder?: number | null
  availabilityStatus?: CurriculumNodeAvailability
  deprecationReason?: string | null
  provenance?: unknown
  reason: string
}

export type CurriculumManifestRecord = {
  sourceRecordKey: string
  rawText: string
  displayLabel: string
  sourceLocator: string
  sourceOrder: number
  checksum: string
  proposedNodeTypeCode?: string | null
  parentSourceRecordKey?: string | null
  structuralHints?: unknown
  ambiguityMarkers?: string[]
}

export type CurriculumManifestRecordDraft = Omit<CurriculumManifestRecord, 'checksum'>

export type CurriculumImportManifest = {
  manifestSchemaVersion: string
  manifestChecksum: string
  sourceArtifactName: string
  sourceArtifactSha256: string
  transcriptionId: string
  transcriptionSha256: string
  payloadChecksum: string
  idempotencyKey: string
  expectedRevision: number
  records: CurriculumManifestRecord[]
}

export type CurriculumImportManifestDraft = Omit<
  CurriculumImportManifest,
  'manifestChecksum' | 'payloadChecksum' | 'records' | 'sourceArtifactName' | 'sourceArtifactSha256' | 'transcriptionSha256'
> & {
  manifestSchemaVersion?: string
  records: CurriculumManifestRecordDraft[]
}

export type CurriculumManifestValidationIssue = {
  code: string
  message: string
  path: string
  severity: 'ERROR' | 'WARNING'
}

export type CurriculumManifestValidationReport = {
  valid: boolean
  schemaVersion: string | null
  manifestChecksum: string | null
  calculatedManifestChecksum: string | null
  payloadChecksum: string | null
  calculatedPayloadChecksum: string | null
  recordCount: number
  importableRecordCount: number
  ambiguousRecordCount: number
  typeCounts: Record<string, number>
  ambiguityCounts: Record<string, number>
  issues: CurriculumManifestValidationIssue[]
}

export type CurriculumAmbiguityReportRecord = {
  sourceRecordKey: string
  sourceLocator: string
  sourceOrder: number
  displayLabel: string
  markers: string[]
}

export type CurriculumAmbiguityReport = {
  manifestChecksum: string
  sourceArtifactName: string
  sourceArtifactSha256: string
  transcriptionId: string
  transcriptionSha256: string
  unresolvedRecordCount: number
  markerCounts: Record<string, number>
  records: CurriculumAmbiguityReportRecord[]
}

export type ValidationFinding = {
  code: string
  severity: 'BLOCKER' | 'WARNING'
  nodeId?: string
  issueId?: string
  message: string
}

export type ValidationResult = {
  findings: ValidationFinding[]
  nodeCount: number
  rootCount: number
}

export type RequestContext = { requestId: string }
