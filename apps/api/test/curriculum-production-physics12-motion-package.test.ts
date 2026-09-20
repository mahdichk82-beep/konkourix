import assert from 'node:assert/strict'
import test from 'node:test'
import { physics12MotionKnowledgeExpansionManifest } from '../src/curriculum/data/knowledge-expansion-packages.js'
import {
  physics12MotionProductionPackageCandidate,
  physics12MotionProductionPackageValidation,
  physics12MotionProductionReadinessReport,
} from '../src/curriculum/data/production-physics12-motion-package.js'
import {
  PHYSICS12_MOTION_PILOT,
  physics12MotionContentItems,
  physics12MotionContentMappings,
  physics12MotionTaxonomyNodes,
} from '../src/curriculum/data/pilot-physics12-motion.js'
import {
  ARABIC10_LESSON1_PILOT,
  arabic10Lesson1ContentItems,
  arabic10Lesson1ContentMappings,
  arabic10Lesson1TaxonomyNodes,
} from '../src/curriculum/data/pilot-arabic10-lesson1.js'
import { theoreticalCurriculumFreezeManifest } from '../src/curriculum/data/theoretical-curriculum-freeze.js'
import { theoreticalCurriculumCatalog } from '../src/curriculum/data/theoretical-curriculum.js'
import {
  buildProductionKnowledgePackageCandidate,
  createProductionKnowledgeReadinessReport,
  validateProductionKnowledgePackageCandidate,
  validateProductionKnowledgePackageCandidateSet,
  type ProductionKnowledgePackageCandidate,
} from '../src/curriculum/knowledge-expansion-package.js'

const candidate = physics12MotionProductionPackageCandidate

const validate = (value: ProductionKnowledgePackageCandidate) =>
  validateProductionKnowledgePackageCandidate({
    structuralRecords: theoreticalCurriculumCatalog,
    expectedStructuralCatalogSha256: theoreticalCurriculumFreezeManifest.catalogSha256,
    sourcePilotManifest: physics12MotionKnowledgeExpansionManifest,
    candidate: value,
  })

const hasIssue = (
  value: ProductionKnowledgePackageCandidate,
  code: string,
): boolean => validate(value).issues.some((issue) => issue.code === code)

test('valid Physics production candidate is machine-ready but not reviewed or persistence-ready', () => {
  assert.equal(physics12MotionProductionPackageValidation.valid, true, JSON.stringify(physics12MotionProductionPackageValidation.issues))
  assert.deepEqual(physics12MotionProductionPackageValidation.issues, [])
  assert.deepEqual(physics12MotionProductionReadinessReport.readiness, {
    machineStructure: 'PASS',
    educationalReview: 'PENDING',
    packageLifecycle: 'DRAFT',
    persistence: 'BLOCKED_PENDING_CURRICULUM_VERSION_REBIND',
    publication: 'NOT_AUTHORIZED',
  })
  assert.deepEqual(physics12MotionProductionReadinessReport.counts, {
    taxonomyNodes: 30,
    contentItems: 12,
    mappings: 12,
  })
})

test('production candidate explicitly differs from its pilot envelope while reusing exact pilot payload references', () => {
  assert.equal(physics12MotionKnowledgeExpansionManifest.package.packageKind, 'PILOT')
  assert.equal(candidate.package.packageKind, 'PRODUCTION_PACKAGE_CANDIDATE')
  assert.notEqual(candidate.package.packageId, physics12MotionKnowledgeExpansionManifest.package.packageId)
  assert.equal(candidate.payloadReference.sourcePackageId, physics12MotionKnowledgeExpansionManifest.package.packageId)
  assert.strictEqual(candidate.taxonomyNodes, physics12MotionTaxonomyNodes)
  assert.strictEqual(candidate.contentItems, physics12MotionContentItems)
  assert.strictEqual(candidate.mappings, physics12MotionContentMappings)
})

test('candidate has stable revision identity and deterministic payload and package checksums', () => {
  const rebuilt = buildProductionKnowledgePackageCandidate({
    packageId: candidate.package.packageId,
    packageRevisionId: candidate.package.packageRevisionId,
    packageRevision: candidate.package.packageRevision,
    sourcePilotManifest: physics12MotionKnowledgeExpansionManifest,
    structuralCatalogSha256: theoreticalCurriculumFreezeManifest.catalogSha256,
  })
  const nextRevision = buildProductionKnowledgePackageCandidate({
    packageId: candidate.package.packageId,
    packageRevisionId: 'pkg-rev-902a2b34-a776-4dc5-984f-e332a41a4197',
    packageRevision: 2,
    sourcePilotManifest: physics12MotionKnowledgeExpansionManifest,
    structuralCatalogSha256: theoreticalCurriculumFreezeManifest.catalogSha256,
  })

  assert.equal(candidate.package.packageRevision, 1)
  assert.equal(rebuilt.payloadChecksum, candidate.payloadChecksum)
  assert.equal(rebuilt.packageChecksum, candidate.packageChecksum)
  assert.equal(nextRevision.payloadChecksum, candidate.payloadChecksum)
  assert.notEqual(nextRevision.packageChecksum, candidate.packageChecksum)
  assert.equal(candidate.payloadChecksum, 'ce20fc14fa67af9b2eedc5fbd23ccb9b5aa2d496b94f5670c7342c42b8db337a')
  assert.equal(candidate.packageChecksum, '30d145724f684eb8d7b8e850e66bad87c5d04a613c9c4fd6924d7ea963e54341')
})

test('candidate is anchored exactly to Physics 3 Chapter 1 in the frozen candidate snapshot', () => {
  assert.deepEqual(candidate.structuralAnchor, {
    subjectId: PHYSICS12_MOTION_PILOT.subjectId,
    curriculumNodeId: PHYSICS12_MOTION_PILOT.chapterId,
    curriculumVersionId: PHYSICS12_MOTION_PILOT.curriculumVersionId,
  })
  assert.deepEqual(candidate.structuralSnapshot, {
    snapshotId: PHYSICS12_MOTION_PILOT.curriculumVersionId,
    catalogSha256: 'ef04a21c556dbc716137d8291c44e933f73fc8fd3c538dc3dfd59a1f560164be',
  })
  const chapter = theoreticalCurriculumCatalog.find((record) => record.ref === candidate.structuralAnchor.curriculumNodeId)
  assert.ok(chapter)
  assert.equal(chapter.displayLabel, 'فصل ۱ ـ حرکت بر خط راست')
  assert.equal(chapter.parentRef, PHYSICS12_MOTION_PILOT.subjectId)
})

test('candidate remains DRAFT and PENDING with an explicit persistence rebind requirement', () => {
  assert.equal(candidate.package.status, 'DRAFT')
  assert.deepEqual(candidate.package.review, { reviewer: null, reviewedAt: null, reviewStatus: 'PENDING' })
  assert.deepEqual(candidate.persistence, {
    state: 'REQUIRES_CURRICULUM_VERSION_REBIND_BEFORE_PERSISTENCE',
    requiresCurriculumVersionRebind: true,
    databaseCurriculumVersionId: null,
  })
})

test('validator rejects wrong subject, wrong chapter, and wrong frozen snapshot', () => {
  const wrongSubject = {
    ...candidate,
    package: { ...candidate.package, subject: 'experimental.g12.physics3' },
  } as ProductionKnowledgePackageCandidate
  const wrongChapter = {
    ...candidate,
    package: { ...candidate.package, structuralScope: 'mathematics.g12.physics3.chapter.4491' },
  } as ProductionKnowledgePackageCandidate
  const wrongSnapshot = {
    ...candidate,
    structuralSnapshot: { ...candidate.structuralSnapshot, snapshotId: 'wrong-frozen-snapshot' },
  } as ProductionKnowledgePackageCandidate

  assert.equal(hasIssue(wrongSubject, 'PILOT_SCOPE_MISMATCH'), true)
  assert.equal(hasIssue(wrongChapter, 'PILOT_SCOPE_MISMATCH'), true)
  assert.equal(hasIssue(wrongSnapshot, 'FROZEN_STRUCTURAL_SNAPSHOT_MISMATCH'), true)
})

test('validator rejects payload mutation and copied payload arrays', () => {
  const first = candidate.taxonomyNodes[0]!
  const mutated = {
    ...candidate,
    taxonomyNodes: [{ ...first, displayLabel: `${first.displayLabel} changed` }, ...candidate.taxonomyNodes.slice(1)],
  } as ProductionKnowledgePackageCandidate
  const copied = {
    ...candidate,
    taxonomyNodes: [...candidate.taxonomyNodes],
    contentItems: [...candidate.contentItems],
    mappings: [...candidate.mappings],
  } as ProductionKnowledgePackageCandidate

  assert.equal(hasIssue(mutated, 'PILOT_PAYLOAD_MUTATED'), true)
  assert.equal(hasIssue(mutated, 'PRODUCTION_PAYLOAD_CHECKSUM_MISMATCH'), true)
  assert.equal(hasIssue(copied, 'PILOT_PAYLOAD_REFERENCE_MISMATCH'), true)
})

test('validator rejects missing taxonomy or Content payload records', () => {
  const missingTaxonomy = {
    ...candidate,
    taxonomyNodes: candidate.taxonomyNodes.slice(1),
  } as ProductionKnowledgePackageCandidate
  const missingContent = {
    ...candidate,
    contentItems: candidate.contentItems.slice(1),
  } as ProductionKnowledgePackageCandidate

  assert.equal(hasIssue(missingTaxonomy, 'PILOT_PAYLOAD_MUTATED'), true)
  assert.equal(hasIssue(missingContent, 'PILOT_PAYLOAD_MUTATED'), true)
})

test('validator rejects broken mappings and payload key collisions', () => {
  const firstMapping = candidate.mappings[0]!
  const brokenMapping = {
    ...candidate,
    mappings: [{ ...firstMapping, taxonomyKey: 'tax-missing' }, ...candidate.mappings.slice(1)],
  } as ProductionKnowledgePackageCandidate
  const duplicateTaxonomyKey = {
    ...candidate,
    taxonomyNodes: [candidate.taxonomyNodes[0]!, candidate.taxonomyNodes[0]!, ...candidate.taxonomyNodes.slice(2)],
  } as ProductionKnowledgePackageCandidate

  assert.equal(hasIssue(brokenMapping, 'MAPPED_TAXONOMY_NODE_NOT_FOUND'), true)
  assert.equal(hasIssue(duplicateTaxonomyKey, 'DUPLICATE_TAXONOMY_KEY'), true)
})

test('candidate-set validation rejects duplicate package and revision identities and cross-candidate key collisions', () => {
  const report = validateProductionKnowledgePackageCandidateSet({
    structuralRecords: theoreticalCurriculumCatalog,
    expectedStructuralCatalogSha256: theoreticalCurriculumFreezeManifest.catalogSha256,
    sourcePilotManifest: physics12MotionKnowledgeExpansionManifest,
    candidates: [candidate, candidate],
  })
  const codes = new Set(report.issues.map((issue) => issue.code))

  assert.equal(report.valid, false)
  assert.ok(codes.has('DUPLICATE_PRODUCTION_PACKAGE_ID'))
  assert.ok(codes.has('DUPLICATE_PACKAGE_REVISION_ID'))
  assert.ok(codes.has('PRODUCTION_TAXONOMY_KEY_COLLISION'))
  assert.ok(codes.has('PRODUCTION_CONTENT_KEY_COLLISION'))
  assert.ok(codes.has('PRODUCTION_MAPPING_KEY_COLLISION'))
})

test('validator rejects invalid review metadata and false reviewed or approved lifecycle claims', () => {
  const invalidReview = {
    ...candidate,
    package: {
      ...candidate.package,
      review: { reviewStatus: 'PENDING', reviewer: 'invented-reviewer', reviewedAt: null },
    },
  } as ProductionKnowledgePackageCandidate
  const falseReviewed = {
    ...candidate,
    package: { ...candidate.package, status: 'REVIEWED' },
  } as ProductionKnowledgePackageCandidate
  const falseApproved = {
    ...candidate,
    package: { ...candidate.package, status: 'APPROVED' },
  } as ProductionKnowledgePackageCandidate

  assert.equal(hasIssue(invalidReview, 'PENDING_REVIEW_HAS_METADATA'), true)
  assert.equal(hasIssue(falseReviewed, 'PRODUCTION_CANDIDATE_MUST_REMAIN_DRAFT'), true)
  assert.equal(hasIssue(falseApproved, 'PRODUCTION_CANDIDATE_MUST_REMAIN_DRAFT'), true)
})

test('validator rejects a fake database CurriculumVersion UUID and a missing rebind requirement', () => {
  const fakeDatabaseVersion = {
    ...candidate,
    package: {
      ...candidate.package,
      curriculumVersionId: 'a432e7a5-a3d3-4c1d-a304-404138411490',
    },
  } as ProductionKnowledgePackageCandidate
  const missingRebind = {
    ...candidate,
    persistence: {
      state: 'REQUIRES_CURRICULUM_VERSION_REBIND_BEFORE_PERSISTENCE',
      requiresCurriculumVersionRebind: false,
      databaseCurriculumVersionId: null,
    },
  } as unknown as ProductionKnowledgePackageCandidate

  assert.equal(hasIssue(fakeDatabaseVersion, 'DATABASE_CURRICULUM_VERSION_FORBIDDEN'), true)
  assert.equal(hasIssue(missingRebind, 'CURRICULUM_VERSION_REBIND_REQUIRED'), true)
})

test('invalid candidates produce a deterministic non-ready classification without lifecycle mutation', () => {
  const invalid = {
    ...candidate,
    taxonomyNodes: candidate.taxonomyNodes.slice(1),
  } as ProductionKnowledgePackageCandidate
  const validation = validate(invalid)
  const first = createProductionKnowledgeReadinessReport(validation)
  const second = createProductionKnowledgeReadinessReport(validation)

  assert.deepEqual(first, second)
  assert.equal(first.readiness.machineStructure, 'FAIL')
  assert.equal(first.readiness.educationalReview, 'PENDING')
  assert.equal(first.readiness.persistence, 'BLOCKED_VALIDATION_FAILURES')
  assert.equal(first.readiness.publication, 'NOT_AUTHORIZED')
  assert.equal(invalid.package.status, 'DRAFT')
})

test('Arabic pilot and structural checksum remain unchanged', () => {
  assert.equal(ARABIC10_LESSON1_PILOT.subjectId, 'shared.g10.arabic')
  assert.equal(ARABIC10_LESSON1_PILOT.lessonId, 'shared.g10.arabic.lesson.186')
  assert.equal(arabic10Lesson1TaxonomyNodes.length, 27)
  assert.equal(arabic10Lesson1ContentItems.length, 12)
  assert.equal(arabic10Lesson1ContentMappings.length, 12)
  assert.equal(theoreticalCurriculumCatalog.length, 535)
  assert.equal(
    theoreticalCurriculumFreezeManifest.catalogSha256,
    'ef04a21c556dbc716137d8291c44e933f73fc8fd3c538dc3dfd59a1f560164be',
  )
})
