import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  humanSciencesRecord,
  theoreticalCurriculumFoundationCatalog,
} from '../src/curriculum/data/human-sciences.js'
import {
  assertExperimentalSciencesTranscription,
  createExperimentalSciencesManifestDraft,
  experimentalSciencesApplicability,
  experimentalSciencesCatalog,
  experimentalSciencesSourceAmbiguities,
  experimentalSciencesStructuralCounts,
} from '../src/curriculum/data/experimental-sciences.js'
import {
  buildCurriculumImportManifest,
  validateCurriculumImportManifest,
} from '../src/curriculum/import-manifest.js'

const childrenOf = (parentRef: string) => experimentalSciencesCatalog.filter((record) => record.parentRef === parentRef)
const byType = (type: string) => experimentalSciencesCatalog.filter((record) => record.proposedNodeTypeCode === type)

const expectedSubjects = {
  'experimental.g10': ['ریاضی ۱', 'فیزیک ۱', 'شیمی ۱', 'زیست‌شناسی ۱'],
  'experimental.g11': ['ریاضی ۲', 'فیزیک ۲', 'شیمی ۲', 'زیست‌شناسی ۲', 'زمین‌شناسی'],
  'experimental.g12': ['ریاضی ۳', 'فیزیک ۳', 'شیمی ۳', 'زیست‌شناسی ۳'],
} as const

const expectedStructuralCounts = {
  'experimental.g10.biology1': { chapters: 0, lessons: 0 },
  'experimental.g11.biology2': { chapters: 0, lessons: 0 },
  'experimental.g12.biology3': { chapters: 0, lessons: 0 },
  'experimental.g10.chemistry1': { chapters: 3, lessons: 0 },
  'experimental.g11.chemistry2': { chapters: 3, lessons: 0 },
  'experimental.g12.chemistry3': { chapters: 4, lessons: 0 },
  'experimental.g10.physics1': { chapters: 4, lessons: 0 },
  'experimental.g11.physics2': { chapters: 3, lessons: 0 },
  'experimental.g12.physics3': { chapters: 4, lessons: 0 },
  'experimental.g10.math1': { chapters: 7, lessons: 0 },
  'experimental.g11.math2': { chapters: 7, lessons: 0 },
  'experimental.g12.math3': { chapters: 7, lessons: 0 },
  'experimental.g11.geology': { chapters: 0, lessons: 0 },
} as const

test('Experimental Sciences catalog contains the exact source-defined subject matrix', () => {
  for (const [gradeRef, expected] of Object.entries(expectedSubjects)) {
    assert.deepEqual(childrenOf(gradeRef).map((record) => record.displayLabel), expected)
  }
  assert.equal(Object.values(expectedSubjects).flat().length, 13)
})

test('shared foundation records retain stable source keys across field imports', () => {
  for (const record of theoreticalCurriculumFoundationCatalog) {
    const reused = experimentalSciencesCatalog.find((candidate) => candidate.ref === record.ref)
    assert.ok(reused, `Missing shared foundation record ${record.ref}`)
    assert.equal(reused.sourceRecordKey, humanSciencesRecord(record.ref).sourceRecordKey)
  }
})

test('shared general subjects remain owned once and apply without branch cloning', () => {
  assert.equal(experimentalSciencesApplicability.length, 36)
  const sharedSubjects = byType('SUBJECT').filter((record) => record.ref.startsWith('shared.'))
  assert.equal(sharedSubjects.length, 12)
  const sharedLabels = new Set<string>(sharedSubjects.map((record) => record.displayLabel))
  const experimentalSubjects = byType('SUBJECT').filter((record) => record.ref.startsWith('experimental.'))
  assert.equal(experimentalSubjects.some((record) => sharedLabels.has(record.displayLabel)), false)
  for (const grade of ['g10', 'g11', 'g12']) {
    for (const subject of ['persian', 'arabic', 'religion', 'english']) {
      const sourceRef = `shared.${grade}.${subject}`
      const targets = experimentalSciencesApplicability
        .filter((relationship) => relationship.sourceRef === sourceRef)
        .map((relationship) => relationship.targetRef)
      assert.deepEqual(targets, [`mathematics.${grade}`, `experimental.${grade}`, `human.${grade}`])
    }
  }
})

test('structural counts match explicit source headings and infer no lessons', () => {
  assert.deepEqual(experimentalSciencesStructuralCounts, expectedStructuralCounts)
  assert.equal(Object.values(experimentalSciencesStructuralCounts).reduce((sum, value) => sum + value.chapters, 0), 42)
  assert.equal(Object.values(experimentalSciencesStructuralCounts).reduce((sum, value) => sum + value.lessons, 0), 0)
  assert.equal(byType('CHAPTER').filter((record) => record.ref.startsWith('experimental.')).length, 42)
  assert.equal(byType('TOPIC').filter((record) => record.ref.startsWith('experimental.')).length, 0)
  assert.equal(byType('CONCEPT').length, 0)
  assert.equal(byType('SUBCONCEPT').length, 0)
  assert.deepEqual(experimentalSciencesSourceAmbiguities.map((item) => item.code), [
    'BIOLOGY_GRADE_PARENT_UNRESOLVED',
    'GEOLOGY_DETAIL_ABSENT',
    'EXPERIMENTAL_MATH_THEMATIC_TREE_UNRESOLVED',
  ])
})

test('catalog hierarchy has one root, valid parents, and no duplicate records', () => {
  const refs = new Set(experimentalSciencesCatalog.map((record) => record.ref))
  const sourceKeys = new Set(experimentalSciencesCatalog.map((record) => record.sourceRecordKey))
  assert.equal(refs.size, experimentalSciencesCatalog.length)
  assert.equal(sourceKeys.size, experimentalSciencesCatalog.length)
  assert.equal(byType('CURRICULUM_ROOT').length, 1)
  for (const record of experimentalSciencesCatalog) {
    if (record.parentRef) assert.ok(refs.has(record.parentRef), `Missing parent ${record.parentRef}`)
  }
  const subjectOwnership = byType('SUBJECT').map((record) => `${record.parentRef}:${record.displayLabel}`)
  assert.equal(new Set(subjectOwnership).size, subjectOwnership.length)
})

test('catalog remains byte-aligned with source and builds a valid structural manifest', async () => {
  const transcription = await readFile(new URL('../../../docs/curriculum/CANONICAL_CURRICULUM.md', import.meta.url))
  assert.doesNotThrow(() => assertExperimentalSciencesTranscription(transcription.toString('utf8')))
  const manifest = buildCurriculumImportManifest(createExperimentalSciencesManifestDraft({
    expectedRevision: 0,
    idempotencyKey: 'experimental-sciences-structural-test-v1',
  }), {
    sourceArtifact: Buffer.from('test-source-artifact'),
    sourceArtifactName: 'cori.docx',
    transcription,
  })
  const report = validateCurriculumImportManifest(manifest)
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.deepEqual(report.issues, [])
  assert.equal(report.recordCount, 227)
  assert.equal(report.ambiguousRecordCount, 0)
  assert.deepEqual(report.typeCounts, {
    CHAPTER: 66,
    CURRICULUM_ROOT: 1,
    FIELD: 4,
    GRADE: 12,
    SUBJECT: 25,
    TOPIC: 119,
  })
})
