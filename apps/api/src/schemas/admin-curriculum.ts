import { z } from 'zod'
import { curriculumImportManifestSchema } from '../curriculum/import-manifest.js'
import { curriculumCapabilities } from '../curriculum/types.js'

const uuid = z.string().uuid()
const reason = z.string().trim().min(3).max(2000)
const expectedRevision = z.number().int().min(0)

export const adminPageSchema = z.object({
  cursor: uuid.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
}).strict()

export const adminVersionIdSchema = z.object({ versionId: uuid }).strict()
export const adminNodeParamsSchema = z.object({ versionId: uuid, nodeId: uuid }).strict()
export const adminRelationshipParamsSchema = z.object({ versionId: uuid, relationshipId: uuid }).strict()
export const adminImportIdSchema = z.object({ importId: uuid }).strict()
export const adminImportIssueParamsSchema = z.object({ importId: uuid, issueId: uuid }).strict()
export const adminValidationIdSchema = z.object({ validationId: uuid }).strict()
export const adminGrantIdSchema = z.object({ grantId: uuid }).strict()

export const listVersionsSchema = adminPageSchema.extend({
  status: z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'SUPERSEDED']).optional(),
}).strict()

export const createVersionSchema = z.object({
  basedOnVersionId: uuid.nullable().optional().default(null),
  effectiveFrom: z.string().datetime({ offset: true }).nullable().optional().default(null),
  reason,
  sourceSummary: z.string().trim().max(5000).nullable().optional().default(null),
  versionLabel: z.string().trim().min(1).max(120),
}).strict()

export const updateVersionSchema = z.object({
  effectiveFrom: z.string().datetime({ offset: true }).nullable().optional(),
  expectedRevision,
  reason,
  sourceSummary: z.string().trim().max(5000).nullable().optional(),
  versionLabel: z.string().trim().min(1).max(120).optional(),
}).strict().refine(
  (value) => value.versionLabel !== undefined || value.effectiveFrom !== undefined || value.sourceSummary !== undefined,
  'At least one mutable version field is required',
)

const availability = z.enum(['ACTIVE', 'DEPRECATED', 'RETIRED'])
const nodeFields = {
  availabilityStatus: availability.optional(),
  deprecationReason: z.string().trim().min(3).max(2000).nullable().optional(),
  displayName: z.string().min(1).max(500),
  nodeTypeCode: z.string().trim().min(1).max(80),
  parentNodeId: uuid.nullable().optional().default(null),
  provenance: z.unknown().optional(),
  searchName: z.string().min(1).max(500),
  siblingPosition: z.number().int().min(0),
  sourceDisplayName: z.string().min(1).max(500),
  sourceOrder: z.number().int().min(0).nullable().optional().default(null),
}

export const createNodeSchema = z.object({
  ...nodeFields,
  expectedRevision,
  identityNote: z.string().trim().max(2000).nullable().optional().default(null),
  reason,
}).strict().superRefine((value, context) => {
  if (value.availabilityStatus && value.availabilityStatus !== 'ACTIVE' && !value.deprecationReason) {
    context.addIssue({ code: 'custom', message: 'A deprecation reason is required', path: ['deprecationReason'] })
  }
})

export const updateNodeSchema = z.object({
  availabilityStatus: availability.optional(),
  deprecationReason: z.string().trim().min(3).max(2000).nullable().optional(),
  displayName: z.string().min(1).max(500).optional(),
  expectedRevision,
  nodeTypeCode: z.string().trim().min(1).max(80).optional(),
  parentNodeId: uuid.nullable().optional(),
  provenance: z.unknown().optional(),
  reason,
  searchName: z.string().min(1).max(500).optional(),
  siblingPosition: z.number().int().min(0).optional(),
  sourceDisplayName: z.string().min(1).max(500).optional(),
  sourceOrder: z.number().int().min(0).nullable().optional(),
}).strict().refine((value) => Object.keys(value).some((key) => !['expectedRevision', 'reason'].includes(key)), 'At least one mutable node field is required')

export const revisionReasonSchema = z.object({ expectedRevision, reason }).strict()

const relationshipType = z.enum(['PREREQUISITE', 'APPLICABILITY', 'EQUIVALENCE', 'PREDECESSOR', 'SUCCESSOR', 'SPLIT', 'MERGE', 'REPLACEMENT'])
export const createRelationshipSchema = z.object({
  expectedRevision, rationale: reason, reason,
  sourceNodeId: uuid, sourceVersionId: uuid,
  targetNodeId: uuid, targetVersionId: uuid,
  type: relationshipType,
}).strict()
export const updateRelationshipSchema = z.object({
  expectedRevision, rationale: reason.optional(), reason, type: relationshipType.optional(),
}).strict().refine((value) => value.rationale !== undefined || value.type !== undefined, 'At least one mutable relationship field is required')

export const importManifestSchema = curriculumImportManifestSchema

export const listIssuesSchema = adminPageSchema.extend({
  blocking: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  disposition: z.enum(['OPEN', 'RESOLVED', 'EXCLUDED', 'MORE_EVIDENCE_REQUIRED']).optional(),
}).strict()
export const resolveIssueSchema = z.object({
  disposition: z.enum(['RESOLVED', 'EXCLUDED', 'MORE_EVIDENCE_REQUIRED']),
  reason,
  resolution: z.unknown(),
}).strict()

export const submitReviewSchema = z.object({ expectedRevision, reason, validationId: uuid }).strict()
export const reviewDecisionSchema = z.object({
  decision: z.enum(['APPROVED', 'CHANGES_REQUESTED', 'REJECTED']),
  expectedRevision,
  findings: reason,
  validationId: uuid,
}).strict()
export const publishVersionSchema = z.object({
  expectedRevision,
  idempotencyKey: z.string().trim().min(8).max(200),
  reason,
  reviewDecisionId: uuid,
  separationOfDutyExceptionReason: reason.nullable().optional(),
  validationId: uuid,
}).strict()

export const listNodeMappingsSchema = adminPageSchema.extend({
  fromVersionId: uuid.optional(), toVersionId: uuid.optional(),
}).strict()
export const createNodeMappingSchema = z.object({
  confidence: z.number().min(0).max(1).nullable().optional(),
  fromNodeId: uuid, fromVersionId: uuid,
  mappingType: z.enum(['SAME_IDENTITY', 'REPLACED_BY', 'SPLIT_INTO', 'MERGED_INTO', 'EQUIVALENT_TO']),
  rationale: reason,
  supersedesMappingId: uuid.nullable().optional(),
  toNodeId: uuid, toVersionId: uuid,
}).strict()
export const listLegacyMappingsSchema = adminPageSchema.extend({
  legacyKind: z.enum(['STUDY_SUBJECT', 'TOPIC']).optional(),
}).strict()
export const createLegacyMappingSchema = z.object({
  curriculumNodeId: uuid.nullable().optional(),
  curriculumVersionId: uuid.nullable().optional(),
  decision: z.enum(['PROPOSED', 'CONFIRMED', 'AMBIGUOUS', 'LEGACY_ONLY']),
  legacyId: uuid,
  legacyKind: z.enum(['STUDY_SUBJECT', 'TOPIC']),
  rationale: reason,
  supersedesMappingId: uuid.nullable().optional(),
}).strict().superRefine((value, context) => {
  const hasVersion = value.curriculumVersionId != null
  const hasNode = value.curriculumNodeId != null
  if (hasVersion !== hasNode) context.addIssue({ code: 'custom', message: 'Canonical version and node must be provided together' })
  if (value.decision === 'CONFIRMED' && !hasVersion) context.addIssue({ code: 'custom', message: 'Confirmed mapping requires a canonical target' })
})

export const listAuditSchema = adminPageSchema.extend({
  action: z.string().trim().min(1).max(100).optional(),
  actorUserId: uuid.optional(),
  versionId: uuid.optional(),
}).strict()
export const listGrantsSchema = adminPageSchema.extend({ userId: uuid.optional() }).strict()
export const createGrantSchema = z.object({
  capability: z.enum(curriculumCapabilities),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  reason,
  userId: uuid,
}).strict()
export const revokeGrantSchema = z.object({ reason }).strict()
