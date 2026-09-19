import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  humanSciencesRecord,
  theoreticalCurriculumFoundationCatalog,
} from '../src/curriculum/data/human-sciences.js'
import {
  assertMathematicsPhysicsTranscription,
  createMathematicsPhysicsManifestDraft,
  mathematicsPhysicsApplicability,
  mathematicsPhysicsCatalog,
  mathematicsPhysicsStructuralCounts,
} from '../src/curriculum/data/mathematics-physics.js'
import {
  buildCurriculumImportManifest,
  validateCurriculumImportManifest,
} from '../src/curriculum/import-manifest.js'

const childrenOf = (parentRef: string) => mathematicsPhysicsCatalog.filter((record) => record.parentRef === parentRef)
const byType = (type: string) => mathematicsPhysicsCatalog.filter((record) => record.proposedNodeTypeCode === type)

const expectedSubjects = {
  'mathematics.g10': ['ریاضی ۱', 'هندسه ۱', 'فیزیک ۱'],
  'mathematics.g11': ['حسابان ۱', 'هندسه ۲', 'آمار و احتمال', 'فیزیک ۲'],
  'mathematics.g12': ['حسابان ۲', 'هندسه ۳', 'ریاضیات گسسته', 'فیزیک ۳'],
} as const

const expectedStructuralCounts = {
  'mathematics.g10.physics1': { chapters: 5, lessons: 0 },
  'mathematics.g11.physics2': { chapters: 4, lessons: 0 },
  'mathematics.g12.physics3': { chapters: 6, lessons: 0 },
  'mathematics.g11.geometry2': { chapters: 3, lessons: 0 },
  'mathematics.g10.geometry1': { chapters: 4, lessons: 0 },
  'mathematics.g12.geometry3': { chapters: 3, lessons: 0 },
  'mathematics.g10.math1': { chapters: 7, lessons: 0 },
  'mathematics.g11.calculus1': { chapters: 5, lessons: 0 },
  'mathematics.g12.calculus2': { chapters: 5, lessons: 0 },
  'mathematics.g11.statistics': { chapters: 4, lessons: 0 },
  'mathematics.g12.discrete': { chapters: 3, lessons: 0 },
} as const

test('Mathematics & Physics catalog contains the exact grade-specific subject matrix', () => {
  for (const [gradeRef, expected] of Object.entries(expectedSubjects)) {
    assert.deepEqual(childrenOf(gradeRef).map((record) => record.displayLabel), expected)
  }
  assert.equal(Object.values(expectedSubjects).flat().length, 11)
})

test('shared foundation records retain stable source keys across field imports', () => {
  for (const record of theoreticalCurriculumFoundationCatalog) {
    const reused = mathematicsPhysicsCatalog.find((candidate) => candidate.ref === record.ref)
    assert.ok(reused, `Missing shared foundation record ${record.ref}`)
    assert.equal(reused.sourceRecordKey, humanSciencesRecord(record.ref).sourceRecordKey)
  }
})

test('shared general subjects remain owned once and apply without branch cloning', () => {
  assert.equal(mathematicsPhysicsApplicability.length, 36)
  const sharedSubjects = byType('SUBJECT').filter((record) => record.ref.startsWith('shared.'))
  assert.equal(sharedSubjects.length, 12)
  const sharedLabels = new Set<string>(sharedSubjects.map((record) => record.displayLabel))
  const mathematicsSubjects = byType('SUBJECT').filter((record) => record.ref.startsWith('mathematics.'))
  assert.equal(mathematicsSubjects.some((record) => sharedLabels.has(record.displayLabel)), false)
  for (const grade of ['g10', 'g11', 'g12']) {
    for (const subject of ['persian', 'arabic', 'religion', 'english']) {
      const sourceRef = `shared.${grade}.${subject}`
      const targets = mathematicsPhysicsApplicability
        .filter((relationship) => relationship.sourceRef === sourceRef)
        .map((relationship) => relationship.targetRef)
      assert.deepEqual(targets, [`mathematics.${grade}`, `experimental.${grade}`, `human.${grade}`])
    }
  }
})

test('chapter counts match source and no missing lessons are inferred', () => {
  assert.deepEqual(mathematicsPhysicsStructuralCounts, expectedStructuralCounts)
  assert.equal(Object.values(mathematicsPhysicsStructuralCounts).reduce((sum, value) => sum + value.chapters, 0), 49)
  assert.equal(Object.values(mathematicsPhysicsStructuralCounts).reduce((sum, value) => sum + value.lessons, 0), 0)
  const fieldSpecificChapters = byType('CHAPTER').filter((record) => record.ref.startsWith('mathematics.'))
  const fieldSpecificLessons = byType('TOPIC').filter((record) => record.ref.startsWith('mathematics.'))
  assert.equal(fieldSpecificChapters.length, 49)
  assert.equal(fieldSpecificLessons.length, 0)
  assert.equal(byType('CONCEPT').length, 0)
  assert.equal(byType('SUBCONCEPT').length, 0)
})

test('catalog hierarchy has one root, valid parents, and no duplicate records', () => {
  const refs = new Set(mathematicsPhysicsCatalog.map((record) => record.ref))
  const sourceKeys = new Set(mathematicsPhysicsCatalog.map((record) => record.sourceRecordKey))
  assert.equal(refs.size, mathematicsPhysicsCatalog.length)
  assert.equal(sourceKeys.size, mathematicsPhysicsCatalog.length)
  assert.equal(byType('CURRICULUM_ROOT').length, 1)
  for (const record of mathematicsPhysicsCatalog) {
    if (record.parentRef) assert.ok(refs.has(record.parentRef), `Missing parent ${record.parentRef}`)
  }
  const subjectOwnership = byType('SUBJECT').map((record) => `${record.parentRef}:${record.displayLabel}`)
  assert.equal(new Set(subjectOwnership).size, subjectOwnership.length)
})

test('catalog remains byte-aligned with source and builds a valid structural manifest', async () => {
  const transcription = await readFile(new URL('../../../docs/curriculum/CANONICAL_CURRICULUM.md', import.meta.url))
  assert.doesNotThrow(() => assertMathematicsPhysicsTranscription(transcription.toString('utf8')))
  const manifest = buildCurriculumImportManifest(createMathematicsPhysicsManifestDraft({
    expectedRevision: 0,
    idempotencyKey: 'mathematics-physics-structural-test-v1',
  }), {
    sourceArtifact: Buffer.from('test-source-artifact'),
    sourceArtifactName: 'cori.docx',
    transcription,
  })
  const report = validateCurriculumImportManifest(manifest)
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.deepEqual(report.issues, [])
  assert.equal(report.recordCount, 232)
  assert.equal(report.ambiguousRecordCount, 0)
  assert.deepEqual(report.typeCounts, {
    CHAPTER: 73,
    CURRICULUM_ROOT: 1,
    FIELD: 4,
    GRADE: 12,
    SUBJECT: 23,
    TOPIC: 119,
  })
})
