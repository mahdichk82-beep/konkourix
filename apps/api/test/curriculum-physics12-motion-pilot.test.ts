import assert from 'node:assert/strict'
import test from 'node:test'
import { validateContentIngestion } from '../src/curriculum/content-ingestion.js'
import {
  contentCurriculumMappings,
  educationalContentItems,
} from '../src/curriculum/data/content-ingestion-registry.js'
import {
  PHYSICS12_MOTION_PILOT,
  physics12MotionContentItems,
  physics12MotionContentMappings,
  physics12MotionTaxonomyNodes,
  physics12MotionTaxonomyRegistry,
} from '../src/curriculum/data/pilot-physics12-motion.js'
import {
  knowledgeTaxonomyNodes,
  taxonomyRegistry,
} from '../src/curriculum/data/taxonomy-registry.js'
import { theoreticalCurriculumFreezeManifest } from '../src/curriculum/data/theoretical-curriculum-freeze.js'
import { theoreticalCurriculumCatalog } from '../src/curriculum/data/theoretical-curriculum.js'
import { validateKnowledgeTaxonomy } from '../src/curriculum/taxonomy.js'

test('pilot is anchored only to Mathematics & Physics Grade 12 Motion chapter', () => {
  const subject = theoreticalCurriculumCatalog.find((record) => record.ref === PHYSICS12_MOTION_PILOT.subjectId)
  const chapter = theoreticalCurriculumCatalog.find((record) => record.ref === PHYSICS12_MOTION_PILOT.chapterId)
  assert.ok(subject)
  assert.equal(subject.proposedNodeTypeCode, 'SUBJECT')
  assert.equal(subject.displayLabel, 'فیزیک ۳')
  assert.ok(chapter)
  assert.equal(chapter.proposedNodeTypeCode, 'CHAPTER')
  assert.equal(chapter.displayLabel, 'فصل ۱ ـ حرکت بر خط راست')
  assert.equal(chapter.parentRef, subject.ref)
  assert.deepEqual(
    taxonomyRegistry.filter((entry) => entry.subjectId === PHYSICS12_MOTION_PILOT.subjectId),
    [physics12MotionTaxonomyRegistry],
  )
  assert.deepEqual(
    knowledgeTaxonomyNodes.filter((node) => node.subjectId === PHYSICS12_MOTION_PILOT.subjectId),
    physics12MotionTaxonomyNodes,
  )
  assert.ok(physics12MotionTaxonomyNodes.every((node) =>
    node.subjectId === subject.ref
    && node.curriculumNodeId === chapter.ref
    && node.curriculumVersionId === PHYSICS12_MOTION_PILOT.curriculumVersionId))
})

test('pilot completes Topic through Question Pattern hierarchy', () => {
  const report = validateKnowledgeTaxonomy({
    structuralRecords: theoreticalCurriculumCatalog,
    registry: [physics12MotionTaxonomyRegistry],
    taxonomyNodes: physics12MotionTaxonomyNodes,
  })
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.deepEqual(report.kindCounts, {
    TOPIC: 1,
    SUBTOPIC: 5,
    CONCEPT: 8,
    SKILL: 8,
    QUESTION_PATTERN: 8,
  })
})

test('every pilot concept belongs to a Topic or Subtopic taxonomy parent', () => {
  const byKey = new Map(physics12MotionTaxonomyNodes.map((node) => [node.taxonomyKey, node]))
  const concepts = physics12MotionTaxonomyNodes.filter((node) => node.kind === 'CONCEPT')
  assert.equal(concepts.length, 8)
  for (const concept of concepts) {
    assert.ok(concept.parentTaxonomyKey)
    const parent = byKey.get(concept.parentTaxonomyKey)
    assert.ok(parent)
    assert.ok(parent.kind === 'TOPIC' || parent.kind === 'SUBTOPIC')
  }
})

test('pilot content stays within allowed manual-entry limits and has provenance', () => {
  assert.ok(physics12MotionContentItems.length > 0)
  assert.ok(physics12MotionContentItems.length <= 20)
  assert.deepEqual(
    educationalContentItems.filter((item) => item.provenance.sourceReference.startsWith('manual://physics12-motion/')),
    physics12MotionContentItems,
  )
  for (const item of physics12MotionContentItems) {
    assert.ok(['DEFINITION', 'EXPLANATION', 'EXAMPLE'].includes(item.kind))
    assert.equal(item.provenance.sourceType, 'MANUAL_ENTRY')
    assert.equal(item.provenance.verificationStatus, 'UNVERIFIED')
    assert.ok(item.provenance.sourceReference)
    assert.ok(item.provenance.createdBy)
    assert.ok(item.provenance.createdAt)
    assert.equal(item.provenance.reviewedBy, null)
    assert.equal(item.provenance.reviewedAt, null)
  }
})

test('every pilot mapping resolves to content, structural chapter, and taxonomy node', () => {
  const report = validateContentIngestion({
    structuralRecords: theoreticalCurriculumCatalog,
    taxonomyNodes: physics12MotionTaxonomyNodes,
    contentItems: physics12MotionContentItems,
    mappings: physics12MotionContentMappings,
  })
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.deepEqual(
    contentCurriculumMappings.filter((item) => item.curriculumNodeId === PHYSICS12_MOTION_PILOT.chapterId),
    physics12MotionContentMappings,
  )
  assert.equal(physics12MotionContentMappings.length, physics12MotionContentItems.length)
  const contentKeys = new Set(physics12MotionContentItems.map((item) => item.contentKey))
  const taxonomyKeys = new Set(physics12MotionTaxonomyNodes.map((node) => node.taxonomyKey))
  for (const mapping of physics12MotionContentMappings) {
    assert.ok(contentKeys.has(mapping.contentKey))
    assert.ok(taxonomyKeys.has(mapping.taxonomyKey))
    assert.equal(mapping.curriculumNodeId, PHYSICS12_MOTION_PILOT.chapterId)
  }
})

test('pilot leaves structural checksum unchanged and affects no unrelated subject', () => {
  assert.equal(
    theoreticalCurriculumFreezeManifest.catalogSha256,
    'ef04a21c556dbc716137d8291c44e933f73fc8fd3c538dc3dfd59a1f560164be',
  )
  assert.equal(taxonomyRegistry.filter((entry) => entry.subjectId === PHYSICS12_MOTION_PILOT.subjectId).length, 1)
  assert.equal(knowledgeTaxonomyNodes.filter((node) => node.subjectId === PHYSICS12_MOTION_PILOT.subjectId).length, 30)
})
