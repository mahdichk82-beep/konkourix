import {
  buildNextProductionKnowledgePackageRevision,
  knowledgePackageReviewStatuses,
  type KnowledgePackageReviewStatus,
  type ProductionKnowledgePackageCandidate,
} from './knowledge-expansion-package.js'

export const KNOWLEDGE_PACKAGE_REVIEW_SCHEMA_VERSION = 'konkourix-knowledge-package-review/v1'

export const knowledgePackageReviewerProvenances = ['HUMAN', 'AI_ASSISTED'] as const
export type KnowledgePackageReviewerProvenance = typeof knowledgePackageReviewerProvenances[number]

export const knowledgePackageReviewDimensions = [
  'TERMINOLOGY',
  'TAXONOMY_HIERARCHY',
  'FORMULA_CORRECTNESS',
  'SIGN_CONVENTIONS',
  'UNITS',
  'EXAMPLE_WORDING',
  'PERSIAN_LANGUAGE_QUALITY',
  'TAXONOMY_GRANULARITY',
  'SKILL_WORDING',
  'QUESTION_PATTERN_BOUNDARIES',
  'CONTENT_CORRECTNESS',
  'PROVENANCE_APPROPRIATENESS',
] as const
export type KnowledgePackageReviewDimension = typeof knowledgePackageReviewDimensions[number]

export const knowledgePackageReviewDimensionLabels: Readonly<Record<KnowledgePackageReviewDimension, string>> = {
  TERMINOLOGY: 'Terminology',
  TAXONOMY_HIERARCHY: 'Taxonomy hierarchy',
  FORMULA_CORRECTNESS: 'Formula correctness',
  SIGN_CONVENTIONS: 'Sign conventions',
  UNITS: 'Units',
  EXAMPLE_WORDING: 'Example wording',
  PERSIAN_LANGUAGE_QUALITY: 'Persian language quality',
  TAXONOMY_GRANULARITY: 'Taxonomy granularity',
  SKILL_WORDING: 'Skill wording',
  QUESTION_PATTERN_BOUNDARIES: 'Question Pattern classification boundaries',
  CONTENT_CORRECTNESS: 'Content correctness',
  PROVENANCE_APPROPRIATENESS: 'Source and provenance appropriateness',
}

export const knowledgePackageReviewDecisionDispositions = [
  'ACCEPTED_AS_IS',
  'CHANGES_REQUIRED',
  'NOT_APPLICABLE',
] as const
export type KnowledgePackageReviewDecisionDisposition = typeof knowledgePackageReviewDecisionDispositions[number]

export const knowledgePackageReviewFindingSeverities = ['ADVISORY', 'BLOCKING'] as const
export type KnowledgePackageReviewFindingSeverity = typeof knowledgePackageReviewFindingSeverities[number]

export const knowledgePackageReviewFindingStatuses = [
  'OPEN',
  'RESOLVED',
  'ACCEPTED_AS_IS',
  'NOT_APPLICABLE',
] as const
export type KnowledgePackageReviewFindingStatus = typeof knowledgePackageReviewFindingStatuses[number]

export const knowledgePackageReviewTargetKinds = [
  'PACKAGE',
  'TAXONOMY_NODE',
  'CONTENT_ITEM',
  'MAPPING',
] as const
export type KnowledgePackageReviewTargetKind = typeof knowledgePackageReviewTargetKinds[number]

export type KnowledgePackageReviewSubject = Readonly<{
  packageId: string
  packageRevisionId: string
  packageRevision: number
  payloadChecksum: string
  packageChecksum: string
  subject: string
  structuralScope: string
  curriculumSnapshotReference: string
}>

export type KnowledgePackageReviewDimensionDecision = Readonly<{
  dimension: KnowledgePackageReviewDimension
  disposition: KnowledgePackageReviewDecisionDisposition
  reviewerNote: string | null
}>

export type KnowledgePackageReviewFinding = Readonly<{
  findingId: string
  reviewSessionId: string
  dimension: KnowledgePackageReviewDimension
  severity: KnowledgePackageReviewFindingSeverity
  status: KnowledgePackageReviewFindingStatus
  targetKind: KnowledgePackageReviewTargetKind
  targetKey: string
  reviewerNote: string
  requiredAction: string | null
  createdBy: string
  createdAt: string
}>

export type KnowledgePackageReviewSession = Readonly<{
  schemaVersion: typeof KNOWLEDGE_PACKAGE_REVIEW_SCHEMA_VERSION
  reviewSessionId: string
  subject: KnowledgePackageReviewSubject
  reviewStatus: KnowledgePackageReviewStatus
  reviewer: string | null
  startedAt: string | null
  reviewedAt: string | null
  dimensionDecisions: readonly KnowledgePackageReviewDimensionDecision[]
  findings: readonly KnowledgePackageReviewFinding[]
}>

export type KnowledgePackageReviewIssue = Readonly<{
  code: string
  message: string
  reference?: string
}>

export type KnowledgePackageReviewValidationReport = Readonly<{
  valid: boolean
  reviewSessionId: string
  reviewStatus: KnowledgePackageReviewStatus
  reviewerProvenance: KnowledgePackageReviewerProvenance
  qualifiedHumanEvidence: boolean
  reviewedSubject: KnowledgePackageReviewSubject
  dimensionDecisionCount: number
  findingCount: number
  eligibleForReviewedTransition: boolean
  issues: readonly KnowledgePackageReviewIssue[]
}>

export type KnowledgePackageReviewHistoryReport = Readonly<{
  valid: boolean
  revisionCount: number
  sessionCount: number
  sessionReports: readonly KnowledgePackageReviewValidationReport[]
  issues: readonly KnowledgePackageReviewIssue[]
}>

export type KnowledgePackageReviewEvidence = Readonly<{
  reviewerProvenance: KnowledgePackageReviewerProvenance
  session: KnowledgePackageReviewSession
}>

export type KnowledgePackageCorrectionResult = Readonly<{
  created: boolean
  revision: ProductionKnowledgePackageCandidate | null
  reviewReport: KnowledgePackageReviewValidationReport
  issues: readonly KnowledgePackageReviewIssue[]
}>

export type KnowledgePackageReviewInputTemplate = Readonly<{
  schemaVersion: typeof KNOWLEDGE_PACKAGE_REVIEW_SCHEMA_VERSION
  reviewSessionId: '<review-session-id>'
  subject: KnowledgePackageReviewSubject
  reviewStatus: 'PENDING'
  reviewer: null
  startedAt: null
  reviewedAt: null
  dimensionDecisions: readonly []
  findings: readonly []
}>

const reviewSessionIdPattern = /^review-session-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const findingIdPattern = /^review-finding-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

const isValidTimestamp = (value: string): boolean =>
  Boolean(value.trim()) && Number.isFinite(Date.parse(value))

const nonEmpty = (value: string | null): value is string => Boolean(value?.trim())

const addIssue = (
  issues: KnowledgePackageReviewIssue[],
  code: string,
  message: string,
  reference?: string,
): void => {
  issues.push({ code, message, ...(reference ? { reference } : {}) })
}

export const knowledgePackageReviewSubject = (
  candidate: ProductionKnowledgePackageCandidate,
): KnowledgePackageReviewSubject => ({
  packageId: candidate.package.packageId,
  packageRevisionId: candidate.package.packageRevisionId,
  packageRevision: candidate.package.packageRevision,
  payloadChecksum: candidate.payloadChecksum,
  packageChecksum: candidate.packageChecksum,
  subject: candidate.package.subject,
  structuralScope: candidate.package.structuralScope,
  curriculumSnapshotReference: candidate.structuralSnapshot.snapshotId,
})

const validateSubjectBinding = (
  expected: KnowledgePackageReviewSubject,
  actual: KnowledgePackageReviewSubject,
  issues: KnowledgePackageReviewIssue[],
): void => {
  const fields: readonly Readonly<{
    field: keyof KnowledgePackageReviewSubject
    code: string
  }>[] = [
    { field: 'packageId', code: 'STALE_PACKAGE_ID' },
    { field: 'packageRevisionId', code: 'STALE_PACKAGE_REVISION_ID' },
    { field: 'packageRevision', code: 'STALE_PACKAGE_REVISION_NUMBER' },
    { field: 'payloadChecksum', code: 'STALE_PAYLOAD_CHECKSUM' },
    { field: 'packageChecksum', code: 'STALE_PACKAGE_CHECKSUM' },
    { field: 'subject', code: 'STALE_PACKAGE_SUBJECT' },
    { field: 'structuralScope', code: 'STALE_STRUCTURAL_SCOPE' },
    { field: 'curriculumSnapshotReference', code: 'STALE_CURRICULUM_SNAPSHOT' },
  ]
  for (const { field, code } of fields) {
    if (actual[field] !== expected[field]) {
      addIssue(issues, code, `Review subject ${field} does not match the exact package revision`, field)
    }
  }
}

const validateFindingTarget = (
  finding: KnowledgePackageReviewFinding,
  candidate: ProductionKnowledgePackageCandidate,
  issues: KnowledgePackageReviewIssue[],
): void => {
  const exists = finding.targetKind === 'PACKAGE'
    ? finding.targetKey === candidate.package.packageId
    : finding.targetKind === 'TAXONOMY_NODE'
      ? candidate.taxonomyNodes.some((node) => node.taxonomyKey === finding.targetKey)
      : finding.targetKind === 'CONTENT_ITEM'
        ? candidate.contentItems.some((item) => item.contentKey === finding.targetKey)
        : candidate.mappings.some((mapping) => mapping.mappingKey === finding.targetKey)
  if (!exists) {
    const code = finding.targetKind === 'TAXONOMY_NODE'
      ? 'FINDING_TAXONOMY_TARGET_NOT_FOUND'
      : finding.targetKind === 'CONTENT_ITEM'
        ? 'FINDING_CONTENT_TARGET_NOT_FOUND'
        : finding.targetKind === 'MAPPING'
          ? 'FINDING_MAPPING_TARGET_NOT_FOUND'
          : 'FINDING_PACKAGE_TARGET_NOT_FOUND'
    addIssue(issues, code, 'Review finding target does not exist in the exact package revision', finding.findingId)
  }
}

export const validateKnowledgePackageReviewSession = (input: {
  candidate: ProductionKnowledgePackageCandidate
  session: KnowledgePackageReviewSession
  reviewerProvenance: KnowledgePackageReviewerProvenance
}): KnowledgePackageReviewValidationReport => {
  const { candidate, session, reviewerProvenance } = input
  const issues: KnowledgePackageReviewIssue[] = []

  if (session.schemaVersion !== KNOWLEDGE_PACKAGE_REVIEW_SCHEMA_VERSION) {
    addIssue(issues, 'REVIEW_SCHEMA_VERSION_UNSUPPORTED', 'Knowledge package review schema version is unsupported')
  }
  if (!reviewSessionIdPattern.test(session.reviewSessionId)) {
    addIssue(issues, 'REVIEW_SESSION_ID_INVALID', 'Review session requires a stable opaque identity')
  }
  if (!knowledgePackageReviewStatuses.includes(session.reviewStatus)) {
    addIssue(issues, 'REVIEW_STATUS_UNSUPPORTED', 'Review session status is unsupported')
  }
  if (!knowledgePackageReviewerProvenances.includes(reviewerProvenance)) {
    addIssue(issues, 'REVIEWER_PROVENANCE_UNSUPPORTED', 'Review evidence requires controlled reviewer provenance')
  }
  validateSubjectBinding(knowledgePackageReviewSubject(candidate), session.subject, issues)

  const decisions = new Set<KnowledgePackageReviewDimension>()
  for (const decision of session.dimensionDecisions) {
    if (!knowledgePackageReviewDimensions.includes(decision.dimension)) {
      addIssue(issues, 'REVIEW_DIMENSION_UNSUPPORTED', 'Review decision uses an unsupported dimension', String(decision.dimension))
    }
    if (decisions.has(decision.dimension)) {
      addIssue(issues, 'DUPLICATE_REVIEW_DIMENSION_DECISION', 'A review session may record only one decision per mandatory dimension', decision.dimension)
    }
    decisions.add(decision.dimension)
    if (!knowledgePackageReviewDecisionDispositions.includes(decision.disposition)) {
      addIssue(issues, 'REVIEW_DISPOSITION_UNSUPPORTED', 'Review decision uses an unsupported disposition', decision.dimension)
    }
    if (decision.reviewerNote !== null && !decision.reviewerNote.trim()) {
      addIssue(issues, 'EMPTY_REVIEW_DECISION_NOTE', 'Reviewer note must be null or non-empty', decision.dimension)
    }
  }

  const findingIds = new Set<string>()
  for (const finding of session.findings) {
    if (!findingIdPattern.test(finding.findingId)) {
      addIssue(issues, 'REVIEW_FINDING_ID_INVALID', 'Review finding requires a stable opaque identity', finding.findingId)
    }
    if (findingIds.has(finding.findingId)) {
      addIssue(issues, 'DUPLICATE_REVIEW_FINDING_ID', 'Finding IDs must be unique within a review session', finding.findingId)
    }
    findingIds.add(finding.findingId)
    if (finding.reviewSessionId !== session.reviewSessionId) {
      addIssue(issues, 'FINDING_SESSION_MISMATCH', 'Finding must identify its owning review session', finding.findingId)
    }
    if (!knowledgePackageReviewDimensions.includes(finding.dimension)) {
      addIssue(issues, 'FINDING_DIMENSION_UNSUPPORTED', 'Finding uses an unsupported review dimension', finding.findingId)
    }
    if (!knowledgePackageReviewFindingSeverities.includes(finding.severity)) {
      addIssue(issues, 'FINDING_SEVERITY_UNSUPPORTED', 'Finding uses an unsupported severity', finding.findingId)
    }
    if (!knowledgePackageReviewFindingStatuses.includes(finding.status)) {
      addIssue(issues, 'FINDING_STATUS_UNSUPPORTED', 'Finding uses an unsupported status', finding.findingId)
    }
    if (!knowledgePackageReviewTargetKinds.includes(finding.targetKind)) {
      addIssue(issues, 'FINDING_TARGET_KIND_UNSUPPORTED', 'Finding uses an unsupported target kind', finding.findingId)
    } else {
      validateFindingTarget(finding, candidate, issues)
    }
    if (!finding.reviewerNote.trim()) {
      addIssue(issues, 'FINDING_NOTE_REQUIRED', 'Finding requires a human-supplied reviewer note', finding.findingId)
    }
    if (finding.status === 'OPEN' && !nonEmpty(finding.requiredAction)) {
      addIssue(issues, 'OPEN_FINDING_ACTION_REQUIRED', 'Open finding requires a human-supplied required action', finding.findingId)
    }
    if (!finding.createdBy.trim() || !isValidTimestamp(finding.createdAt)) {
      addIssue(issues, 'FINDING_CREATION_METADATA_REQUIRED', 'Finding requires creator identity and a valid creation timestamp', finding.findingId)
    }
    if (nonEmpty(session.reviewer) && finding.createdBy !== session.reviewer) {
      addIssue(issues, 'FINDING_REVIEWER_MISMATCH', 'Finding creator must match the assigned review session reviewer', finding.findingId)
    }
  }

  if (session.reviewStatus === 'PENDING') {
    if (session.reviewer !== null || session.startedAt !== null || session.reviewedAt !== null) {
      addIssue(issues, 'PENDING_REVIEW_HAS_METADATA', 'Pending review cannot carry reviewer or review timestamps')
    }
    if (session.dimensionDecisions.length > 0 || session.findings.length > 0) {
      addIssue(issues, 'PENDING_REVIEW_HAS_EVIDENCE', 'Pending review cannot carry decisions or findings')
    }
  } else if (session.reviewStatus === 'IN_REVIEW') {
    if (!nonEmpty(session.reviewer) || !session.startedAt || !isValidTimestamp(session.startedAt)) {
      addIssue(issues, 'IN_REVIEW_METADATA_REQUIRED', 'In-progress review requires reviewer identity and valid startedAt')
    }
    if (session.reviewedAt !== null) {
      addIssue(issues, 'IN_REVIEW_COMPLETION_FORBIDDEN', 'In-progress review cannot carry reviewedAt')
    }
  } else {
    if (!nonEmpty(session.reviewer)) {
      addIssue(issues, 'COMPLETED_REVIEWER_REQUIRED', 'Completed review outcome requires reviewer identity')
    }
    if (!session.startedAt || !isValidTimestamp(session.startedAt)) {
      addIssue(issues, 'COMPLETED_REVIEW_STARTED_AT_REQUIRED', 'Completed review outcome requires valid startedAt')
    }
    if (!session.reviewedAt || !isValidTimestamp(session.reviewedAt)) {
      addIssue(issues, 'COMPLETED_REVIEWED_AT_REQUIRED', 'Completed review outcome requires valid reviewedAt')
    }
    if (
      session.startedAt && session.reviewedAt
      && isValidTimestamp(session.startedAt) && isValidTimestamp(session.reviewedAt)
      && Date.parse(session.reviewedAt) < Date.parse(session.startedAt)
    ) {
      addIssue(issues, 'REVIEW_TIMESTAMP_ORDER_INVALID', 'reviewedAt cannot precede startedAt')
    }
  }

  if (session.reviewStatus === 'CHANGES_REQUESTED') {
    const actionable = session.findings.some((finding) =>
      finding.status === 'OPEN' && nonEmpty(finding.requiredAction))
    if (!actionable) {
      addIssue(issues, 'ACTIONABLE_CHANGE_FINDING_REQUIRED', 'CHANGES_REQUESTED requires at least one open actionable finding')
    }
  }

  if (session.reviewStatus === 'ACCEPTED') {
    for (const dimension of knowledgePackageReviewDimensions) {
      if (!decisions.has(dimension)) {
        addIssue(issues, 'MANDATORY_REVIEW_DIMENSION_MISSING', 'Accepted review requires an explicit decision for every mandatory dimension', dimension)
      }
    }
    if (session.dimensionDecisions.some((decision) => decision.disposition === 'CHANGES_REQUIRED')) {
      addIssue(issues, 'ACCEPTED_REVIEW_HAS_CHANGE_DECISION', 'Accepted review cannot retain a CHANGES_REQUIRED dimension decision')
    }
    if (session.findings.some((finding) => finding.severity === 'BLOCKING' && finding.status === 'OPEN')) {
      addIssue(issues, 'ACCEPTED_REVIEW_HAS_BLOCKING_FINDING', 'Accepted review cannot retain an open blocking finding')
    }
  }

  const valid = issues.length === 0
  return {
    valid,
    reviewSessionId: session.reviewSessionId,
    reviewStatus: session.reviewStatus,
    reviewerProvenance,
    qualifiedHumanEvidence: valid && reviewerProvenance === 'HUMAN',
    reviewedSubject: session.subject,
    dimensionDecisionCount: session.dimensionDecisions.length,
    findingCount: session.findings.length,
    eligibleForReviewedTransition:
      valid && reviewerProvenance === 'HUMAN' && session.reviewStatus === 'ACCEPTED',
    issues,
  }
}

export const validateKnowledgePackageReviewHistory = (input: {
  revisions: readonly ProductionKnowledgePackageCandidate[]
  evidence: readonly KnowledgePackageReviewEvidence[]
}): KnowledgePackageReviewHistoryReport => {
  const issues: KnowledgePackageReviewIssue[] = []
  const sessionReports: KnowledgePackageReviewValidationReport[] = []
  const sessionIds = new Set<string>()
  const findingIds = new Set<string>()

  for (const entry of input.evidence) {
    const { session } = entry
    if (sessionIds.has(session.reviewSessionId)) {
      addIssue(issues, 'DUPLICATE_REVIEW_SESSION_ID', 'Review history cannot contain duplicate session identities', session.reviewSessionId)
    }
    sessionIds.add(session.reviewSessionId)
    for (const finding of session.findings) {
      if (findingIds.has(finding.findingId)) {
        addIssue(issues, 'DUPLICATE_HISTORICAL_FINDING_ID', 'Review history cannot reuse finding identities', finding.findingId)
      }
      findingIds.add(finding.findingId)
    }

    const revision = input.revisions.find((candidate) =>
      candidate.package.packageId === session.subject.packageId
      && candidate.package.packageRevisionId === session.subject.packageRevisionId
      && candidate.package.packageRevision === session.subject.packageRevision)
    if (!revision) {
      addIssue(issues, 'REVIEWED_REVISION_NOT_FOUND', 'Historical review must retain its exact package revision', session.reviewSessionId)
      continue
    }
    const report = validateKnowledgePackageReviewSession({
      candidate: revision,
      session,
      reviewerProvenance: entry.reviewerProvenance,
    })
    sessionReports.push(report)
    issues.push(...report.issues)
  }

  return {
    valid: issues.length === 0,
    revisionCount: input.revisions.length,
    sessionCount: input.evidence.length,
    sessionReports,
    issues,
  }
}

export const createCorrectedKnowledgePackageRevision = (input: {
  currentRevision: ProductionKnowledgePackageCandidate
  changesRequestedReview: KnowledgePackageReviewEvidence
  packageRevisionId: string
  taxonomyNodes: ProductionKnowledgePackageCandidate['taxonomyNodes']
  contentItems: ProductionKnowledgePackageCandidate['contentItems']
  mappings: ProductionKnowledgePackageCandidate['mappings']
}): KnowledgePackageCorrectionResult => {
  const reviewReport = validateKnowledgePackageReviewSession({
    candidate: input.currentRevision,
    session: input.changesRequestedReview.session,
    reviewerProvenance: input.changesRequestedReview.reviewerProvenance,
  })
  const issues = [...reviewReport.issues]
  if (input.changesRequestedReview.session.reviewStatus !== 'CHANGES_REQUESTED') {
    addIssue(issues, 'CHANGES_REQUESTED_REVIEW_REQUIRED', 'A corrected revision requires valid CHANGES_REQUESTED evidence for its exact predecessor')
  }
  if (input.changesRequestedReview.reviewerProvenance !== 'HUMAN') {
    addIssue(issues, 'QUALIFIED_HUMAN_CHANGES_REQUEST_REQUIRED', 'AI-assisted findings cannot authorize creation of a corrected package revision')
  }
  if (issues.length > 0) {
    return { created: false, revision: null, reviewReport, issues }
  }
  return {
    created: true,
    revision: buildNextProductionKnowledgePackageRevision({
      currentRevision: input.currentRevision,
      packageRevisionId: input.packageRevisionId,
      taxonomyNodes: input.taxonomyNodes,
      contentItems: input.contentItems,
      mappings: input.mappings,
    }),
    reviewReport,
    issues,
  }
}

export const createKnowledgePackageReviewInputTemplate = (
  candidate: ProductionKnowledgePackageCandidate,
): KnowledgePackageReviewInputTemplate => ({
  schemaVersion: KNOWLEDGE_PACKAGE_REVIEW_SCHEMA_VERSION,
  reviewSessionId: '<review-session-id>',
  subject: knowledgePackageReviewSubject(candidate),
  reviewStatus: 'PENDING',
  reviewer: null,
  startedAt: null,
  reviewedAt: null,
  dimensionDecisions: [],
  findings: [],
})

const markdownCell = (value: string | null): string =>
  (value ?? '—').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|')

export const createKnowledgePackageReviewPacket = (
  candidate: ProductionKnowledgePackageCandidate,
): string => {
  const subject = knowledgePackageReviewSubject(candidate)
  const lines = [
    '# Physics 12 Motion — Knowledge Package Review Packet',
    '',
    '> No educational review decision has occurred. This deterministic packet is blank review material for a qualified human reviewer.',
    '',
    '## Exact review subject',
    '',
    `- Package ID: \`${subject.packageId}\``,
    `- Revision ID: \`${subject.packageRevisionId}\``,
    `- Revision: \`${subject.packageRevision}\``,
    `- Payload SHA-256: \`${subject.payloadChecksum}\``,
    `- Package SHA-256: \`${subject.packageChecksum}\``,
    `- Subject: \`${subject.subject}\``,
    `- Structural scope: \`${subject.structuralScope}\``,
    `- Provisional Curriculum snapshot: \`${subject.curriculumSnapshotReference}\``,
    '',
    '> Persistence warning: this package requires an exact database Curriculum Version rebind before persistence. The provisional snapshot is not a database UUID.',
    '',
    '## Mandatory review decisions',
    '',
    '| Dimension code | Human-facing label | Decision | Reviewer note |',
    '| --- | --- | --- | --- |',
    ...knowledgePackageReviewDimensions.map((dimension) =>
      `| \`${dimension}\` | ${knowledgePackageReviewDimensionLabels[dimension]} |  |  |`),
    '',
    '## Blank finding section',
    '',
    '| Finding ID | Dimension | Severity | Status | Target kind | Target key | Reviewer note | Required action | Created by | Created at |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    '|  |  |  |  |  |  |  |  |  |  |',
    '',
    '## Taxonomy inventory',
    '',
    '| Stable key | Kind | Parent | Label | Source artifact | Source record | Source locator | Raw text |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...candidate.taxonomyNodes.map((node) =>
      `| \`${node.taxonomyKey}\` | \`${node.kind}\` | ${node.parentTaxonomyKey ? `\`${node.parentTaxonomyKey}\`` : '—'} | ${markdownCell(node.displayLabel)} | ${markdownCell(node.provenance.sourceArtifactName)} | \`${node.provenance.sourceRecordKey}\` | ${markdownCell(node.provenance.sourceLocator)} | ${markdownCell(node.provenance.rawText)} |`),
    '',
    '## Content inventory',
    '',
    '| Stable key | Kind | Title | Body | Source type | Source reference | Created by | Created at | Verification |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...candidate.contentItems.map((item) =>
      `| \`${item.contentKey}\` | \`${item.kind}\` | ${markdownCell(item.title)} | ${markdownCell(item.body)} | \`${item.provenance?.sourceType ?? 'MISSING'}\` | ${markdownCell(item.provenance?.sourceReference ?? null)} | ${markdownCell(item.provenance?.createdBy ?? null)} | ${markdownCell(item.provenance?.createdAt ?? null)} | \`${item.provenance?.verificationStatus ?? 'MISSING'}\` |`),
    '',
    '## Mapping inventory',
    '',
    '| Stable key | Content key | Taxonomy key | Structural scope |',
    '| --- | --- | --- | --- |',
    ...candidate.mappings.map((mapping) =>
      `| \`${mapping.mappingKey}\` | \`${mapping.contentKey}\` | \`${mapping.taxonomyKey}\` | \`${mapping.curriculumNodeId}\` |`),
    '',
    '## Outcome boundary',
    '',
    'A completed human review may record `CHANGES_REQUESTED` or `ACCEPTED` for this exact revision. It does not itself change package lifecycle, verify individual Content Items, approve the package, publish Curriculum, or authorize persistence.',
    '',
  ]
  return lines.join('\n')
}
