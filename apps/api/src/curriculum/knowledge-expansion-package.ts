import {
  validateContentIngestion,
  type ContentCurriculumMapping,
  type ContentIngestionValidationReport,
  type ContentItemCandidate,
  type ContentSourceType,
} from './content-ingestion.js'
import type { HumanSciencesCatalogRecord } from './data/human-sciences.js'
import {
  validateKnowledgeTaxonomy,
  type KnowledgeTaxonomyNode,
  type TaxonomyRegistryEntry,
  type TaxonomyStatus,
  type TaxonomyValidationReport,
} from './taxonomy.js'

export const KNOWLEDGE_EXPANSION_MANIFEST_SCHEMA_VERSION = '1.0.0'

export const knowledgeImportPackageStatuses = [
  'DRAFT',
  'VALIDATED',
  'REVIEWED',
  'APPROVED',
] as const
export type KnowledgeImportPackageStatus = typeof knowledgeImportPackageStatuses[number]

export const knowledgePackageReviewStatuses = [
  'PENDING',
  'IN_REVIEW',
  'CHANGES_REQUESTED',
  'ACCEPTED',
] as const
export type KnowledgePackageReviewStatus = typeof knowledgePackageReviewStatuses[number]

export type KnowledgePackageReview = Readonly<{
  reviewer: string | null
  reviewedAt: string | null
  reviewStatus: KnowledgePackageReviewStatus
}>

export type DraftKnowledgeImportPackage = Readonly<{
  packageId: string
  subject: string
  structuralScope: string
  curriculumVersionId: string
  sourceType: ContentSourceType
  status: KnowledgeImportPackageStatus
  review: KnowledgePackageReview
}>

export type KnowledgeExpansionStructuralAnchor = Readonly<{
  subjectId: string
  curriculumNodeId: string
  curriculumVersionId: string
}>

export type KnowledgeExpansionManifest = Readonly<{
  manifestSchemaVersion: typeof KNOWLEDGE_EXPANSION_MANIFEST_SCHEMA_VERSION
  package: DraftKnowledgeImportPackage
  structuralAnchor: KnowledgeExpansionStructuralAnchor
  taxonomyNodes: readonly KnowledgeTaxonomyNode[]
  contentItems: readonly ContentItemCandidate[]
  mappings: readonly ContentCurriculumMapping[]
}>

export type KnowledgeExpansionValidationIssue = Readonly<{
  code: string
  message: string
  domain: 'PACKAGE' | 'TAXONOMY' | 'CONTENT'
  reference?: string
}>

export type KnowledgeExpansionValidationReport = Readonly<{
  valid: boolean
  packageId: string
  packageStatus: KnowledgeImportPackageStatus
  taxonomyNodeCount: number
  contentItemCount: number
  mappingCount: number
  taxonomyReport: TaxonomyValidationReport
  contentReport: ContentIngestionValidationReport
  issues: readonly KnowledgeExpansionValidationIssue[]
}>

export type KnowledgeExpansionPackageSetReport = Readonly<{
  valid: boolean
  packageCount: number
  packageReports: readonly KnowledgeExpansionValidationReport[]
  issues: readonly KnowledgeExpansionValidationIssue[]
}>

const allowedPackageTransitions: Readonly<
  Record<KnowledgeImportPackageStatus, ReadonlySet<KnowledgeImportPackageStatus>>
> = {
  DRAFT: new Set(['DRAFT', 'VALIDATED']),
  VALIDATED: new Set(['DRAFT', 'VALIDATED', 'REVIEWED']),
  REVIEWED: new Set(['REVIEWED', 'APPROVED']),
  APPROVED: new Set(['APPROVED']),
}

export const isKnowledgePackageTransitionAllowed = (
  from: KnowledgeImportPackageStatus,
  to: KnowledgeImportPackageStatus,
): boolean => allowedPackageTransitions[from].has(to)

const addIssue = (
  issues: KnowledgeExpansionValidationIssue[],
  code: string,
  message: string,
  domain: KnowledgeExpansionValidationIssue['domain'] = 'PACKAGE',
  reference?: string,
): void => {
  issues.push({ code, message, domain, ...(reference ? { reference } : {}) })
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

const taxonomyStatusForPackage = (status: KnowledgeImportPackageStatus): TaxonomyStatus => {
  if (status === 'REVIEWED') return 'REVIEWED'
  if (status === 'APPROVED') return 'APPROVED'
  return 'DRAFT'
}

const validateReviewMetadata = (
  draftPackage: DraftKnowledgeImportPackage,
  issues: KnowledgeExpansionValidationIssue[],
): void => {
  const { review, status } = draftPackage
  if (review.reviewStatus === 'PENDING') {
    if (review.reviewer !== null || review.reviewedAt !== null) {
      addIssue(issues, 'PENDING_REVIEW_HAS_METADATA', 'A pending review cannot carry reviewer identity or a review timestamp')
    }
  } else if (review.reviewStatus === 'IN_REVIEW') {
    if (!review.reviewer?.trim()) {
      addIssue(issues, 'IN_REVIEW_REVIEWER_REQUIRED', 'An in-review package requires an assigned reviewer')
    }
    if (review.reviewedAt !== null) {
      addIssue(issues, 'IN_REVIEW_TIMESTAMP_FORBIDDEN', 'An in-review package cannot have a completion timestamp')
    }
  } else if (!review.reviewer?.trim() || !review.reviewedAt || !isValidTimestamp(review.reviewedAt)) {
    addIssue(
      issues,
      'COMPLETED_REVIEW_METADATA_REQUIRED',
      'A completed review requires reviewer identity and a valid review timestamp',
    )
  }

  if ((status === 'REVIEWED' || status === 'APPROVED') && review.reviewStatus !== 'ACCEPTED') {
    addIssue(issues, 'ACCEPTED_REVIEW_REQUIRED', `${status} package status requires an accepted review`)
  }
  if (status === 'DRAFT' && review.reviewStatus === 'ACCEPTED') {
    addIssue(issues, 'DRAFT_CANNOT_HAVE_ACCEPTED_REVIEW', 'An accepted package must advance beyond DRAFT explicitly')
  }
}

export const validateKnowledgeExpansionManifest = (input: {
  structuralRecords: readonly HumanSciencesCatalogRecord[]
  manifest: KnowledgeExpansionManifest
}): KnowledgeExpansionValidationReport => {
  const { manifest } = input
  const issues: KnowledgeExpansionValidationIssue[] = []
  const structuralByRef = new Map(input.structuralRecords.map((record) => [record.ref, record]))
  const draftPackage = manifest.package
  const anchor = manifest.structuralAnchor

  if (manifest.manifestSchemaVersion !== KNOWLEDGE_EXPANSION_MANIFEST_SCHEMA_VERSION) {
    addIssue(issues, 'MANIFEST_SCHEMA_VERSION_UNSUPPORTED', 'Knowledge expansion manifest schema version is unsupported')
  }
  if (!draftPackage.packageId.trim()) {
    addIssue(issues, 'PACKAGE_ID_REQUIRED', 'Knowledge import package requires a stable packageId')
  }
  if (!draftPackage.curriculumVersionId.trim()) {
    addIssue(issues, 'CURRICULUM_VERSION_REQUIRED', 'Knowledge import package must pin a Curriculum Version')
  }

  const subject = structuralByRef.get(draftPackage.subject)
  if (!subject || subject.proposedNodeTypeCode !== 'SUBJECT') {
    addIssue(issues, 'PACKAGE_SUBJECT_NOT_FOUND', 'Package subject must reference an existing structural SUBJECT', 'PACKAGE', draftPackage.subject)
  }
  const scope = structuralByRef.get(draftPackage.structuralScope)
  if (!scope) {
    addIssue(issues, 'STRUCTURAL_SCOPE_NOT_FOUND', 'Package structuralScope must reference an existing structural node', 'PACKAGE', draftPackage.structuralScope)
  } else if (owningSubjectRef(scope.ref, structuralByRef) !== draftPackage.subject) {
    addIssue(issues, 'STRUCTURAL_SCOPE_OWNERSHIP_CONFLICT', 'Package structuralScope belongs to a different subject', 'PACKAGE', scope.ref)
  }

  if (
    anchor.subjectId !== draftPackage.subject
    || anchor.curriculumNodeId !== draftPackage.structuralScope
    || anchor.curriculumVersionId !== draftPackage.curriculumVersionId
  ) {
    addIssue(issues, 'PACKAGE_ANCHOR_MISMATCH', 'Manifest structural anchor must exactly match the package subject, scope, and Curriculum Version')
  }

  if (manifest.taxonomyNodes.length === 0) {
    addIssue(issues, 'TAXONOMY_NODES_REQUIRED', 'Knowledge expansion package requires taxonomy nodes')
  }
  if (manifest.contentItems.length === 0) {
    addIssue(issues, 'CONTENT_ITEMS_REQUIRED', 'Knowledge expansion package requires content items')
  }
  if (manifest.mappings.length === 0) {
    addIssue(issues, 'CONTENT_MAPPINGS_REQUIRED', 'Knowledge expansion package requires content mappings')
  }

  for (const node of manifest.taxonomyNodes) {
    if (
      node.subjectId !== anchor.subjectId
      || node.curriculumNodeId !== anchor.curriculumNodeId
      || node.curriculumVersionId !== anchor.curriculumVersionId
    ) {
      addIssue(
        issues,
        'TAXONOMY_OUTSIDE_PACKAGE_SCOPE',
        'Taxonomy node must use the package structural anchor and Curriculum Version',
        'PACKAGE',
        node.taxonomyKey,
      )
    }
  }

  for (const item of manifest.contentItems) {
    if (item.provenance && item.provenance.sourceType !== draftPackage.sourceType) {
      addIssue(
        issues,
        'PACKAGE_SOURCE_TYPE_MISMATCH',
        'Content provenance sourceType must match its import package',
        'PACKAGE',
        item.contentKey,
      )
    }
  }

  for (const mapping of manifest.mappings) {
    if (
      mapping.curriculumNodeId !== anchor.curriculumNodeId
      || mapping.curriculumVersionId !== anchor.curriculumVersionId
    ) {
      addIssue(
        issues,
        'MAPPING_OUTSIDE_PACKAGE_SCOPE',
        'Content mapping must use the package structural anchor and Curriculum Version',
        'PACKAGE',
        mapping.mappingKey,
      )
    }
  }

  validateReviewMetadata(draftPackage, issues)

  const registry: TaxonomyRegistryEntry = {
    subjectId: draftPackage.subject,
    curriculumVersionId: draftPackage.curriculumVersionId,
    curriculumNodeId: draftPackage.subject,
    taxonomyStatus: taxonomyStatusForPackage(draftPackage.status),
  }
  const taxonomyReport = validateKnowledgeTaxonomy({
    structuralRecords: input.structuralRecords,
    registry: [registry],
    taxonomyNodes: manifest.taxonomyNodes,
  })
  for (const nested of taxonomyReport.issues) {
    addIssue(issues, nested.code, nested.message, 'TAXONOMY', nested.taxonomyKey ?? nested.subjectId)
  }

  const contentReport = validateContentIngestion({
    structuralRecords: input.structuralRecords,
    taxonomyNodes: manifest.taxonomyNodes,
    contentItems: manifest.contentItems,
    mappings: manifest.mappings,
  })
  for (const nested of contentReport.issues) {
    addIssue(issues, nested.code, nested.message, 'CONTENT', nested.mappingKey ?? nested.contentKey)
  }

  return {
    valid: issues.length === 0,
    packageId: draftPackage.packageId,
    packageStatus: draftPackage.status,
    taxonomyNodeCount: manifest.taxonomyNodes.length,
    contentItemCount: manifest.contentItems.length,
    mappingCount: manifest.mappings.length,
    taxonomyReport,
    contentReport,
    issues,
  }
}

export const validateKnowledgeExpansionPackageSet = (input: {
  structuralRecords: readonly HumanSciencesCatalogRecord[]
  manifests: readonly KnowledgeExpansionManifest[]
}): KnowledgeExpansionPackageSetReport => {
  const issues: KnowledgeExpansionValidationIssue[] = []
  const packageReports = input.manifests.map((manifest) =>
    validateKnowledgeExpansionManifest({ structuralRecords: input.structuralRecords, manifest }))
  for (const report of packageReports) issues.push(...report.issues)

  const packageIds = new Set<string>()
  const taxonomyKeys = new Set<string>()
  const contentKeys = new Set<string>()
  const mappingKeys = new Set<string>()
  for (const manifest of input.manifests) {
    if (packageIds.has(manifest.package.packageId)) {
      addIssue(issues, 'DUPLICATE_PACKAGE_ID', 'Package IDs must be unique across an import set', 'PACKAGE', manifest.package.packageId)
    }
    packageIds.add(manifest.package.packageId)

    for (const node of manifest.taxonomyNodes) {
      if (taxonomyKeys.has(node.taxonomyKey)) {
        addIssue(issues, 'CROSS_PACKAGE_TAXONOMY_KEY_COLLISION', 'Taxonomy keys must be unique across import packages', 'PACKAGE', node.taxonomyKey)
      }
      taxonomyKeys.add(node.taxonomyKey)
    }
    for (const item of manifest.contentItems) {
      if (contentKeys.has(item.contentKey)) {
        addIssue(issues, 'CROSS_PACKAGE_CONTENT_KEY_COLLISION', 'Content keys must be unique across import packages', 'PACKAGE', item.contentKey)
      }
      contentKeys.add(item.contentKey)
    }
    for (const mapping of manifest.mappings) {
      if (mappingKeys.has(mapping.mappingKey)) {
        addIssue(issues, 'CROSS_PACKAGE_MAPPING_KEY_COLLISION', 'Mapping keys must be unique across import packages', 'PACKAGE', mapping.mappingKey)
      }
      mappingKeys.add(mapping.mappingKey)
    }
  }

  return {
    valid: issues.length === 0,
    packageCount: input.manifests.length,
    packageReports,
    issues,
  }
}
