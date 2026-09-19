import assert from 'node:assert/strict'
import test from 'node:test'
import {
  contentCurriculumMappings,
  educationalContentItems,
} from '../src/curriculum/data/content-ingestion-registry.js'
import {
  knowledgeTaxonomyNodes,
  taxonomyRegistry,
} from '../src/curriculum/data/taxonomy-registry.js'
import {
  theoreticalCurriculumFreezeManifest,
} from '../src/curriculum/data/theoretical-curriculum-freeze.js'
import { theoreticalCurriculumCatalog } from '../src/curriculum/data/theoretical-curriculum.js'
import {
  contentSourceTypes,
  isContentVerificationTransitionAllowed,
  validateContentIngestion,
  type ContentCurriculumMapping,
  type ContentItemCandidate,
} from '../src/curriculum/content-ingestion.js'
import type { KnowledgeTaxonomyNode } from '../src/curriculum/taxonomy.js'

const versionId = 'test-curriculum-version'
const subjectId = 'experimental.g10.math1'
const curriculumNodeId = 'experimental.g10.math1.chapter.3210'

const contentItem = (overrides: Partial<ContentItemCandidate> = {}): ContentItemCandidate => ({
  contentKey: 'content-test-1',
  kind: 'EXPLANATION',
  title: 'Fixture title',
  body: 'Fixture body used only by validation tests.',
  provenance: {
    sourceType: 'TEXTBOOK',
    sourceReference: 'reviewed-test-source:L1',
    createdBy: 'test-author',
    createdAt: '2026-09-18T08:00:00.000Z',
    verificationStatus: 'UNVERIFIED',
    reviewedBy: null,
    reviewedAt: null,
  },
  ...overrides,
})

const taxonomyNode: KnowledgeTaxonomyNode = {
  taxonomyKey: 'tax-test-topic',
  kind: 'TOPIC',
  subjectId,
  curriculumVersionId: versionId,
  curriculumNodeId,
  parentTaxonomyKey: null,
  displayLabel: 'Fixture taxonomy topic',
  provenance: {
    sourceArtifactName: 'reviewed-test-source.txt',
    sourceRecordKey: 'taxonomy-test-source',
    sourceLocator: 'reviewed-test-source.txt:L1',
    rawText: 'Fixture taxonomy source',
  },
}

const mapping: ContentCurriculumMapping = {
  mappingKey: 'mapping-test-1',
  contentKey: 'content-test-1',
  curriculumVersionId: versionId,
  curriculumNodeId,
  taxonomyKey: taxonomyNode.taxonomyKey,
}

test('production content and mapping registries contain only the two isolated pilots', () => {
  assert.equal(educationalContentItems.length, 24)
  assert.equal(contentCurriculumMappings.length, 24)
  const report = validateContentIngestion({
    structuralRecords: theoreticalCurriculumCatalog,
    taxonomyNodes: knowledgeTaxonomyNodes,
    contentItems: educationalContentItems,
    mappings: contentCurriculumMappings,
  })
  assert.equal(report.valid, true)
  assert.equal(report.contentItemCount, 24)
  assert.equal(report.mappingCount, 24)
  assert.deepEqual(report.issues, [])
})

test('content source vocabulary is complete and controlled', () => {
  assert.deepEqual(contentSourceTypes, [
    'TEXTBOOK',
    'OFFICIAL_GUIDE',
    'TEACHER_CONTENT',
    'QUESTION_BANK',
    'MANUAL_ENTRY',
  ])
})

test('validator rejects content without provenance', () => {
  const report = validateContentIngestion({
    structuralRecords: theoreticalCurriculumCatalog,
    taxonomyNodes: [],
    contentItems: [contentItem({ provenance: null })],
    mappings: [],
  })
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((item) => item.code === 'CONTENT_PROVENANCE_REQUIRED'))
})

test('validator rejects approved content without reviewer evidence', () => {
  const item = contentItem()
  assert.ok(item.provenance)
  const report = validateContentIngestion({
    structuralRecords: theoreticalCurriculumCatalog,
    taxonomyNodes: [],
    contentItems: [contentItem({
      provenance: {
        ...item.provenance,
        verificationStatus: 'APPROVED',
        reviewedBy: null,
        reviewedAt: null,
      },
    })],
    mappings: [],
  })
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((issue) => issue.code === 'APPROVED_CONTENT_REVIEWER_REQUIRED'))
})

test('content verification lifecycle is sequential and irreversible', () => {
  assert.equal(isContentVerificationTransitionAllowed('UNVERIFIED', 'REVIEWED'), true)
  assert.equal(isContentVerificationTransitionAllowed('REVIEWED', 'APPROVED'), true)
  assert.equal(isContentVerificationTransitionAllowed('UNVERIFIED', 'APPROVED'), false)
  assert.equal(isContentVerificationTransitionAllowed('REVIEWED', 'UNVERIFIED'), false)
  assert.equal(isContentVerificationTransitionAllowed('APPROVED', 'REVIEWED'), false)
})

test('validator rejects mapping to nonexistent taxonomy node', () => {
  const report = validateContentIngestion({
    structuralRecords: theoreticalCurriculumCatalog,
    taxonomyNodes: [],
    contentItems: [contentItem()],
    mappings: [mapping],
  })
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((issue) => issue.code === 'MAPPED_TAXONOMY_NODE_NOT_FOUND'))
})

test('validator accepts a future source-bound structural and taxonomy mapping', () => {
  const report = validateContentIngestion({
    structuralRecords: theoreticalCurriculumCatalog,
    taxonomyNodes: [taxonomyNode],
    contentItems: [contentItem()],
    mappings: [mapping],
  })
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.contentItemCount, 1)
  assert.equal(report.mappingCount, 1)
})

test('content foundation leaves curriculum freeze and taxonomy production state unchanged', () => {
  assert.equal(
    theoreticalCurriculumFreezeManifest.catalogSha256,
    'ef04a21c556dbc716137d8291c44e933f73fc8fd3c538dc3dfd59a1f560164be',
  )
  assert.equal(taxonomyRegistry.length, 2)
  assert.equal(knowledgeTaxonomyNodes.length, 57)
  assert.equal(educationalContentItems.length, 24)
  assert.equal(contentCurriculumMappings.length, 24)
  assert.deepEqual(new Set(taxonomyRegistry.map((entry) => entry.subjectId)), new Set([
    'mathematics.g12.physics3',
    'shared.g10.arabic',
  ]))
})
