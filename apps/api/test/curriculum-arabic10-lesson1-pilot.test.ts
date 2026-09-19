import assert from 'node:assert/strict'
import test from 'node:test'
import { validateContentIngestion } from '../src/curriculum/content-ingestion.js'
import {
  contentCurriculumMappings,
  educationalContentItems,
} from '../src/curriculum/data/content-ingestion-registry.js'
import {
  ARABIC10_LESSON1_PILOT,
  arabic10Lesson1ContentItems,
  arabic10Lesson1ContentMappings,
  arabic10Lesson1TaxonomyNodes,
  arabic10Lesson1TaxonomyRegistry,
} from '../src/curriculum/data/pilot-arabic10-lesson1.js'
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
import {
  theoreticalCurriculumApplicability,
  theoreticalCurriculumCatalog,
} from '../src/curriculum/data/theoretical-curriculum.js'
import { validateKnowledgeTaxonomy } from '../src/curriculum/taxonomy.js'

test('Arabic pilot reuses the shared Grade 10 subject and exact Lesson 1 structure', () => {
  const subject = theoreticalCurriculumCatalog.find((record) => record.ref === ARABIC10_LESSON1_PILOT.subjectId)
  const lesson = theoreticalCurriculumCatalog.find((record) => record.ref === ARABIC10_LESSON1_PILOT.lessonId)
  assert.ok(subject)
  assert.equal(subject.proposedNodeTypeCode, 'SUBJECT')
  assert.equal(subject.displayLabel, 'عربی، زبان قرآن ۱')
  assert.equal(subject.parentRef, 'shared.g10')
  assert.ok(lesson)
  assert.equal(lesson.proposedNodeTypeCode, 'TOPIC')
  assert.equal(lesson.displayLabel, 'درس ۱ ـ ذاکَ هُوَ الله')
  assert.equal(lesson.parentRef, subject.ref)
  assert.ok(theoreticalCurriculumApplicability.some((relationship) =>
    relationship.sourceRef === subject.ref
    && relationship.targetRef === ARABIC10_LESSON1_PILOT.applicableHumanGradeId
    && relationship.type === 'APPLICABILITY'))
  assert.equal(theoreticalCurriculumCatalog.some((record) => record.ref.startsWith('human.g10.arabic')), false)
})

test('Arabic pilot taxonomy hierarchy is valid and lesson-scoped', () => {
  const report = validateKnowledgeTaxonomy({
    structuralRecords: theoreticalCurriculumCatalog,
    registry: [arabic10Lesson1TaxonomyRegistry],
    taxonomyNodes: arabic10Lesson1TaxonomyNodes,
  })
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.deepEqual(report.kindCounts, {
    TOPIC: 3,
    SUBTOPIC: 5,
    CONCEPT: 7,
    SKILL: 7,
    QUESTION_PATTERN: 5,
  })
  assert.ok(arabic10Lesson1TaxonomyNodes.every((node) =>
    node.subjectId === ARABIC10_LESSON1_PILOT.subjectId
    && node.curriculumNodeId === ARABIC10_LESSON1_PILOT.lessonId
    && node.curriculumVersionId === ARABIC10_LESSON1_PILOT.curriculumVersionId))
})

test('Arabic pilot content is manual, unverified, provenance-complete, and within limit', () => {
  assert.ok(arabic10Lesson1ContentItems.length > 0)
  assert.ok(arabic10Lesson1ContentItems.length <= 20)
  for (const item of arabic10Lesson1ContentItems) {
    assert.ok(['DEFINITION', 'EXPLANATION', 'EXAMPLE', 'NOTE'].includes(item.kind))
    assert.equal(item.provenance.sourceType, 'MANUAL_ENTRY')
    assert.equal(item.provenance.verificationStatus, 'UNVERIFIED')
    assert.ok(item.provenance.sourceReference.startsWith('manual://arabic10-lesson1/'))
    assert.ok(item.provenance.createdBy)
    assert.ok(Number.isFinite(Date.parse(item.provenance.createdAt)))
    assert.equal(item.provenance.reviewedBy, null)
    assert.equal(item.provenance.reviewedAt, null)
  }
})

test('Arabic pilot mappings resolve without cross-subject ownership conflict', () => {
  const report = validateContentIngestion({
    structuralRecords: theoreticalCurriculumCatalog,
    taxonomyNodes: arabic10Lesson1TaxonomyNodes,
    contentItems: arabic10Lesson1ContentItems,
    mappings: arabic10Lesson1ContentMappings,
  })
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.equal(report.issues.some((issue) => issue.code === 'CONTENT_MAPPING_SUBJECT_CONFLICT'), false)
  assert.equal(arabic10Lesson1ContentMappings.length, arabic10Lesson1ContentItems.length)
  const contentKeys = new Set(arabic10Lesson1ContentItems.map((item) => item.contentKey))
  const taxonomyKeys = new Set(arabic10Lesson1TaxonomyNodes.map((node) => node.taxonomyKey))
  for (const mapping of arabic10Lesson1ContentMappings) {
    assert.ok(contentKeys.has(mapping.contentKey))
    assert.ok(taxonomyKeys.has(mapping.taxonomyKey))
    assert.equal(mapping.curriculumNodeId, ARABIC10_LESSON1_PILOT.lessonId)
  }
})

test('combined pilot registries validate without key or ownership collisions', () => {
  const taxonomyReport = validateKnowledgeTaxonomy({
    structuralRecords: theoreticalCurriculumCatalog,
    registry: taxonomyRegistry,
    taxonomyNodes: knowledgeTaxonomyNodes,
  })
  assert.equal(taxonomyReport.valid, true, JSON.stringify(taxonomyReport.issues))
  const contentReport = validateContentIngestion({
    structuralRecords: theoreticalCurriculumCatalog,
    taxonomyNodes: knowledgeTaxonomyNodes,
    contentItems: educationalContentItems,
    mappings: contentCurriculumMappings,
  })
  assert.equal(contentReport.valid, true, JSON.stringify(contentReport.issues))
  assert.deepEqual(new Set(taxonomyRegistry.map((entry) => entry.subjectId)), new Set([
    PHYSICS12_MOTION_PILOT.subjectId,
    ARABIC10_LESSON1_PILOT.subjectId,
  ]))
})

test('Physics pilot remains unchanged after adding the Arabic pilot', () => {
  assert.deepEqual(
    taxonomyRegistry.filter((entry) => entry.subjectId === PHYSICS12_MOTION_PILOT.subjectId),
    [physics12MotionTaxonomyRegistry],
  )
  assert.deepEqual(
    knowledgeTaxonomyNodes.filter((node) => node.subjectId === PHYSICS12_MOTION_PILOT.subjectId),
    physics12MotionTaxonomyNodes,
  )
  assert.deepEqual(
    educationalContentItems.filter((item) => item.provenance.sourceReference.startsWith('manual://physics12-motion/')),
    physics12MotionContentItems,
  )
  assert.deepEqual(
    contentCurriculumMappings.filter((mapping) => mapping.curriculumNodeId === PHYSICS12_MOTION_PILOT.chapterId),
    physics12MotionContentMappings,
  )
})

test('cross-domain pilot leaves structural checksum unchanged', () => {
  assert.equal(
    theoreticalCurriculumFreezeManifest.catalogSha256,
    'ef04a21c556dbc716137d8291c44e933f73fc8fd3c538dc3dfd59a1f560164be',
  )
})
