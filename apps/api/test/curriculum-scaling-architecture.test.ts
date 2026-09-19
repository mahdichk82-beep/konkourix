import assert from 'node:assert/strict'
import test from 'node:test'
import {
  arabic10Lesson1KnowledgeExpansionManifest,
  knowledgeExpansionManifests,
  physics12MotionKnowledgeExpansionManifest,
} from '../src/curriculum/data/knowledge-expansion-packages.js'
import {
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
  isKnowledgePackageTransitionAllowed,
  knowledgeImportPackageStatuses,
  knowledgePackageReviewStatuses,
  validateKnowledgeExpansionManifest,
  validateKnowledgeExpansionPackageSet,
  type KnowledgeExpansionManifest,
} from '../src/curriculum/knowledge-expansion-package.js'

test('valid DRAFT knowledge package composes the existing validation pipeline', () => {
  const report = validateKnowledgeExpansionManifest({
    structuralRecords: theoreticalCurriculumCatalog,
    manifest: physics12MotionKnowledgeExpansionManifest,
  })

  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.packageStatus, 'DRAFT')
  assert.equal(report.taxonomyNodeCount, 30)
  assert.equal(report.contentItemCount, 12)
  assert.equal(report.mappingCount, 12)
  assert.equal(report.taxonomyReport.valid, true)
  assert.equal(report.contentReport.valid, true)
  assert.deepEqual(report.issues, [])
  assert.equal(physics12MotionKnowledgeExpansionManifest.package.status, 'DRAFT')
  assert.equal(physics12MotionKnowledgeExpansionManifest.package.review.reviewStatus, 'PENDING')
})

test('invalid package is rejected across anchor, provenance, mapping, and ownership boundaries', () => {
  const firstContent = arabic10Lesson1KnowledgeExpansionManifest.contentItems[0]!
  const firstMapping = arabic10Lesson1KnowledgeExpansionManifest.mappings[0]!
  const secondMapping = arabic10Lesson1KnowledgeExpansionManifest.mappings[1]!
  const invalidManifest: KnowledgeExpansionManifest = {
    ...arabic10Lesson1KnowledgeExpansionManifest,
    package: {
      ...arabic10Lesson1KnowledgeExpansionManifest.package,
      structuralScope: physics12MotionKnowledgeExpansionManifest.package.structuralScope,
    },
    structuralAnchor: {
      ...arabic10Lesson1KnowledgeExpansionManifest.structuralAnchor,
      curriculumNodeId: physics12MotionKnowledgeExpansionManifest.structuralAnchor.curriculumNodeId,
    },
    contentItems: [
      { ...firstContent, provenance: null },
      ...arabic10Lesson1KnowledgeExpansionManifest.contentItems.slice(1),
    ],
    mappings: [
      { ...firstMapping, taxonomyKey: 'tax-missing-from-package' },
      {
        ...secondMapping,
        curriculumNodeId: physics12MotionKnowledgeExpansionManifest.structuralAnchor.curriculumNodeId,
      },
      ...arabic10Lesson1KnowledgeExpansionManifest.mappings.slice(2),
    ],
  }

  const report = validateKnowledgeExpansionManifest({
    structuralRecords: theoreticalCurriculumCatalog,
    manifest: invalidManifest,
  })
  const codes = new Set(report.issues.map((issue) => issue.code))

  assert.equal(report.valid, false)
  assert.ok(codes.has('STRUCTURAL_SCOPE_OWNERSHIP_CONFLICT'))
  assert.ok(codes.has('TAXONOMY_OUTSIDE_PACKAGE_SCOPE'))
  assert.ok(codes.has('CONTENT_PROVENANCE_REQUIRED'))
  assert.ok(codes.has('MAPPED_TAXONOMY_NODE_NOT_FOUND'))
  assert.ok(codes.has('CONTENT_MAPPING_SUBJECT_CONFLICT'))
})

test('review metadata and package lifecycle require explicit human progression', () => {
  assert.deepEqual(knowledgeImportPackageStatuses, ['DRAFT', 'VALIDATED', 'REVIEWED', 'APPROVED'])
  assert.deepEqual(knowledgePackageReviewStatuses, ['PENDING', 'IN_REVIEW', 'CHANGES_REQUESTED', 'ACCEPTED'])
  assert.equal(isKnowledgePackageTransitionAllowed('DRAFT', 'VALIDATED'), true)
  assert.equal(isKnowledgePackageTransitionAllowed('VALIDATED', 'REVIEWED'), true)
  assert.equal(isKnowledgePackageTransitionAllowed('REVIEWED', 'APPROVED'), true)
  assert.equal(isKnowledgePackageTransitionAllowed('DRAFT', 'APPROVED'), false)
  assert.equal(isKnowledgePackageTransitionAllowed('APPROVED', 'DRAFT'), false)

  const unreviewedReviewedPackage: KnowledgeExpansionManifest = {
    ...physics12MotionKnowledgeExpansionManifest,
    package: {
      ...physics12MotionKnowledgeExpansionManifest.package,
      status: 'REVIEWED',
    },
  }
  const report = validateKnowledgeExpansionManifest({
    structuralRecords: theoreticalCurriculumCatalog,
    manifest: unreviewedReviewedPackage,
  })
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((issue) => issue.code === 'ACCEPTED_REVIEW_REQUIRED'))
})

test('Physics pilot is represented without changing its taxonomy, content, or mappings', () => {
  assert.strictEqual(physics12MotionKnowledgeExpansionManifest.taxonomyNodes, physics12MotionTaxonomyNodes)
  assert.strictEqual(physics12MotionKnowledgeExpansionManifest.contentItems, physics12MotionContentItems)
  assert.strictEqual(physics12MotionKnowledgeExpansionManifest.mappings, physics12MotionContentMappings)
  assert.equal(physics12MotionKnowledgeExpansionManifest.package.status, 'DRAFT')
})

test('Arabic pilot is represented without changing its taxonomy, content, or mappings', () => {
  assert.strictEqual(arabic10Lesson1KnowledgeExpansionManifest.taxonomyNodes, arabic10Lesson1TaxonomyNodes)
  assert.strictEqual(arabic10Lesson1KnowledgeExpansionManifest.contentItems, arabic10Lesson1ContentItems)
  assert.strictEqual(arabic10Lesson1KnowledgeExpansionManifest.mappings, arabic10Lesson1ContentMappings)
  assert.equal(arabic10Lesson1KnowledgeExpansionManifest.package.status, 'DRAFT')
})

test('registered packages validate together and reject future cross-package collisions', () => {
  const report = validateKnowledgeExpansionPackageSet({
    structuralRecords: theoreticalCurriculumCatalog,
    manifests: knowledgeExpansionManifests,
  })
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.packageCount, 2)
  assert.equal(report.packageReports.every((entry) => entry.packageStatus === 'DRAFT'), true)

  const collisionReport = validateKnowledgeExpansionPackageSet({
    structuralRecords: theoreticalCurriculumCatalog,
    manifests: [
      physics12MotionKnowledgeExpansionManifest,
      physics12MotionKnowledgeExpansionManifest,
    ],
  })
  const collisionCodes = new Set(collisionReport.issues.map((issue) => issue.code))
  assert.equal(collisionReport.valid, false)
  assert.ok(collisionCodes.has('DUPLICATE_PACKAGE_ID'))
  assert.ok(collisionCodes.has('CROSS_PACKAGE_TAXONOMY_KEY_COLLISION'))
  assert.ok(collisionCodes.has('CROSS_PACKAGE_CONTENT_KEY_COLLISION'))
  assert.ok(collisionCodes.has('CROSS_PACKAGE_MAPPING_KEY_COLLISION'))
})

test('scaling architecture leaves the frozen structural checksum unchanged', () => {
  assert.equal(
    theoreticalCurriculumFreezeManifest.catalogSha256,
    'ef04a21c556dbc716137d8291c44e933f73fc8fd3c538dc3dfd59a1f560164be',
  )
})
