import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  physics12MotionProductionPackageCandidate,
  physics12MotionProductionPackageValidation,
} from '../src/curriculum/data/production-physics12-motion-package.js'
import {
  ARABIC10_LESSON1_PILOT,
  arabic10Lesson1ContentItems,
  arabic10Lesson1ContentMappings,
  arabic10Lesson1TaxonomyNodes,
} from '../src/curriculum/data/pilot-arabic10-lesson1.js'
import {
  physics12MotionContentItems,
  physics12MotionContentMappings,
  physics12MotionTaxonomyNodes,
} from '../src/curriculum/data/pilot-physics12-motion.js'
import { theoreticalCurriculumFreezeManifest } from '../src/curriculum/data/theoretical-curriculum-freeze.js'
import {
  createHumanAiReviewAttestationPacket,
  createHumanAiReviewAttestationTemplate,
  knowledgePackageReviewEvidenceChecksum,
  validateAiAssistedReviewIntake,
  validateHumanAiReviewAttestation,
  type AiAssistedReviewIntake,
  type HumanAiFindingTriage,
  type HumanAiReviewAttestation,
} from '../src/curriculum/knowledge-package-ai-review.js'
import {
  knowledgePackageReviewDimensions,
  knowledgePackageReviewSubject,
  createCorrectedKnowledgePackageRevision,
  type KnowledgePackageReviewDimensionDecision,
  type KnowledgePackageReviewSession,
} from '../src/curriculum/knowledge-package-review.js'
import {
  buildNextProductionKnowledgePackageRevision,
  createProductionKnowledgeReadinessReport,
} from '../src/curriculum/knowledge-expansion-package.js'

const candidate = physics12MotionProductionPackageCandidate
const evidenceUrl = new URL('../../../docs/curriculum/PHYSICS12_MOTION_REVIEW_INPUT.completed.json', import.meta.url)
const metadataUrl = new URL('../../../docs/curriculum/PHYSICS12_MOTION_AI_REVIEW_INTAKE.json', import.meta.url)
const evidenceBytes = await readFile(evidenceUrl)
const suppliedSession = JSON.parse(evidenceBytes.toString('utf8')) as KnowledgePackageReviewSession
const metadata = JSON.parse(await readFile(metadataUrl, 'utf8')) as Omit<AiAssistedReviewIntake, 'session'>
const intake: AiAssistedReviewIntake = { ...metadata, session: suppliedSession }
const evidenceChecksum = knowledgePackageReviewEvidenceChecksum(suppliedSession)
const evidenceSha256 = createHash('sha256').update(evidenceBytes).digest('hex')

const dimensionDecisions = (
  disposition: KnowledgePackageReviewDimensionDecision['disposition'] = 'ACCEPTED_AS_IS',
): readonly KnowledgePackageReviewDimensionDecision[] => knowledgePackageReviewDimensions.map((dimension) => ({
  dimension,
  disposition,
  reviewerNote: null,
}))

const triage = (
  findingId: string,
  overrides: Partial<HumanAiFindingTriage> = {},
): HumanAiFindingTriage => ({
  reviewSessionId: suppliedSession.reviewSessionId,
  findingId,
  packageId: candidate.package.packageId,
  packageRevisionId: candidate.package.packageRevisionId,
  payloadChecksum: candidate.payloadChecksum,
  packageChecksum: candidate.packageChecksum,
  aiReviewEvidenceChecksum: evidenceChecksum,
  decision: 'REJECT',
  reviewerNote: null,
  modifiedRequiredAction: null,
  severityAdjustment: null,
  rationale: 'Synthetic qualified-human fixture rationale.',
  ...overrides,
})

const attestation = (
  overrides: Partial<HumanAiReviewAttestation> = {},
): HumanAiReviewAttestation => ({
  schemaVersion: 'konkourix-knowledge-package-ai-triage/v1',
  attestationId: 'human-attestation-2d4e47ea-fb1d-4518-978b-f1639718a3ba',
  reviewerProvenance: 'HUMAN',
  reviewer: 'qualified-human-reviewer-fixture',
  startedAt: '2026-09-21T10:00:00.000Z',
  reviewedAt: '2026-09-21T11:00:00.000Z',
  subject: knowledgePackageReviewSubject(candidate),
  aiReviewSessionId: suppliedSession.reviewSessionId,
  aiReviewEvidenceChecksum: evidenceChecksum,
  dimensionDecisions: dimensionDecisions(),
  findingTriage: suppliedSession.findings.map((finding) => triage(finding.findingId)),
  finalOutcome: 'ACCEPTED',
  ...overrides,
})

const validate = (
  value: HumanAiReviewAttestation,
  target = candidate,
  targetIntake = intake,
) => validateHumanAiReviewAttestation({
  candidate: target,
  intake: targetIntake,
  sourceEvidenceBytes: evidenceBytes,
  attestation: value,
})

const issueCodes = (value: HumanAiReviewAttestation, target = candidate): Set<string> =>
  new Set(validate(value, target).issues.map((issue) => issue.code))

test('supplied AI-assisted CHANGES_REQUESTED review is valid advisory evidence', () => {
  const report = validateAiAssistedReviewIntake({ candidate, intake, sourceEvidenceBytes: evidenceBytes })
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.reviewOutcome, 'CHANGES_REQUESTED')
  assert.equal(report.findingCount, 9)
  assert.equal(report.advisoryOnly, true)
  assert.equal(report.satisfiesQualifiedHumanReviewGate, false)
  assert.equal(report.reviewReport.qualifiedHumanEvidence, false)
})

test('all nine AI findings remain bound to exact Revision 1 identities and checksums', () => {
  assert.equal(suppliedSession.findings.length, 9)
  assert.deepEqual(suppliedSession.subject, knowledgePackageReviewSubject(candidate))
  assert.ok(suppliedSession.findings.every((finding) =>
    finding.reviewSessionId === suppliedSession.reviewSessionId
    && (
      candidate.taxonomyNodes.some((node) => node.taxonomyKey === finding.targetKey)
      || candidate.contentItems.some((item) => item.contentKey === finding.targetKey)
    )))
})

test('synthetic qualified human can CONFIRM an AI finding', () => {
  const first = suppliedSession.findings[0]!
  const value = attestation({
    dimensionDecisions: [{ ...dimensionDecisions()[0]!, disposition: 'CHANGES_REQUIRED' }, ...dimensionDecisions().slice(1)],
    findingTriage: suppliedSession.findings.map((finding) => finding === first
      ? triage(finding.findingId, { decision: 'CONFIRM' })
      : triage(finding.findingId)),
    finalOutcome: 'CHANGES_REQUESTED',
  })
  const report = validate(value)
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.confirmedCount, 1)
  assert.equal(report.effectiveBlockingFindingCount, 1)
})

test('synthetic qualified human can REJECT AI findings and accept only through human evidence', () => {
  const report = validate(attestation())
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.rejectedCount, 9)
  assert.equal(report.eligibleForReviewedTransition, true)
})

test('synthetic qualified human can MODIFY an AI finding without changing the original', () => {
  const first = suppliedSession.findings[0]!
  const value = attestation({
    dimensionDecisions: [{ ...dimensionDecisions()[0]!, disposition: 'CHANGES_REQUIRED' }, ...dimensionDecisions().slice(1)],
    findingTriage: suppliedSession.findings.map((finding) => finding === first
      ? triage(finding.findingId, {
          decision: 'MODIFY',
          modifiedRequiredAction: 'Synthetic replacement action supplied only by the human fixture.',
          severityAdjustment: 'ADVISORY',
        })
      : triage(finding.findingId)),
    finalOutcome: 'CHANGES_REQUESTED',
  })
  const report = validate(value)
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.modifiedCount, 1)
  assert.equal(first.requiredAction, suppliedSession.findings[0]!.requiredAction)
})

test('mixed human triage produces deterministic qualified-human readiness', () => {
  const advisory = suppliedSession.findings.find((finding) => finding.severity === 'ADVISORY')!
  const value = attestation({
    dimensionDecisions: [{ ...dimensionDecisions()[0]!, disposition: 'CHANGES_REQUIRED' }, ...dimensionDecisions().slice(1)],
    findingTriage: suppliedSession.findings.map((finding) => finding === advisory
      ? triage(finding.findingId, { decision: 'CONFIRM' })
      : triage(finding.findingId)),
    finalOutcome: 'CHANGES_REQUESTED',
  })
  const first = validate(value)
  const second = validate(value)
  assert.deepEqual(first, second)
  assert.equal(first.valid, true, JSON.stringify(first.issues))
  assert.equal(createProductionKnowledgeReadinessReport(
    physics12MotionProductionPackageValidation,
    first,
  ).readiness.educationalReview, 'CHANGES_REQUESTED')
})

test('AI-assisted ACCEPTED evidence cannot satisfy the qualified-human gate', () => {
  const acceptedAiSession: KnowledgePackageReviewSession = {
    ...suppliedSession,
    reviewStatus: 'ACCEPTED',
    dimensionDecisions: dimensionDecisions(),
    findings: [],
  }
  const acceptedBytes = Buffer.from(`${JSON.stringify(acceptedAiSession)}\n`, 'utf8')
  const acceptedIntake: AiAssistedReviewIntake = {
    ...intake,
    sourceEvidenceSha256: createHash('sha256').update(acceptedBytes).digest('hex'),
    session: acceptedAiSession,
  }
  const report = validateAiAssistedReviewIntake({
    candidate,
    intake: acceptedIntake,
    sourceEvidenceBytes: acceptedBytes,
  })
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.reviewReport.eligibleForReviewedTransition, false)
  assert.equal(createProductionKnowledgeReadinessReport(
    physics12MotionProductionPackageValidation,
    report.reviewReport,
  ).readiness.educationalReview, 'PENDING')
})

test('AI-assisted CHANGES_REQUESTED evidence cannot authorize Revision 2', () => {
  const result = createCorrectedKnowledgePackageRevision({
    currentRevision: candidate,
    changesRequestedReview: { reviewerProvenance: 'AI_ASSISTED', session: suppliedSession },
    packageRevisionId: 'pkg-rev-5a50679e-fc67-4777-a1fa-2c03b99f54ee',
    taxonomyNodes: candidate.taxonomyNodes,
    contentItems: candidate.contentItems,
    mappings: candidate.mappings,
  })
  assert.equal(result.created, false)
  assert.equal(result.revision, null)
  assert.ok(result.issues.some((issue) => issue.code === 'QUALIFIED_HUMAN_CHANGES_REQUEST_REQUIRED'))
})

test('human attestation rejects missing human reviewer', () => {
  assert.ok(issueCodes({ ...attestation(), reviewer: null }).has('HUMAN_ATTESTATION_REVIEWER_REQUIRED'))
})

test('human triage rejects stale revision and wrong checksum binding', () => {
  const stale = {
    ...attestation(),
    subject: { ...knowledgePackageReviewSubject(candidate), packageRevision: 2 },
  }
  assert.ok(issueCodes(stale).has('HUMAN_ATTESTATION_STALE_REVISION'))

  const wrongChecksum = attestation({
    findingTriage: [
      { ...triage(suppliedSession.findings[0]!.findingId), packageChecksum: '0'.repeat(64) },
      ...suppliedSession.findings.slice(1).map((finding) => triage(finding.findingId)),
    ],
  })
  assert.ok(issueCodes(wrongChecksum).has('HUMAN_TRIAGE_REVISION_BINDING_MISMATCH'))
})

test('human triage rejects unknown AI finding', () => {
  const unknown = attestation({
    findingTriage: [
      { ...triage(suppliedSession.findings[0]!.findingId), findingId: 'review-finding-00000000-0000-4000-8000-000000000000' },
      ...suppliedSession.findings.slice(1).map((finding) => triage(finding.findingId)),
    ],
  })
  assert.ok(issueCodes(unknown).has('HUMAN_TRIAGE_FINDING_UNKNOWN'))
})

test('human ACCEPTED rejects a confirmed blocking AI finding', () => {
  const blocking = suppliedSession.findings.find((finding) => finding.severity === 'BLOCKING')!
  const value = attestation({
    findingTriage: suppliedSession.findings.map((finding) => finding === blocking
      ? triage(finding.findingId, { decision: 'CONFIRM' })
      : triage(finding.findingId)),
  })
  assert.ok(issueCodes(value).has('HUMAN_ACCEPTED_HAS_CONFIRMED_BLOCKING_FINDING'))
})

test('triage cannot silently edit immutable original AI evidence', () => {
  const editedSession: KnowledgePackageReviewSession = {
    ...suppliedSession,
    findings: [
      { ...suppliedSession.findings[0]!, requiredAction: 'Silently edited action.' },
      ...suppliedSession.findings.slice(1),
    ],
  }
  const editedIntake: AiAssistedReviewIntake = { ...intake, session: editedSession }
  const report = validateAiAssistedReviewIntake({ candidate, intake: editedIntake, sourceEvidenceBytes: evidenceBytes })
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((issue) => issue.code === 'AI_REVIEW_EVIDENCE_CONTENT_MISMATCH'))
})

test('Revision 1 human triage cannot apply to synthetic Revision 2', () => {
  const revision2 = buildNextProductionKnowledgePackageRevision({
    currentRevision: candidate,
    packageRevisionId: 'pkg-rev-5a50679e-fc67-4777-a1fa-2c03b99f54ee',
    taxonomyNodes: candidate.taxonomyNodes,
    contentItems: [{ ...candidate.contentItems[0]!, title: 'Synthetic fixture correction' }, ...candidate.contentItems.slice(1)],
    mappings: candidate.mappings,
  })
  const report = validate(attestation(), revision2)
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((issue) => issue.code === 'HUMAN_ATTESTATION_STALE_REVISION'))
})

test('AI evidence bytes and objects remain immutable through validation and packet generation', () => {
  const before = evidenceBytes.toString('utf8')
  const objectBefore = structuredClone(suppliedSession)
  validateAiAssistedReviewIntake({ candidate, intake, sourceEvidenceBytes: evidenceBytes })
  createHumanAiReviewAttestationPacket({ candidate, intake })
  createHumanAiReviewAttestationTemplate({ candidate, intake })
  assert.equal(evidenceBytes.toString('utf8'), before)
  assert.deepEqual(suppliedSession, objectBefore)
  assert.equal(evidenceSha256, '97ddcafefa3fd8f80be4e0cb693a7912b95895433140d586584f15de77b57390')
})

test('checked-in human attestation packet and blank input are deterministic', async () => {
  const packet = createHumanAiReviewAttestationPacket({ candidate, intake })
  const checkedInPacket = await readFile(
    new URL('../../../docs/curriculum/PHYSICS12_MOTION_AI_REVIEW_ATTESTATION_PACKET.md', import.meta.url),
    'utf8',
  )
  assert.equal(checkedInPacket.replace(/\r\n/g, '\n'), packet)

  const template = createHumanAiReviewAttestationTemplate({ candidate, intake })
  const checkedInTemplate = JSON.parse(await readFile(
    new URL('../../../docs/curriculum/PHYSICS12_MOTION_AI_REVIEW_ATTESTATION.template.json', import.meta.url),
    'utf8',
  )) as unknown
  assert.deepEqual(checkedInTemplate, template)
  assert.equal(template.reviewer, null)
  assert.equal(template.finalOutcome, null)
  assert.ok(template.findingTriage.every((entry) => entry.decision === null))
})

test('real Physics, Arabic, and structural state remain unchanged', () => {
  assert.equal(candidate.package.packageRevision, 1)
  assert.equal(candidate.package.status, 'DRAFT')
  assert.deepEqual(candidate.package.review, { reviewer: null, reviewedAt: null, reviewStatus: 'PENDING' })
  assert.equal(candidate.persistence.databaseCurriculumVersionId, null)
  assert.strictEqual(candidate.taxonomyNodes, physics12MotionTaxonomyNodes)
  assert.strictEqual(candidate.contentItems, physics12MotionContentItems)
  assert.strictEqual(candidate.mappings, physics12MotionContentMappings)
  assert.ok(candidate.contentItems.every((item) => item.provenance?.verificationStatus === 'UNVERIFIED'))
  assert.equal(ARABIC10_LESSON1_PILOT.subjectId, 'shared.g10.arabic')
  assert.equal(arabic10Lesson1TaxonomyNodes.length, 27)
  assert.equal(arabic10Lesson1ContentItems.length, 12)
  assert.equal(arabic10Lesson1ContentMappings.length, 12)
  assert.equal(theoreticalCurriculumFreezeManifest.catalogSha256, 'ef04a21c556dbc716137d8291c44e933f73fc8fd3c538dc3dfd59a1f560164be')
})
