import { createHash } from 'node:crypto'
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

export const knowledgePackageKinds = [
  'PILOT',
  'PRODUCTION_PACKAGE_CANDIDATE',
] as const
export type KnowledgePackageKind = typeof knowledgePackageKinds[number]

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
  packageKind: KnowledgePackageKind
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

export const productionKnowledgePersistenceStates = [
  'REQUIRES_CURRICULUM_VERSION_REBIND_BEFORE_PERSISTENCE',
] as const
export type ProductionKnowledgePersistenceState = typeof productionKnowledgePersistenceStates[number]

export type ProductionKnowledgePackageCandidate = Readonly<{
  manifestSchemaVersion: typeof KNOWLEDGE_EXPANSION_MANIFEST_SCHEMA_VERSION
  package: DraftKnowledgeImportPackage & Readonly<{
    packageKind: 'PRODUCTION_PACKAGE_CANDIDATE'
    packageRevisionId: string
    packageRevision: number
    supersedesRevisionId?: string
  }>
  structuralAnchor: KnowledgeExpansionStructuralAnchor
  structuralSnapshot: Readonly<{
    snapshotId: string
    catalogSha256: string
  }>
  payloadReference: Readonly<{
    kind: 'PILOT'
    sourcePackageId: string
  }> | Readonly<{
    kind: 'PACKAGE_REVISION'
    packageId: string
    packageRevisionId: string
    packageRevision: number
    packageChecksum: string
  }>
  taxonomyNodes: readonly KnowledgeTaxonomyNode[]
  contentItems: readonly ContentItemCandidate[]
  mappings: readonly ContentCurriculumMapping[]
  persistence: Readonly<{
    state: ProductionKnowledgePersistenceState
    requiresCurriculumVersionRebind: true
    databaseCurriculumVersionId: null
  }>
  payloadChecksum: string
  packageChecksum: string
}>

export type ProductionKnowledgePackageValidationReport = Readonly<{
  valid: boolean
  packageId: string
  packageRevisionId: string
  packageRevision: number
  payloadChecksum: string
  packageChecksum: string
  taxonomyNodeCount: number
  contentItemCount: number
  mappingCount: number
  draftPackageReport: KnowledgeExpansionValidationReport
  issues: readonly KnowledgeExpansionValidationIssue[]
}>

export type ProductionKnowledgePackageSetReport = Readonly<{
  valid: boolean
  packageCount: number
  packageReports: readonly ProductionKnowledgePackageValidationReport[]
  issues: readonly KnowledgeExpansionValidationIssue[]
}>

export type ProductionKnowledgeReadinessReport = Readonly<{
  packageId: string
  packageRevisionId: string
  packageRevision: number
  payloadChecksum: string
  packageChecksum: string
  counts: Readonly<{
    taxonomyNodes: number
    contentItems: number
    mappings: number
  }>
  readiness: Readonly<{
    machineStructure: 'PASS' | 'FAIL'
    educationalReview: 'PENDING' | 'CHANGES_REQUESTED' | 'ACCEPTED'
    packageLifecycle: KnowledgeImportPackageStatus
    persistence: 'BLOCKED_PENDING_CURRICULUM_VERSION_REBIND' | 'BLOCKED_VALIDATION_FAILURES'
    publication: 'NOT_AUTHORIZED'
  }>
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

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right, 'en'))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    )
  }
  return value
}

export const deterministicJsonSha256 = (value: unknown): string => createHash('sha256')
  .update(JSON.stringify(canonicalize(value)), 'utf8')
  .digest('hex')

const opaquePackageId = /^pkg-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const opaqueRevisionId = /^pkg-rev-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const sha256Pattern = /^[0-9a-f]{64}$/
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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
  if (!knowledgePackageKinds.includes(draftPackage.packageKind)) {
    addIssue(issues, 'PACKAGE_KIND_UNSUPPORTED', 'Knowledge import package kind is unsupported')
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

export const productionKnowledgePayloadChecksum = (payload: Pick<
ProductionKnowledgePackageCandidate,
'taxonomyNodes' | 'contentItems' | 'mappings'
>): string => deterministicJsonSha256({
  taxonomyNodes: payload.taxonomyNodes,
  contentItems: payload.contentItems,
  mappings: payload.mappings,
})

export const productionKnowledgePackageChecksum = (
  candidate: Omit<ProductionKnowledgePackageCandidate, 'packageChecksum'> | ProductionKnowledgePackageCandidate,
): string => {
  const { packageChecksum: _ignored, ...content } = candidate as ProductionKnowledgePackageCandidate
  return deterministicJsonSha256(content)
}

export const buildProductionKnowledgePackageCandidate = (input: {
  packageId: string
  packageRevisionId: string
  packageRevision: number
  sourcePilotManifest: KnowledgeExpansionManifest
  structuralCatalogSha256: string
}): ProductionKnowledgePackageCandidate => {
  const draft = {
    manifestSchemaVersion: KNOWLEDGE_EXPANSION_MANIFEST_SCHEMA_VERSION,
    package: {
      ...input.sourcePilotManifest.package,
      packageId: input.packageId,
      packageKind: 'PRODUCTION_PACKAGE_CANDIDATE',
      packageRevisionId: input.packageRevisionId,
      packageRevision: input.packageRevision,
    },
    structuralAnchor: input.sourcePilotManifest.structuralAnchor,
    structuralSnapshot: {
      snapshotId: input.sourcePilotManifest.package.curriculumVersionId,
      catalogSha256: input.structuralCatalogSha256,
    },
    payloadReference: {
      kind: 'PILOT',
      sourcePackageId: input.sourcePilotManifest.package.packageId,
    },
    taxonomyNodes: input.sourcePilotManifest.taxonomyNodes,
    contentItems: input.sourcePilotManifest.contentItems,
    mappings: input.sourcePilotManifest.mappings,
    persistence: {
      state: 'REQUIRES_CURRICULUM_VERSION_REBIND_BEFORE_PERSISTENCE',
      requiresCurriculumVersionRebind: true,
      databaseCurriculumVersionId: null,
    },
  } as const
  const withPayloadChecksum = {
    ...draft,
    payloadChecksum: productionKnowledgePayloadChecksum(draft),
  }
  return {
    ...withPayloadChecksum,
    packageChecksum: productionKnowledgePackageChecksum(withPayloadChecksum),
  }
}

export const buildNextProductionKnowledgePackageRevision = (input: {
  currentRevision: ProductionKnowledgePackageCandidate
  packageRevisionId: string
  taxonomyNodes: readonly KnowledgeTaxonomyNode[]
  contentItems: readonly ContentItemCandidate[]
  mappings: readonly ContentCurriculumMapping[]
}): ProductionKnowledgePackageCandidate => {
  const { currentRevision } = input
  const draft = {
    ...currentRevision,
    package: {
      ...currentRevision.package,
      packageRevisionId: input.packageRevisionId,
      packageRevision: currentRevision.package.packageRevision + 1,
      supersedesRevisionId: currentRevision.package.packageRevisionId,
      status: 'DRAFT',
      review: {
        reviewer: null,
        reviewedAt: null,
        reviewStatus: 'PENDING',
      },
    },
    payloadReference: {
      kind: 'PACKAGE_REVISION',
      packageId: currentRevision.package.packageId,
      packageRevisionId: currentRevision.package.packageRevisionId,
      packageRevision: currentRevision.package.packageRevision,
      packageChecksum: currentRevision.packageChecksum,
    },
    taxonomyNodes: input.taxonomyNodes,
    contentItems: input.contentItems,
    mappings: input.mappings,
  } as const
  const { packageChecksum: _oldPackageChecksum, payloadChecksum: _oldPayloadChecksum, ...content } = draft
  const withPayloadChecksum = {
    ...content,
    payloadChecksum: productionKnowledgePayloadChecksum(content),
  }
  return {
    ...withPayloadChecksum,
    packageChecksum: productionKnowledgePackageChecksum(withPayloadChecksum),
  }
}

export const validateProductionKnowledgePackageCandidate = (input: {
  structuralRecords: readonly HumanSciencesCatalogRecord[]
  expectedStructuralCatalogSha256: string
  sourcePilotManifest: KnowledgeExpansionManifest
  candidate: ProductionKnowledgePackageCandidate
  supersededCandidate?: ProductionKnowledgePackageCandidate
}): ProductionKnowledgePackageValidationReport => {
  const { candidate, sourcePilotManifest } = input
  const draftPackageReport = validateKnowledgeExpansionManifest({
    structuralRecords: input.structuralRecords,
    manifest: candidate,
  })
  const issues = [...draftPackageReport.issues]
  const candidatePackage = candidate.package
  const sourcePackage = sourcePilotManifest.package

  if (candidatePackage.packageKind !== 'PRODUCTION_PACKAGE_CANDIDATE') {
    addIssue(issues, 'PRODUCTION_PACKAGE_KIND_REQUIRED', 'Production candidate must declare PRODUCTION_PACKAGE_CANDIDATE')
  }
  if (!opaquePackageId.test(candidatePackage.packageId)) {
    addIssue(issues, 'OPAQUE_PACKAGE_ID_REQUIRED', 'Production package identity must use the stable opaque package key form')
  }
  if (!opaqueRevisionId.test(candidatePackage.packageRevisionId)) {
    addIssue(issues, 'OPAQUE_PACKAGE_REVISION_ID_REQUIRED', 'Package revision identity must use the stable opaque revision key form')
  }
  if (!Number.isSafeInteger(candidatePackage.packageRevision) || candidatePackage.packageRevision < 1) {
    addIssue(issues, 'PACKAGE_REVISION_INVALID', 'Package revision must be a positive integer')
  }
  if (candidate.payloadReference.kind === 'PILOT') {
    if (sourcePackage.packageKind !== 'PILOT') {
      addIssue(issues, 'PILOT_PAYLOAD_REFERENCE_REQUIRED', 'Initial production candidate must reference a PILOT package')
    }
    if (candidate.payloadReference.sourcePackageId !== sourcePackage.packageId) {
      addIssue(issues, 'SOURCE_PILOT_PACKAGE_MISMATCH', 'Production candidate must identify the exact source pilot package')
    }
    if (
      candidate.taxonomyNodes !== sourcePilotManifest.taxonomyNodes
      || candidate.contentItems !== sourcePilotManifest.contentItems
      || candidate.mappings !== sourcePilotManifest.mappings
    ) {
      addIssue(issues, 'PILOT_PAYLOAD_REFERENCE_MISMATCH', 'Initial production candidate must reuse the exact pilot payload arrays without copying or mutation')
    }
    if (
      candidatePackage.subject !== sourcePackage.subject
      || candidatePackage.structuralScope !== sourcePackage.structuralScope
      || candidatePackage.curriculumVersionId !== sourcePackage.curriculumVersionId
    ) {
      addIssue(issues, 'PILOT_SCOPE_MISMATCH', 'Production candidate subject, scope, and provisional version must match the source pilot')
    }
  } else {
    const prior = input.supersededCandidate
    if (!prior) {
      addIssue(issues, 'SUPERSEDED_REVISION_REQUIRED', 'Corrected package revision requires its exact predecessor for validation')
    } else {
      const reference = candidate.payloadReference
      if (
        reference.packageId !== prior.package.packageId
        || reference.packageRevisionId !== prior.package.packageRevisionId
        || reference.packageRevision !== prior.package.packageRevision
        || reference.packageChecksum !== prior.packageChecksum
        || candidatePackage.supersedesRevisionId !== prior.package.packageRevisionId
      ) {
        addIssue(issues, 'SUPERSEDED_REVISION_MISMATCH', 'Corrected package revision must bind to the exact predecessor identity and checksum')
      }
      if (
        candidatePackage.packageId !== prior.package.packageId
        || candidatePackage.packageRevision !== prior.package.packageRevision + 1
        || candidatePackage.packageRevisionId === prior.package.packageRevisionId
      ) {
        addIssue(issues, 'PACKAGE_REVISION_SEQUENCE_INVALID', 'Corrected revision must retain package identity, increment once, and use a new revision identity')
      }
      if (
        candidatePackage.subject !== prior.package.subject
        || candidatePackage.structuralScope !== prior.package.structuralScope
        || candidatePackage.curriculumVersionId !== prior.package.curriculumVersionId
        || candidate.structuralAnchor.subjectId !== prior.structuralAnchor.subjectId
        || candidate.structuralAnchor.curriculumNodeId !== prior.structuralAnchor.curriculumNodeId
        || candidate.structuralAnchor.curriculumVersionId !== prior.structuralAnchor.curriculumVersionId
        || candidate.structuralSnapshot.snapshotId !== prior.structuralSnapshot.snapshotId
        || candidate.structuralSnapshot.catalogSha256 !== prior.structuralSnapshot.catalogSha256
      ) {
        addIssue(issues, 'PACKAGE_REVISION_SCOPE_CHANGED', 'Corrected revision cannot change package structural identity or frozen snapshot')
      }
    }
  }
  if (
    candidate.structuralSnapshot.snapshotId !== sourcePackage.curriculumVersionId
    || candidate.structuralSnapshot.catalogSha256 !== input.expectedStructuralCatalogSha256
    || !sha256Pattern.test(candidate.structuralSnapshot.catalogSha256)
  ) {
    addIssue(issues, 'FROZEN_STRUCTURAL_SNAPSHOT_MISMATCH', 'Production candidate must pin the exact audited frozen structural candidate')
  }
  if (uuidPattern.test(candidatePackage.curriculumVersionId)) {
    addIssue(issues, 'DATABASE_CURRICULUM_VERSION_FORBIDDEN', 'Production candidate cannot claim a database CurriculumVersion UUID')
  }
  if (
    candidate.persistence.state !== 'REQUIRES_CURRICULUM_VERSION_REBIND_BEFORE_PERSISTENCE'
    || candidate.persistence.requiresCurriculumVersionRebind !== true
    || candidate.persistence.databaseCurriculumVersionId !== null
  ) {
    addIssue(issues, 'CURRICULUM_VERSION_REBIND_REQUIRED', 'Production candidate must remain blocked pending an exact database Curriculum Version rebind')
  }
  if (
    candidatePackage.status !== 'DRAFT'
    || candidatePackage.review.reviewStatus !== 'PENDING'
    || candidatePackage.review.reviewer !== null
    || candidatePackage.review.reviewedAt !== null
  ) {
    addIssue(issues, 'PRODUCTION_CANDIDATE_MUST_REMAIN_DRAFT', 'Production candidate must remain DRAFT with PENDING review and no reviewer evidence')
  }
  for (const item of candidate.contentItems) {
    if (item.provenance?.verificationStatus !== 'UNVERIFIED') {
      addIssue(issues, 'PRODUCTION_CONTENT_MUST_BE_UNVERIFIED', 'Production candidate Content must remain UNVERIFIED', 'CONTENT', item.contentKey)
    }
  }

  const expectedPayloadChecksum = productionKnowledgePayloadChecksum(candidate)
  if (candidate.payloadChecksum !== expectedPayloadChecksum) {
    addIssue(issues, 'PRODUCTION_PAYLOAD_CHECKSUM_MISMATCH', 'Production candidate payload checksum does not match its exact payload')
  }
  if (
    candidate.payloadReference.kind === 'PILOT'
    && expectedPayloadChecksum !== productionKnowledgePayloadChecksum(sourcePilotManifest)
  ) {
    addIssue(issues, 'PILOT_PAYLOAD_MUTATED', 'Production candidate payload differs from the source pilot payload')
  }
  const expectedPackageChecksum = productionKnowledgePackageChecksum(candidate)
  if (candidate.packageChecksum !== expectedPackageChecksum) {
    addIssue(issues, 'PRODUCTION_PACKAGE_CHECKSUM_MISMATCH', 'Production package checksum does not match the exact package revision')
  }

  return {
    valid: issues.length === 0,
    packageId: candidatePackage.packageId,
    packageRevisionId: candidatePackage.packageRevisionId,
    packageRevision: candidatePackage.packageRevision,
    payloadChecksum: candidate.payloadChecksum,
    packageChecksum: candidate.packageChecksum,
    taxonomyNodeCount: candidate.taxonomyNodes.length,
    contentItemCount: candidate.contentItems.length,
    mappingCount: candidate.mappings.length,
    draftPackageReport,
    issues,
  }
}

export const validateProductionKnowledgePackageCandidateSet = (input: {
  structuralRecords: readonly HumanSciencesCatalogRecord[]
  expectedStructuralCatalogSha256: string
  sourcePilotManifest: KnowledgeExpansionManifest
  candidates: readonly ProductionKnowledgePackageCandidate[]
}): ProductionKnowledgePackageSetReport => {
  const issues: KnowledgeExpansionValidationIssue[] = []
  const packageReports = input.candidates.map((candidate) => validateProductionKnowledgePackageCandidate({
    structuralRecords: input.structuralRecords,
    expectedStructuralCatalogSha256: input.expectedStructuralCatalogSha256,
    sourcePilotManifest: input.sourcePilotManifest,
    candidate,
  }))
  for (const report of packageReports) issues.push(...report.issues)

  const packageIds = new Set<string>()
  const revisionIds = new Set<string>()
  const taxonomyKeys = new Set<string>()
  const contentKeys = new Set<string>()
  const mappingKeys = new Set<string>()
  for (const candidate of input.candidates) {
    if (packageIds.has(candidate.package.packageId)) {
      addIssue(issues, 'DUPLICATE_PRODUCTION_PACKAGE_ID', 'Production package identities must be unique', 'PACKAGE', candidate.package.packageId)
    }
    packageIds.add(candidate.package.packageId)
    if (revisionIds.has(candidate.package.packageRevisionId)) {
      addIssue(issues, 'DUPLICATE_PACKAGE_REVISION_ID', 'Production package revision identities must be unique', 'PACKAGE', candidate.package.packageRevisionId)
    }
    revisionIds.add(candidate.package.packageRevisionId)
    for (const node of candidate.taxonomyNodes) {
      if (taxonomyKeys.has(node.taxonomyKey)) addIssue(issues, 'PRODUCTION_TAXONOMY_KEY_COLLISION', 'Taxonomy keys collide across production candidates', 'PACKAGE', node.taxonomyKey)
      taxonomyKeys.add(node.taxonomyKey)
    }
    for (const item of candidate.contentItems) {
      if (contentKeys.has(item.contentKey)) addIssue(issues, 'PRODUCTION_CONTENT_KEY_COLLISION', 'Content keys collide across production candidates', 'PACKAGE', item.contentKey)
      contentKeys.add(item.contentKey)
    }
    for (const mapping of candidate.mappings) {
      if (mappingKeys.has(mapping.mappingKey)) addIssue(issues, 'PRODUCTION_MAPPING_KEY_COLLISION', 'Mapping keys collide across production candidates', 'PACKAGE', mapping.mappingKey)
      mappingKeys.add(mapping.mappingKey)
    }
  }
  return { valid: issues.length === 0, packageCount: input.candidates.length, packageReports, issues }
}

export const createProductionKnowledgeReadinessReport = (
  validation: ProductionKnowledgePackageValidationReport,
  review?: Readonly<{
    valid: boolean
    reviewStatus: KnowledgePackageReviewStatus
    reviewerProvenance: 'HUMAN' | 'AI_ASSISTED'
    qualifiedHumanEvidence: boolean
    reviewedSubject: Readonly<{
      packageId: string
      packageRevisionId: string
      packageRevision: number
      payloadChecksum: string
      packageChecksum: string
    }>
  }>,
): ProductionKnowledgeReadinessReport => {
  const reviewMatchesRevision = Boolean(
    review?.valid
    && review.qualifiedHumanEvidence
    && review.reviewerProvenance === 'HUMAN'
    && review.reviewedSubject.packageId === validation.packageId
    && review.reviewedSubject.packageRevisionId === validation.packageRevisionId
    && review.reviewedSubject.packageRevision === validation.packageRevision
    && review.reviewedSubject.payloadChecksum === validation.payloadChecksum
    && review.reviewedSubject.packageChecksum === validation.packageChecksum,
  )
  return {
    packageId: validation.packageId,
    packageRevisionId: validation.packageRevisionId,
    packageRevision: validation.packageRevision,
    payloadChecksum: validation.payloadChecksum,
    packageChecksum: validation.packageChecksum,
    counts: {
      taxonomyNodes: validation.taxonomyNodeCount,
      contentItems: validation.contentItemCount,
      mappings: validation.mappingCount,
    },
    readiness: {
      machineStructure: validation.valid ? 'PASS' : 'FAIL',
      educationalReview: reviewMatchesRevision && review?.reviewStatus === 'ACCEPTED'
        ? 'ACCEPTED'
        : reviewMatchesRevision && review?.reviewStatus === 'CHANGES_REQUESTED'
          ? 'CHANGES_REQUESTED'
          : 'PENDING',
      packageLifecycle: validation.draftPackageReport.packageStatus,
      persistence: validation.valid
        ? 'BLOCKED_PENDING_CURRICULUM_VERSION_REBIND'
        : 'BLOCKED_VALIDATION_FAILURES',
      publication: 'NOT_AUTHORIZED',
    },
    issues: validation.issues,
  }
}
