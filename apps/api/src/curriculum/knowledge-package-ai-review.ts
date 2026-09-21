import { createHash } from 'node:crypto'
import {
  deterministicJsonSha256,
  type ProductionKnowledgePackageCandidate,
} from './knowledge-expansion-package.js'
import {
  knowledgePackageReviewDecisionDispositions,
  knowledgePackageReviewDimensions,
  knowledgePackageReviewDimensionLabels,
  knowledgePackageReviewFindingSeverities,
  knowledgePackageReviewSubject,
  validateKnowledgePackageReviewSession,
  type KnowledgePackageReviewDimension,
  type KnowledgePackageReviewDimensionDecision,
  type KnowledgePackageReviewFindingSeverity,
  type KnowledgePackageReviewSession,
  type KnowledgePackageReviewSubject,
  type KnowledgePackageReviewValidationReport,
} from './knowledge-package-review.js'

export const AI_REVIEW_INTAKE_SCHEMA_VERSION = 'konkourix-knowledge-package-ai-review-intake/v1'
export const HUMAN_AI_TRIAGE_SCHEMA_VERSION = 'konkourix-knowledge-package-ai-triage/v1'

export const humanAiTriageDecisions = ['CONFIRM', 'REJECT', 'MODIFY'] as const
export type HumanAiTriageDecision = typeof humanAiTriageDecisions[number]

export const humanAiReviewFinalOutcomes = ['CHANGES_REQUESTED', 'ACCEPTED'] as const
export type HumanAiReviewFinalOutcome = typeof humanAiReviewFinalOutcomes[number]

export type AiAssistedReviewIntake = Readonly<{
  schemaVersion: typeof AI_REVIEW_INTAKE_SCHEMA_VERSION
  reviewerProvenance: 'AI_ASSISTED'
  sourceEvidencePath: string
  sourceEvidenceSha256: string
  session: KnowledgePackageReviewSession
}>

export type AiAssistedReviewIntakeIssue = Readonly<{
  code: string
  message: string
  reference?: string
}>

export type AiAssistedReviewIntakeReport = Readonly<{
  valid: boolean
  advisoryOnly: true
  satisfiesQualifiedHumanReviewGate: false
  reviewOutcome: KnowledgePackageReviewSession['reviewStatus']
  findingCount: number
  sourceEvidenceSha256: string
  reviewEvidenceChecksum: string
  reviewReport: KnowledgePackageReviewValidationReport
  issues: readonly AiAssistedReviewIntakeIssue[]
}>

export type HumanAiFindingTriage = Readonly<{
  reviewSessionId: string
  findingId: string
  packageId: string
  packageRevisionId: string
  payloadChecksum: string
  packageChecksum: string
  aiReviewEvidenceChecksum: string
  decision: HumanAiTriageDecision
  reviewerNote: string | null
  modifiedRequiredAction: string | null
  severityAdjustment: KnowledgePackageReviewFindingSeverity | null
  rationale: string
}>

export type HumanAiReviewAttestation = Readonly<{
  schemaVersion: typeof HUMAN_AI_TRIAGE_SCHEMA_VERSION
  attestationId: string
  reviewerProvenance: 'HUMAN'
  reviewer: string | null
  startedAt: string | null
  reviewedAt: string | null
  subject: KnowledgePackageReviewSubject
  aiReviewSessionId: string
  aiReviewEvidenceChecksum: string
  dimensionDecisions: readonly KnowledgePackageReviewDimensionDecision[]
  findingTriage: readonly HumanAiFindingTriage[]
  finalOutcome: HumanAiReviewFinalOutcome | null
}>

export type HumanAiReviewAttestationIssue = Readonly<{
  code: string
  message: string
  reference?: string
}>

export type HumanAiReviewAttestationReport = Readonly<{
  valid: boolean
  reviewSessionId: string
  reviewStatus: HumanAiReviewFinalOutcome | 'PENDING'
  reviewerProvenance: 'HUMAN'
  qualifiedHumanEvidence: boolean
  reviewedSubject: KnowledgePackageReviewSubject
  eligibleForReviewedTransition: boolean
  confirmedCount: number
  rejectedCount: number
  modifiedCount: number
  effectiveBlockingFindingCount: number
  issues: readonly HumanAiReviewAttestationIssue[]
}>

export type HumanAiReviewAttestationTemplate = Readonly<{
  schemaVersion: typeof HUMAN_AI_TRIAGE_SCHEMA_VERSION
  attestationId: '<human-attestation-id>'
  reviewerProvenance: 'HUMAN'
  reviewer: null
  startedAt: null
  reviewedAt: null
  subject: KnowledgePackageReviewSubject
  aiReviewSessionId: string
  aiReviewEvidenceChecksum: string
  dimensionDecisions: readonly Readonly<{
    dimension: KnowledgePackageReviewDimension
    disposition: null
    reviewerNote: null
  }>[]
  findingTriage: readonly Readonly<{
    reviewSessionId: string
    findingId: string
    packageId: string
    packageRevisionId: string
    payloadChecksum: string
    packageChecksum: string
    aiReviewEvidenceChecksum: string
    decision: null
    reviewerNote: null
    modifiedRequiredAction: null
    severityAdjustment: null
    rationale: null
  }>[]
  finalOutcome: null
}>

const sha256Pattern = /^[0-9a-f]{64}$/
const attestationIdPattern = /^human-attestation-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

const sha256Bytes = (value: Uint8Array | string): string => createHash('sha256')
  .update(value)
  .digest('hex')

const evidenceText = (value: Uint8Array | string): string =>
  typeof value === 'string' ? value : Buffer.from(value).toString('utf8')

const nonEmpty = (value: string | null): value is string => Boolean(value?.trim())

const isValidTimestamp = (value: string | null): value is string =>
  typeof value === 'string' && Boolean(value.trim()) && Number.isFinite(Date.parse(value))

const addIssue = (
  issues: AiAssistedReviewIntakeIssue[] | HumanAiReviewAttestationIssue[],
  code: string,
  message: string,
  reference?: string,
): void => {
  issues.push({ code, message, ...(reference ? { reference } : {}) })
}

export const knowledgePackageReviewEvidenceChecksum = (
  session: KnowledgePackageReviewSession,
): string => deterministicJsonSha256(session)

export const validateAiAssistedReviewIntake = (input: {
  candidate: ProductionKnowledgePackageCandidate
  intake: AiAssistedReviewIntake
  sourceEvidenceBytes: Uint8Array | string
}): AiAssistedReviewIntakeReport => {
  const { candidate, intake, sourceEvidenceBytes } = input
  const issues: AiAssistedReviewIntakeIssue[] = []
  const reviewReport = validateKnowledgePackageReviewSession({
    candidate,
    session: intake.session,
    reviewerProvenance: intake.reviewerProvenance,
  })
  const reviewEvidenceChecksum = knowledgePackageReviewEvidenceChecksum(intake.session)

  if (intake.schemaVersion !== AI_REVIEW_INTAKE_SCHEMA_VERSION) {
    addIssue(issues, 'AI_REVIEW_INTAKE_SCHEMA_UNSUPPORTED', 'AI review intake schema version is unsupported')
  }
  if (intake.reviewerProvenance !== 'AI_ASSISTED') {
    addIssue(issues, 'AI_REVIEW_PROVENANCE_REQUIRED', 'AI review intake must be explicitly classified as AI_ASSISTED')
  }
  if (!intake.sourceEvidencePath.trim()) {
    addIssue(issues, 'AI_REVIEW_SOURCE_PATH_REQUIRED', 'AI review intake requires a repository-relative evidence path')
  }
  if (!sha256Pattern.test(intake.sourceEvidenceSha256)) {
    addIssue(issues, 'AI_REVIEW_SOURCE_SHA256_INVALID', 'AI review source checksum must be lowercase SHA-256')
  }
  const actualSourceSha256 = sha256Bytes(sourceEvidenceBytes)
  if (actualSourceSha256 !== intake.sourceEvidenceSha256) {
    addIssue(issues, 'AI_REVIEW_SOURCE_SHA256_MISMATCH', 'AI review source bytes do not match intake metadata')
  }

  try {
    const parsed = JSON.parse(evidenceText(sourceEvidenceBytes)) as unknown
    if (deterministicJsonSha256(parsed) !== reviewEvidenceChecksum) {
      addIssue(issues, 'AI_REVIEW_EVIDENCE_CONTENT_MISMATCH', 'Parsed AI review evidence differs from the immutable supplied source')
    }
  } catch {
    addIssue(issues, 'AI_REVIEW_SOURCE_JSON_INVALID', 'AI review source evidence is not valid JSON')
  }

  for (const issue of reviewReport.issues) {
    addIssue(issues, issue.code, issue.message, issue.reference)
  }

  return {
    valid: issues.length === 0,
    advisoryOnly: true,
    satisfiesQualifiedHumanReviewGate: false,
    reviewOutcome: intake.session.reviewStatus,
    findingCount: intake.session.findings.length,
    sourceEvidenceSha256: actualSourceSha256,
    reviewEvidenceChecksum,
    reviewReport,
    issues,
  }
}

const bindingFields = [
  'packageId',
  'packageRevisionId',
  'payloadChecksum',
  'packageChecksum',
] as const

const validateAttestationSubject = (
  expected: KnowledgePackageReviewSubject,
  actual: KnowledgePackageReviewSubject,
  issues: HumanAiReviewAttestationIssue[],
): void => {
  for (const key of Object.keys(expected) as (keyof KnowledgePackageReviewSubject)[]) {
    if (expected[key] !== actual[key]) {
      addIssue(issues, 'HUMAN_ATTESTATION_STALE_REVISION', `Human attestation ${key} does not match the exact package revision`, key)
    }
  }
}

export const validateHumanAiReviewAttestation = (input: {
  candidate: ProductionKnowledgePackageCandidate
  intake: AiAssistedReviewIntake
  sourceEvidenceBytes: Uint8Array | string
  attestation: HumanAiReviewAttestation
}): HumanAiReviewAttestationReport => {
  const { candidate, intake, sourceEvidenceBytes, attestation } = input
  const issues: HumanAiReviewAttestationIssue[] = []
  const intakeReport = validateAiAssistedReviewIntake({ candidate, intake, sourceEvidenceBytes })
  const expectedSubject = knowledgePackageReviewSubject(candidate)
  const expectedEvidenceChecksum = intakeReport.reviewEvidenceChecksum

  if (!intakeReport.valid) {
    for (const issue of intakeReport.issues) {
      addIssue(issues, issue.code, issue.message, issue.reference)
    }
  }
  if (attestation.schemaVersion !== HUMAN_AI_TRIAGE_SCHEMA_VERSION) {
    addIssue(issues, 'HUMAN_ATTESTATION_SCHEMA_UNSUPPORTED', 'Human attestation schema version is unsupported')
  }
  if (!attestationIdPattern.test(attestation.attestationId)) {
    addIssue(issues, 'HUMAN_ATTESTATION_ID_INVALID', 'Human attestation requires a stable opaque identity')
  }
  if (attestation.reviewerProvenance !== 'HUMAN') {
    addIssue(issues, 'HUMAN_ATTESTATION_PROVENANCE_REQUIRED', 'Human attestation must be explicitly classified as HUMAN')
  }
  if (!nonEmpty(attestation.reviewer)) {
    addIssue(issues, 'HUMAN_ATTESTATION_REVIEWER_REQUIRED', 'Human attestation requires a qualified human reviewer identity')
  }
  if (!isValidTimestamp(attestation.startedAt) || !isValidTimestamp(attestation.reviewedAt)) {
    addIssue(issues, 'HUMAN_ATTESTATION_TIMESTAMPS_REQUIRED', 'Human attestation requires valid startedAt and reviewedAt timestamps')
  } else if (Date.parse(attestation.reviewedAt) < Date.parse(attestation.startedAt)) {
    addIssue(issues, 'HUMAN_ATTESTATION_TIMESTAMP_ORDER_INVALID', 'Human attestation reviewedAt cannot precede startedAt')
  }
  if (!attestation.finalOutcome || !humanAiReviewFinalOutcomes.includes(attestation.finalOutcome)) {
    addIssue(issues, 'HUMAN_ATTESTATION_OUTCOME_UNSUPPORTED', 'Human attestation final outcome is unsupported')
  }
  validateAttestationSubject(expectedSubject, attestation.subject, issues)
  if (attestation.aiReviewSessionId !== intake.session.reviewSessionId) {
    addIssue(issues, 'HUMAN_ATTESTATION_AI_SESSION_MISMATCH', 'Human attestation must identify the exact AI review session')
  }
  if (attestation.aiReviewEvidenceChecksum !== expectedEvidenceChecksum) {
    addIssue(issues, 'HUMAN_ATTESTATION_AI_EVIDENCE_MISMATCH', 'Human attestation must bind the immutable AI review evidence checksum')
  }

  const dimensions = new Set<KnowledgePackageReviewDimension>()
  for (const decision of attestation.dimensionDecisions) {
    if (!knowledgePackageReviewDimensions.includes(decision.dimension)) {
      addIssue(issues, 'HUMAN_ATTESTATION_DIMENSION_UNSUPPORTED', 'Human dimension decision is unsupported', String(decision.dimension))
    }
    if (dimensions.has(decision.dimension)) {
      addIssue(issues, 'HUMAN_ATTESTATION_DIMENSION_DUPLICATE', 'Human attestation may decide each dimension only once', decision.dimension)
    }
    dimensions.add(decision.dimension)
    if (!knowledgePackageReviewDecisionDispositions.includes(decision.disposition)) {
      addIssue(issues, 'HUMAN_ATTESTATION_DISPOSITION_UNSUPPORTED', 'Human dimension disposition is unsupported', decision.dimension)
    }
  }
  for (const dimension of knowledgePackageReviewDimensions) {
    if (!dimensions.has(dimension)) {
      addIssue(issues, 'HUMAN_ATTESTATION_DIMENSION_MISSING', 'Human attestation requires every mandatory review dimension', dimension)
    }
  }

  const findings = new Map(intake.session.findings.map((finding) => [finding.findingId, finding]))
  const decidedFindingIds = new Set<string>()
  let confirmedCount = 0
  let rejectedCount = 0
  let modifiedCount = 0
  let effectiveBlockingFindingCount = 0

  for (const triage of attestation.findingTriage) {
    const finding = findings.get(triage.findingId)
    if (!finding) {
      addIssue(issues, 'HUMAN_TRIAGE_FINDING_UNKNOWN', 'Human triage references an unknown AI finding', triage.findingId)
      continue
    }
    if (decidedFindingIds.has(triage.findingId)) {
      addIssue(issues, 'HUMAN_TRIAGE_FINDING_DUPLICATE', 'Each AI finding may be triaged only once', triage.findingId)
    }
    decidedFindingIds.add(triage.findingId)
    if (!humanAiTriageDecisions.includes(triage.decision)) {
      addIssue(issues, 'HUMAN_TRIAGE_DECISION_UNSUPPORTED', 'Human triage decision is unsupported', triage.findingId)
    }
    if (triage.reviewSessionId !== intake.session.reviewSessionId) {
      addIssue(issues, 'HUMAN_TRIAGE_SESSION_MISMATCH', 'Human triage must identify the exact AI review session', triage.findingId)
    }
    for (const field of bindingFields) {
      if (triage[field] !== expectedSubject[field]) {
        addIssue(issues, 'HUMAN_TRIAGE_REVISION_BINDING_MISMATCH', `Human triage ${field} does not match the exact package revision`, triage.findingId)
      }
    }
    if (triage.aiReviewEvidenceChecksum !== expectedEvidenceChecksum) {
      addIssue(issues, 'HUMAN_TRIAGE_AI_EVIDENCE_MISMATCH', 'Human triage must bind the immutable AI review evidence checksum', triage.findingId)
    }
    if (!nonEmpty(triage.rationale)) {
      addIssue(issues, 'HUMAN_TRIAGE_RATIONALE_REQUIRED', 'Human triage requires human-supplied rationale', triage.findingId)
    }
    if (triage.reviewerNote !== null && !triage.reviewerNote.trim()) {
      addIssue(issues, 'HUMAN_TRIAGE_NOTE_EMPTY', 'Human triage reviewer note must be null or non-empty', triage.findingId)
    }

    if (triage.decision === 'MODIFY') {
      modifiedCount += 1
      if (!nonEmpty(triage.modifiedRequiredAction)) {
        addIssue(issues, 'HUMAN_TRIAGE_MODIFIED_ACTION_REQUIRED', 'MODIFY requires a human replacement action', triage.findingId)
      }
      if (triage.severityAdjustment !== null && !knowledgePackageReviewFindingSeverities.includes(triage.severityAdjustment)) {
        addIssue(issues, 'HUMAN_TRIAGE_SEVERITY_UNSUPPORTED', 'MODIFY severity adjustment is unsupported', triage.findingId)
      }
      if ((triage.severityAdjustment ?? finding.severity) === 'BLOCKING') {
        effectiveBlockingFindingCount += 1
      }
    } else {
      if (triage.modifiedRequiredAction !== null || triage.severityAdjustment !== null) {
        addIssue(issues, 'HUMAN_TRIAGE_ORIGINAL_EDIT_FORBIDDEN', 'CONFIRM and REJECT cannot replace the immutable AI finding', triage.findingId)
      }
      if (triage.decision === 'CONFIRM') {
        confirmedCount += 1
        if (finding.severity === 'BLOCKING') effectiveBlockingFindingCount += 1
      } else {
        rejectedCount += 1
      }
    }
  }

  for (const findingId of findings.keys()) {
    if (!decidedFindingIds.has(findingId)) {
      addIssue(issues, 'HUMAN_TRIAGE_FINDING_MISSING', 'Every AI finding requires an explicit human triage decision', findingId)
    }
  }

  if (
    attestation.finalOutcome === 'ACCEPTED'
    && attestation.dimensionDecisions.some((decision) => decision.disposition === 'CHANGES_REQUIRED')
  ) {
    addIssue(issues, 'HUMAN_ACCEPTED_HAS_CHANGE_DECISION', 'Human ACCEPTED outcome cannot retain a CHANGES_REQUIRED dimension')
  }
  if (attestation.finalOutcome === 'ACCEPTED' && effectiveBlockingFindingCount > 0) {
    addIssue(issues, 'HUMAN_ACCEPTED_HAS_CONFIRMED_BLOCKING_FINDING', 'Human ACCEPTED outcome cannot retain a confirmed or modified blocking finding')
  }
  if (
    attestation.finalOutcome === 'CHANGES_REQUESTED'
    && confirmedCount + modifiedCount === 0
    && !attestation.dimensionDecisions.some((decision) => decision.disposition === 'CHANGES_REQUIRED')
  ) {
    addIssue(issues, 'HUMAN_CHANGES_REQUESTED_WITHOUT_REQUIREMENT', 'Human CHANGES_REQUESTED requires an explicit governed correction requirement')
  }

  const valid = issues.length === 0
  return {
    valid,
    reviewSessionId: attestation.attestationId,
    reviewStatus: attestation.finalOutcome ?? 'PENDING',
    reviewerProvenance: 'HUMAN',
    qualifiedHumanEvidence: valid,
    reviewedSubject: attestation.subject,
    eligibleForReviewedTransition: valid && attestation.finalOutcome === 'ACCEPTED',
    confirmedCount,
    rejectedCount,
    modifiedCount,
    effectiveBlockingFindingCount,
    issues,
  }
}

export const createHumanAiReviewAttestationTemplate = (input: {
  candidate: ProductionKnowledgePackageCandidate
  intake: AiAssistedReviewIntake
}): HumanAiReviewAttestationTemplate => {
  const subject = knowledgePackageReviewSubject(input.candidate)
  const evidenceChecksum = knowledgePackageReviewEvidenceChecksum(input.intake.session)
  return {
    schemaVersion: HUMAN_AI_TRIAGE_SCHEMA_VERSION,
    attestationId: '<human-attestation-id>',
    reviewerProvenance: 'HUMAN',
    reviewer: null,
    startedAt: null,
    reviewedAt: null,
    subject,
    aiReviewSessionId: input.intake.session.reviewSessionId,
    aiReviewEvidenceChecksum: evidenceChecksum,
    dimensionDecisions: knowledgePackageReviewDimensions.map((dimension) => ({
      dimension,
      disposition: null,
      reviewerNote: null,
    })),
    findingTriage: input.intake.session.findings.map((finding) => ({
      reviewSessionId: input.intake.session.reviewSessionId,
      findingId: finding.findingId,
      packageId: subject.packageId,
      packageRevisionId: subject.packageRevisionId,
      payloadChecksum: subject.payloadChecksum,
      packageChecksum: subject.packageChecksum,
      aiReviewEvidenceChecksum: evidenceChecksum,
      decision: null,
      reviewerNote: null,
      modifiedRequiredAction: null,
      severityAdjustment: null,
      rationale: null,
    })),
    finalOutcome: null,
  }
}

const markdownCell = (value: string | null): string =>
  (value ?? '—').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|')

export const createHumanAiReviewAttestationPacket = (input: {
  candidate: ProductionKnowledgePackageCandidate
  intake: AiAssistedReviewIntake
}): string => {
  const { intake } = input
  const subject = knowledgePackageReviewSubject(input.candidate)
  const evidenceChecksum = knowledgePackageReviewEvidenceChecksum(intake.session)
  const lines = [
    '# Physics 12 Motion — Human Attestation Packet for AI Review',
    '',
    '> **AI-assisted review is advisory evidence and does not satisfy the required qualified-human educational review.**',
    '',
    '> No human triage decision or final human outcome has occurred. All human decision fields below are intentionally blank.',
    '',
    '## Exact package revision',
    '',
    `- Package ID: \`${subject.packageId}\``,
    `- Revision ID: \`${subject.packageRevisionId}\``,
    `- Revision: \`${subject.packageRevision}\``,
    `- Payload SHA-256: \`${subject.payloadChecksum}\``,
    `- Package SHA-256: \`${subject.packageChecksum}\``,
    `- Structural scope: \`${subject.structuralScope}\``,
    `- Provisional Curriculum snapshot: \`${subject.curriculumSnapshotReference}\``,
    '',
    '## AI review evidence',
    '',
    `- Reviewer provenance: \`AI_ASSISTED\``,
    `- Review session ID: \`${intake.session.reviewSessionId}\``,
    `- AI outcome: \`${intake.session.reviewStatus}\``,
    `- Source evidence SHA-256: \`${intake.sourceEvidenceSha256}\``,
    `- Canonical review-evidence SHA-256: \`${evidenceChecksum}\``,
    `- Finding count: \`${intake.session.findings.length}\``,
    '',
    '## Mandatory review dimensions',
    '',
    '| Dimension | Label | AI disposition | AI note | Human disposition | Human note |',
    '| --- | --- | --- | --- | --- | --- |',
    ...knowledgePackageReviewDimensions.map((dimension) => {
      const decision = intake.session.dimensionDecisions.find((entry) => entry.dimension === dimension)
      return `| \`${dimension}\` | ${knowledgePackageReviewDimensionLabels[dimension]} | \`${decision?.disposition ?? 'MISSING'}\` | ${markdownCell(decision?.reviewerNote ?? null)} |  |  |`
    }),
    '',
    '## AI findings and blank human triage',
    '',
    '| Finding ID | Dimension | Severity | Target | AI note | AI required action | Human CONFIRM / REJECT / MODIFY | Human severity | Human replacement action | Human rationale |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...intake.session.findings.map((finding) =>
      `| \`${finding.findingId}\` | \`${finding.dimension}\` | \`${finding.severity}\` | \`${finding.targetKind}:${finding.targetKey}\` | ${markdownCell(finding.reviewerNote)} | ${markdownCell(finding.requiredAction)} |  |  |  |  |`),
    '',
    '## Blank human final outcome',
    '',
    '- Qualified human reviewer: ____________________',
    '- Started at: ____________________',
    '- Reviewed at: ____________________',
    '- Final outcome (`ACCEPTED` or `CHANGES_REQUESTED`): ____________________',
    '- Human attestation ID: ____________________',
    '',
    'A rejected AI finding remains immutable historical evidence but does not block the human outcome. A confirmed blocking finding prevents `ACCEPTED`. A modified finding preserves the AI original while the human replacement severity, action, and rationale become the governed correction requirement.',
    '',
    '> This packet does not create Revision 2, change package lifecycle, verify Content Items, authorize persistence, or publish Curriculum.',
    '',
  ]
  return lines.join('\n')
}
