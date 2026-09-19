import type { HumanSciencesCatalogRecord } from './data/human-sciences.js'
import type { KnowledgeTaxonomyNode } from './taxonomy.js'

export const contentSourceTypes = [
  'TEXTBOOK',
  'OFFICIAL_GUIDE',
  'TEACHER_CONTENT',
  'QUESTION_BANK',
  'MANUAL_ENTRY',
] as const
export type ContentSourceType = typeof contentSourceTypes[number]

export const contentVerificationStatuses = ['UNVERIFIED', 'REVIEWED', 'APPROVED'] as const
export type ContentVerificationStatus = typeof contentVerificationStatuses[number]

export const educationalContentKinds = [
  'EXPLANATION',
  'EXAMPLE',
  'EXERCISE',
  'NOTE',
  'DEFINITION',
] as const
export type EducationalContentKind = typeof educationalContentKinds[number]

export type ContentProvenance = Readonly<{
  sourceType: ContentSourceType
  sourceReference: string
  createdBy: string
  createdAt: string
  verificationStatus: ContentVerificationStatus
  reviewedBy: string | null
  reviewedAt: string | null
}>

export type EducationalContentItem = Readonly<{
  contentKey: string
  kind: EducationalContentKind
  title: string | null
  body: string
  provenance: ContentProvenance
}>

export type ContentCurriculumMapping = Readonly<{
  mappingKey: string
  contentKey: string
  curriculumVersionId: string
  curriculumNodeId: string
  taxonomyKey: string
}>

export type ContentIngestionValidationIssue = Readonly<{
  code: string
  message: string
  contentKey?: string
  mappingKey?: string
}>

export type ContentIngestionValidationReport = Readonly<{
  valid: boolean
  contentItemCount: number
  mappingCount: number
  sourceTypeCounts: Readonly<Record<ContentSourceType, number>>
  verificationStatusCounts: Readonly<Record<ContentVerificationStatus, number>>
  contentKindCounts: Readonly<Record<EducationalContentKind, number>>
  issues: readonly ContentIngestionValidationIssue[]
}>

export type ContentItemCandidate = Omit<EducationalContentItem, 'provenance'> & {
  provenance?: ContentProvenance | null
}

const allowedVerificationTransitions: Readonly<Record<ContentVerificationStatus, ReadonlySet<ContentVerificationStatus>>> = {
  UNVERIFIED: new Set(['UNVERIFIED', 'REVIEWED']),
  REVIEWED: new Set(['REVIEWED', 'APPROVED']),
  APPROVED: new Set(['APPROVED']),
}

export const isContentVerificationTransitionAllowed = (
  from: ContentVerificationStatus,
  to: ContentVerificationStatus,
): boolean => allowedVerificationTransitions[from].has(to)

const addIssue = (
  issues: ContentIngestionValidationIssue[],
  code: string,
  message: string,
  reference?: { contentKey?: string; mappingKey?: string },
): void => {
  issues.push({ code, message, ...reference })
}

const isValidTimestamp = (value: string): boolean =>
  Boolean(value.trim()) && Number.isFinite(Date.parse(value))

const owningSubjectRef = (
  structuralNodeId: string,
  byRef: ReadonlyMap<string, HumanSciencesCatalogRecord>,
): string | null => {
  const seen = new Set<string>()
  let cursor = byRef.get(structuralNodeId)
  while (cursor) {
    if (seen.has(cursor.ref)) return null
    seen.add(cursor.ref)
    if (cursor.proposedNodeTypeCode === 'SUBJECT') return cursor.ref
    cursor = cursor.parentRef ? byRef.get(cursor.parentRef) : undefined
  }
  return null
}

export const validateContentIngestion = (input: {
  structuralRecords: readonly HumanSciencesCatalogRecord[]
  taxonomyNodes: readonly KnowledgeTaxonomyNode[]
  contentItems: readonly ContentItemCandidate[]
  mappings: readonly ContentCurriculumMapping[]
}): ContentIngestionValidationReport => {
  const issues: ContentIngestionValidationIssue[] = []
  const structuralByRef = new Map(input.structuralRecords.map((record) => [record.ref, record]))
  const taxonomyByKey = new Map<string, KnowledgeTaxonomyNode>()
  for (const node of input.taxonomyNodes) {
    if (!taxonomyByKey.has(node.taxonomyKey)) taxonomyByKey.set(node.taxonomyKey, node)
  }

  const contentByKey = new Map<string, ContentItemCandidate>()
  for (const item of input.contentItems) {
    const reference = { contentKey: item.contentKey }
    if (!item.contentKey.trim() || contentByKey.has(item.contentKey)) {
      addIssue(issues, 'DUPLICATE_CONTENT_KEY', `Content key must be non-empty and unique: ${item.contentKey}`, reference)
    } else {
      contentByKey.set(item.contentKey, item)
    }
    if (!item.body.trim()) addIssue(issues, 'EMPTY_CONTENT_BODY', 'Content item body must not be empty', reference)
    const provenance = item.provenance
    if (!provenance) {
      addIssue(issues, 'CONTENT_PROVENANCE_REQUIRED', 'Every content item requires provenance', reference)
      continue
    }
    if (!provenance.sourceReference.trim() || !provenance.createdBy.trim() || !isValidTimestamp(provenance.createdAt)) {
      addIssue(issues, 'INVALID_CONTENT_PROVENANCE', 'Provenance requires source reference, creator, and valid creation timestamp', reference)
    }
    if (provenance.verificationStatus === 'UNVERIFIED') {
      if (provenance.reviewedBy !== null || provenance.reviewedAt !== null) {
        addIssue(issues, 'UNVERIFIED_CONTENT_HAS_REVIEW', 'UNVERIFIED content cannot carry reviewer metadata', reference)
      }
    } else if (!provenance.reviewedBy?.trim() || !provenance.reviewedAt || !isValidTimestamp(provenance.reviewedAt)) {
      const code = provenance.verificationStatus === 'APPROVED'
        ? 'APPROVED_CONTENT_REVIEWER_REQUIRED'
        : 'REVIEWED_CONTENT_REVIEWER_REQUIRED'
      addIssue(issues, code, `${provenance.verificationStatus} content requires reviewer identity and timestamp`, reference)
    }
  }

  const mappingKeys = new Set<string>()
  const contentMappingKeys = new Set<string>()
  for (const mapping of input.mappings) {
    const reference = { contentKey: mapping.contentKey, mappingKey: mapping.mappingKey }
    if (!mapping.mappingKey.trim() || mappingKeys.has(mapping.mappingKey)) {
      addIssue(issues, 'DUPLICATE_CONTENT_MAPPING_KEY', `Mapping key must be non-empty and unique: ${mapping.mappingKey}`, reference)
    }
    mappingKeys.add(mapping.mappingKey)
    const contentMappingKey = `${mapping.contentKey}:${mapping.curriculumVersionId}:${mapping.curriculumNodeId}:${mapping.taxonomyKey}`
    if (contentMappingKeys.has(contentMappingKey)) {
      addIssue(issues, 'DUPLICATE_CONTENT_MAPPING', 'Duplicate content-to-curriculum/taxonomy mapping', reference)
    }
    contentMappingKeys.add(contentMappingKey)
    if (!contentByKey.has(mapping.contentKey)) {
      addIssue(issues, 'MAPPED_CONTENT_NOT_FOUND', 'Mapping references a nonexistent content item', reference)
    }
    const structuralNode = structuralByRef.get(mapping.curriculumNodeId)
    if (!structuralNode) {
      addIssue(issues, 'MAPPED_CURRICULUM_NODE_NOT_FOUND', 'Mapping references a nonexistent structural curriculum node', reference)
    }
    const taxonomyNode = taxonomyByKey.get(mapping.taxonomyKey)
    if (!taxonomyNode) {
      addIssue(issues, 'MAPPED_TAXONOMY_NODE_NOT_FOUND', 'Mapping references a nonexistent taxonomy node', reference)
      continue
    }
    if (taxonomyNode.curriculumVersionId !== mapping.curriculumVersionId) {
      addIssue(issues, 'CONTENT_MAPPING_VERSION_MISMATCH', 'Mapping and taxonomy node must pin the same Curriculum Version', reference)
    }
    if (structuralNode) {
      const structuralSubject = owningSubjectRef(structuralNode.ref, structuralByRef)
      if (!structuralSubject || structuralSubject !== taxonomyNode.subjectId) {
        addIssue(issues, 'CONTENT_MAPPING_SUBJECT_CONFLICT', 'Structural and taxonomy targets belong to different subjects', reference)
      }
    }
  }

  const sourceTypeCounts: Record<ContentSourceType, number> = {
    TEXTBOOK: 0,
    OFFICIAL_GUIDE: 0,
    TEACHER_CONTENT: 0,
    QUESTION_BANK: 0,
    MANUAL_ENTRY: 0,
  }
  const verificationStatusCounts: Record<ContentVerificationStatus, number> = {
    UNVERIFIED: 0,
    REVIEWED: 0,
    APPROVED: 0,
  }
  const contentKindCounts: Record<EducationalContentKind, number> = {
    EXPLANATION: 0,
    EXAMPLE: 0,
    EXERCISE: 0,
    NOTE: 0,
    DEFINITION: 0,
  }
  for (const item of input.contentItems) {
    contentKindCounts[item.kind] += 1
    if (item.provenance) {
      sourceTypeCounts[item.provenance.sourceType] += 1
      verificationStatusCounts[item.provenance.verificationStatus] += 1
    }
  }

  return {
    valid: issues.length === 0,
    contentItemCount: input.contentItems.length,
    mappingCount: input.mappings.length,
    sourceTypeCounts,
    verificationStatusCounts,
    contentKindCounts,
    issues,
  }
}
