import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { physics12MotionKnowledgeExpansionManifest } from '../src/curriculum/data/knowledge-expansion-packages.js'
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
import { theoreticalCurriculumCatalog } from '../src/curriculum/data/theoretical-curriculum.js'
import {
  createCorrectedKnowledgePackageRevision,
  createKnowledgePackageReviewInputTemplate,
  createKnowledgePackageReviewPacket,
  knowledgePackageReviewDimensions,
  knowledgePackageReviewSubject,
  validateKnowledgePackageReviewHistory,
  validateKnowledgePackageReviewSession,
  type KnowledgePackageReviewDimensionDecision,
  type KnowledgePackageReviewFinding,
  type KnowledgePackageReviewSession,
} from '../src/curriculum/knowledge-package-review.js'
import {
  createProductionKnowledgeReadinessReport,
  isKnowledgePackageTransitionAllowed,
  validateProductionKnowledgePackageCandidate,
  type ProductionKnowledgePackageCandidate,
} from '../src/curriculum/knowledge-expansion-package.js'

const candidate = physics12MotionProductionPackageCandidate
const sessionId = 'review-session-380d904d-4d90-4707-a586-84dd2ac99764'
const reviewer = 'physics-reviewer-fixture'
const startedAt = '2026-09-20T08:00:00.000Z'
const reviewedAt = '2026-09-20T10:00:00.000Z'

const decisions = (
  disposition: KnowledgePackageReviewDimensionDecision['disposition'] = 'ACCEPTED_AS_IS',
): readonly KnowledgePackageReviewDimensionDecision[] => knowledgePackageReviewDimensions.map((dimension) => ({
  dimension,
  disposition,
  reviewerNote: null,
}))

const finding = (overrides: Partial<KnowledgePackageReviewFinding> = {}): KnowledgePackageReviewFinding => ({
  findingId: 'review-finding-e4d018cb-a048-44f1-9f46-612ea8f10d57',
  reviewSessionId: sessionId,
  dimension: 'TERMINOLOGY',
  severity: 'BLOCKING',
  status: 'OPEN',
  targetKind: 'PACKAGE',
  targetKey: candidate.package.packageId,
  reviewerNote: 'Synthetic review fixture finding.',
  requiredAction: 'Synthetic authoring action required by fixture.',
  createdBy: reviewer,
  createdAt: '2026-09-20T09:00:00.000Z',
  ...overrides,
})

const session = (overrides: Partial<KnowledgePackageReviewSession> = {}): KnowledgePackageReviewSession => ({
  schemaVersion: 'konkourix-knowledge-package-review/v1',
  reviewSessionId: sessionId,
  subject: knowledgePackageReviewSubject(candidate),
  reviewStatus: 'PENDING',
  reviewer: null,
  startedAt: null,
  reviewedAt: null,
  dimensionDecisions: [],
  findings: [],
  ...overrides,
})

const acceptedSession = (): KnowledgePackageReviewSession => session({
  reviewStatus: 'ACCEPTED',
  reviewer,
  startedAt,
  reviewedAt,
  dimensionDecisions: decisions(),
})

const validate = (
  reviewSession: KnowledgePackageReviewSession,
  target: ProductionKnowledgePackageCandidate = candidate,
) => validateKnowledgePackageReviewSession({ candidate: target, session: reviewSession })

const codes = (reviewSession: KnowledgePackageReviewSession, target = candidate): Set<string> =>
  new Set(validate(reviewSession, target).issues.map((issue) => issue.code))

const correctedRevision = (): ProductionKnowledgePackageCandidate => {
  const first = candidate.contentItems[0]!
  const changesRequested = session({
    reviewStatus: 'CHANGES_REQUESTED',
    reviewer,
    startedAt,
    reviewedAt,
    dimensionDecisions: [{ ...decisions()[0]!, disposition: 'CHANGES_REQUIRED' }],
    findings: [finding()],
  })
  const result = createCorrectedKnowledgePackageRevision({
    currentRevision: candidate,
    changesRequestedReview: changesRequested,
    packageRevisionId: 'pkg-rev-a39ac2ea-91da-4ae8-b80e-337c418f7ac2',
    taxonomyNodes: candidate.taxonomyNodes,
    contentItems: [{ ...first, title: 'Synthetic corrected fixture title' }, ...candidate.contentItems.slice(1)],
    mappings: candidate.mappings,
  })
  assert.equal(result.created, true, JSON.stringify(result.issues))
  assert.ok(result.revision)
  return result.revision
}

test('valid PENDING review state contains no human review evidence', () => {
  const report = validate(session())
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.eligibleForReviewedTransition, false)
})

test('valid IN_REVIEW state identifies its human reviewer without completion evidence', () => {
  const report = validate(session({
    reviewStatus: 'IN_REVIEW',
    reviewer,
    startedAt,
    dimensionDecisions: [decisions()[0]!],
  }))
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.eligibleForReviewedTransition, false)
})

test('valid CHANGES_REQUESTED state retains an actionable human finding', () => {
  const report = validate(session({
    reviewStatus: 'CHANGES_REQUESTED',
    reviewer,
    startedAt,
    reviewedAt,
    dimensionDecisions: [{ ...decisions()[0]!, disposition: 'CHANGES_REQUIRED' }],
    findings: [finding()],
  }))
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.eligibleForReviewedTransition, false)
})

test('valid ACCEPTED synthetic review is complete and eligible only for later REVIEWED transition', () => {
  const report = validate(acceptedSession())
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.dimensionDecisionCount, 12)
  assert.equal(report.eligibleForReviewedTransition, true)
  assert.equal(candidate.package.status, 'DRAFT')
})

test('review subject binds the exact candidate identity, checksums, scope, and snapshot', () => {
  assert.deepEqual(knowledgePackageReviewSubject(candidate), {
    packageId: 'pkg-bf55e8f2-2699-4ee2-8ccb-54420216069e',
    packageRevisionId: 'pkg-rev-0e3a9555-3268-4c1a-a283-b04b22f93f09',
    packageRevision: 1,
    payloadChecksum: 'ce20fc14fa67af9b2eedc5fbd23ccb9b5aa2d496b94f5670c7342c42b8db337a',
    packageChecksum: '30d145724f684eb8d7b8e850e66bad87c5d04a613c9c4fd6924d7ea963e54341',
    subject: 'mathematics.g12.physics3',
    structuralScope: 'mathematics.g12.physics3.chapter.4278',
    curriculumSnapshotReference: 'konkourix-theoretical-structural-freeze-candidate-v1',
  })
})

test('findings resolve only to real taxonomy, Content, and mapping keys', () => {
  const findings = [
    finding({ targetKind: 'TAXONOMY_NODE', targetKey: candidate.taxonomyNodes[0]!.taxonomyKey }),
    finding({
      findingId: 'review-finding-59e988fa-8496-4c1c-bce0-8163476a4940',
      targetKind: 'CONTENT_ITEM',
      targetKey: candidate.contentItems[0]!.contentKey,
    }),
    finding({
      findingId: 'review-finding-6e1abdf7-fc61-4b13-a906-13a9bbce4f95',
      targetKind: 'MAPPING',
      targetKey: candidate.mappings[0]!.mappingKey,
    }),
  ]
  const report = validate(session({ reviewStatus: 'IN_REVIEW', reviewer, startedAt, findings }))
  assert.equal(report.valid, true, JSON.stringify(report.issues))
})

test('accepted review requires all controlled mandatory dimensions exactly once', () => {
  const report = validate(acceptedSession())
  assert.equal(report.valid, true)
  assert.deepEqual(
    new Set(acceptedSession().dimensionDecisions.map((decision) => decision.dimension)),
    new Set(knowledgePackageReviewDimensions),
  )
})

test('synthetic Revision 2 correction retains identity and resets review state', () => {
  const revision2 = correctedRevision()
  const report = validateProductionKnowledgePackageCandidate({
    structuralRecords: theoreticalCurriculumCatalog,
    expectedStructuralCatalogSha256: theoreticalCurriculumFreezeManifest.catalogSha256,
    sourcePilotManifest: physics12MotionKnowledgeExpansionManifest,
    candidate: revision2,
    supersededCandidate: candidate,
  })

  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(revision2.package.packageId, candidate.package.packageId)
  assert.equal(revision2.package.packageRevision, 2)
  assert.notEqual(revision2.package.packageRevisionId, candidate.package.packageRevisionId)
  assert.equal(revision2.package.supersedesRevisionId, candidate.package.packageRevisionId)
  assert.notEqual(revision2.payloadChecksum, candidate.payloadChecksum)
  assert.notEqual(revision2.packageChecksum, candidate.packageChecksum)
  assert.equal(revision2.package.status, 'DRAFT')
  assert.deepEqual(revision2.package.review, { reviewer: null, reviewedAt: null, reviewStatus: 'PENDING' })
})

test('new revision creation rejects review evidence without CHANGES_REQUESTED outcome', () => {
  const result = createCorrectedKnowledgePackageRevision({
    currentRevision: candidate,
    changesRequestedReview: acceptedSession(),
    packageRevisionId: 'pkg-rev-a39ac2ea-91da-4ae8-b80e-337c418f7ac2',
    taxonomyNodes: candidate.taxonomyNodes,
    contentItems: candidate.contentItems,
    mappings: candidate.mappings,
  })
  assert.equal(result.created, false)
  assert.equal(result.revision, null)
  assert.ok(result.issues.some((issue) => issue.code === 'CHANGES_REQUESTED_REVIEW_REQUIRED'))
})

test('historical Revision 1 review remains valid evidence after synthetic Revision 2 exists', () => {
  const revision2 = correctedRevision()
  const historicalReview = acceptedSession()
  const history = validateKnowledgePackageReviewHistory({
    revisions: [candidate, revision2],
    sessions: [historicalReview],
  })

  assert.equal(history.valid, true, JSON.stringify(history.issues))
  assert.equal(history.sessionCount, 1)
  assert.equal(history.sessionReports[0]!.eligibleForReviewedTransition, true)
  assert.deepEqual(historicalReview.subject, knowledgePackageReviewSubject(candidate))
})

test('accepted review still leaves persistence blocked and package lifecycle DRAFT', () => {
  const review = validate(acceptedSession())
  const readiness = createProductionKnowledgeReadinessReport(physics12MotionProductionPackageValidation, review)
  assert.deepEqual(readiness.readiness, {
    machineStructure: 'PASS',
    educationalReview: 'ACCEPTED',
    packageLifecycle: 'DRAFT',
    persistence: 'BLOCKED_PENDING_CURRICULUM_VERSION_REBIND',
    publication: 'NOT_AUTHORIZED',
  })
})

test('ACCEPTED without reviewer or reviewedAt is rejected', () => {
  assert.ok(codes({ ...acceptedSession(), reviewer: null }).has('COMPLETED_REVIEWER_REQUIRED'))
  assert.ok(codes({ ...acceptedSession(), reviewedAt: null }).has('COMPLETED_REVIEWED_AT_REQUIRED'))
})

test('ACCEPTED with a missing mandatory dimension or blocking finding is rejected', () => {
  const missingDimension = { ...acceptedSession(), dimensionDecisions: decisions().slice(1) }
  const blocking = { ...acceptedSession(), findings: [finding()] }
  assert.ok(codes(missingDimension).has('MANDATORY_REVIEW_DIMENSION_MISSING'))
  assert.ok(codes(blocking).has('ACCEPTED_REVIEW_HAS_BLOCKING_FINDING'))
})

test('stale payload and package checksums are rejected', () => {
  const stalePayload = session({
    subject: { ...knowledgePackageReviewSubject(candidate), payloadChecksum: '0'.repeat(64) },
  })
  const stalePackage = session({
    subject: { ...knowledgePackageReviewSubject(candidate), packageChecksum: '1'.repeat(64) },
  })
  assert.ok(codes(stalePayload).has('STALE_PAYLOAD_CHECKSUM'))
  assert.ok(codes(stalePackage).has('STALE_PACKAGE_CHECKSUM'))
})

test('wrong package and revision identity are rejected', () => {
  const wrongPackage = session({
    subject: { ...knowledgePackageReviewSubject(candidate), packageId: 'pkg-wrong' },
  })
  const wrongRevision = session({
    subject: { ...knowledgePackageReviewSubject(candidate), packageRevisionId: 'pkg-rev-wrong' },
  })
  assert.ok(codes(wrongPackage).has('STALE_PACKAGE_ID'))
  assert.ok(codes(wrongRevision).has('STALE_PACKAGE_REVISION_ID'))
})

test('findings targeting nonexistent package entities are rejected', () => {
  const targetCases: readonly [KnowledgePackageReviewFinding['targetKind'], string][] = [
    ['TAXONOMY_NODE', 'FINDING_TAXONOMY_TARGET_NOT_FOUND'],
    ['CONTENT_ITEM', 'FINDING_CONTENT_TARGET_NOT_FOUND'],
    ['MAPPING', 'FINDING_MAPPING_TARGET_NOT_FOUND'],
  ]
  for (const [targetKind, expectedCode] of targetCases) {
    const review = session({
      reviewStatus: 'IN_REVIEW',
      reviewer,
      startedAt,
      findings: [finding({ targetKind, targetKey: 'missing-key' })],
    })
    assert.ok(codes(review).has(expectedCode))
  }
})

test('duplicate dimension decision and reviewer metadata on PENDING are rejected', () => {
  const duplicate = session({
    reviewStatus: 'IN_REVIEW',
    reviewer,
    startedAt,
    dimensionDecisions: [decisions()[0]!, decisions()[0]!],
  })
  const invalidPending = session({ reviewer, startedAt })
  assert.ok(codes(duplicate).has('DUPLICATE_REVIEW_DIMENSION_DECISION'))
  assert.ok(codes(invalidPending).has('PENDING_REVIEW_HAS_METADATA'))
})

test('Revision 1 review cannot be applied to synthetic Revision 2', () => {
  const revision2 = correctedRevision()
  const report = validate(acceptedSession(), revision2)
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((issue) => issue.code === 'STALE_PACKAGE_REVISION_ID'))
  assert.ok(report.issues.some((issue) => issue.code === 'STALE_PACKAGE_REVISION_NUMBER'))
  assert.ok(report.issues.some((issue) => issue.code === 'STALE_PAYLOAD_CHECKSUM'))
  assert.ok(report.issues.some((issue) => issue.code === 'STALE_PACKAGE_CHECKSUM'))

  const revision2Validation = validateProductionKnowledgePackageCandidate({
    structuralRecords: theoreticalCurriculumCatalog,
    expectedStructuralCatalogSha256: theoreticalCurriculumFreezeManifest.catalogSha256,
    sourcePilotManifest: physics12MotionKnowledgeExpansionManifest,
    candidate: revision2,
    supersededCandidate: candidate,
  })
  const revision1Review = validate(acceptedSession(), candidate)
  assert.equal(
    createProductionKnowledgeReadinessReport(revision2Validation, revision1Review).readiness.educationalReview,
    'PENDING',
  )
})

test('review workflow cannot directly approve a DRAFT package or verify Content', () => {
  const review = validate(acceptedSession())
  assert.equal(review.valid, true)
  assert.equal(isKnowledgePackageTransitionAllowed('DRAFT', 'APPROVED'), false)
  assert.ok(candidate.contentItems.every((item) => item.provenance?.verificationStatus === 'UNVERIFIED'))
  assert.strictEqual(candidate.contentItems, physics12MotionContentItems)
})

test('review input template is blank and packet output is deterministic checked-in evidence', async () => {
  const template = createKnowledgePackageReviewInputTemplate(candidate)
  assert.equal(template.reviewer, null)
  assert.equal(template.reviewedAt, null)
  assert.deepEqual(template.dimensionDecisions, [])
  assert.deepEqual(template.findings, [])

  const checkedInTemplate = JSON.parse(await readFile(
    new URL('../../../docs/curriculum/PHYSICS12_MOTION_REVIEW_INPUT.template.json', import.meta.url),
    'utf8',
  )) as unknown
  assert.deepEqual(checkedInTemplate, template)

  const first = createKnowledgePackageReviewPacket(candidate)
  const second = createKnowledgePackageReviewPacket(candidate)
  assert.equal(first, second)
  const checkedIn = await readFile(
    new URL('../../../docs/curriculum/PHYSICS12_MOTION_REVIEW_PACKET.md', import.meta.url),
    'utf8',
  )
  assert.equal(checkedIn.replace(/\r\n/g, '\n'), first)
})

test('real packages and structural data remain unchanged', () => {
  assert.equal(candidate.package.packageRevision, 1)
  assert.equal(candidate.package.status, 'DRAFT')
  assert.deepEqual(candidate.package.review, { reviewer: null, reviewedAt: null, reviewStatus: 'PENDING' })
  assert.equal(candidate.persistence.databaseCurriculumVersionId, null)
  assert.strictEqual(candidate.taxonomyNodes, physics12MotionTaxonomyNodes)
  assert.strictEqual(candidate.contentItems, physics12MotionContentItems)
  assert.strictEqual(candidate.mappings, physics12MotionContentMappings)
  assert.equal(ARABIC10_LESSON1_PILOT.subjectId, 'shared.g10.arabic')
  assert.equal(arabic10Lesson1TaxonomyNodes.length, 27)
  assert.equal(arabic10Lesson1ContentItems.length, 12)
  assert.equal(arabic10Lesson1ContentMappings.length, 12)
  assert.equal(theoreticalCurriculumFreezeManifest.catalogSha256, 'ef04a21c556dbc716137d8291c44e933f73fc8fd3c538dc3dfd59a1f560164be')
})
