import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  assertHumanSciencesTranscription,
  createHumanSciencesManifestDraft,
  humanSciencesApplicability,
  humanSciencesCatalog,
  humanSciencesStructuralCounts,
} from '../src/curriculum/data/human-sciences.js'
import {
  buildCurriculumImportManifest,
  validateCurriculumImportManifest,
} from '../src/curriculum/import-manifest.js'

const childrenOf = (parentRef: string) => humanSciencesCatalog.filter((record) => record.parentRef === parentRef)
const byType = (type: string) => humanSciencesCatalog.filter((record) => record.proposedNodeTypeCode === type)

const expectedHumanSubjects = {
  'human.g10': ['علوم و فنون ادبی ۱', 'جامعه‌شناسی ۱', 'منطق', 'اقتصاد', 'ریاضی و آمار ۱', 'تاریخ ۱', 'جغرافیای ایران'],
  'human.g11': ['علوم و فنون ادبی ۲', 'جامعه‌شناسی ۲', 'روان‌شناسی', 'فلسفه ۱', 'ریاضی و آمار ۲', 'تاریخ ۲', 'جغرافیا ۲'],
  'human.g12': ['علوم و فنون ادبی ۳', 'جامعه‌شناسی ۳', 'فلسفه ۲', 'ریاضی و آمار ۳', 'تاریخ ۳', 'جغرافیا ۳'],
} as const

const expectedSharedSubjects = {
  'shared.g10': ['فارسی ۱', 'عربی، زبان قرآن ۱', 'دین و زندگی ۱', 'زبان انگلیسی ۱'],
  'shared.g11': ['فارسی ۲', 'عربی، زبان قرآن ۲', 'دین و زندگی ۲', 'زبان انگلیسی ۲'],
  'shared.g12': ['فارسی ۳', 'عربی، زبان قرآن ۳', 'دین و زندگی ۳', 'زبان انگلیسی ۳'],
} as const

const expectedStructuralCounts = {
  'shared.g10.arabic': { chapters: 0, lessons: 8 },
  'shared.g11.arabic': { chapters: 0, lessons: 7 },
  'shared.g12.arabic': { chapters: 0, lessons: 4 },
  'shared.g10.persian': { chapters: 8, lessons: 18 },
  'shared.g11.persian': { chapters: 8, lessons: 18 },
  'shared.g12.persian': { chapters: 8, lessons: 18 },
  'shared.g10.religion': { chapters: 0, lessons: 14 },
  'shared.g11.religion': { chapters: 0, lessons: 12 },
  'shared.g12.religion': { chapters: 0, lessons: 10 },
  'shared.g10.english': { chapters: 0, lessons: 4 },
  'shared.g11.english': { chapters: 0, lessons: 3 },
  'shared.g12.english': { chapters: 0, lessons: 3 },
  'human.g10.literary': { chapters: 4, lessons: 0 },
  'human.g11.literary': { chapters: 4, lessons: 0 },
  'human.g12.literary': { chapters: 4, lessons: 0 },
  'human.g10.sociology': { chapters: 2, lessons: 16 },
  'human.g11.sociology': { chapters: 3, lessons: 14 },
  'human.g12.sociology': { chapters: 0, lessons: 10 },
  'human.g10.history': { chapters: 3, lessons: 16 },
  'human.g11.history': { chapters: 4, lessons: 16 },
  'human.g12.history': { chapters: 0, lessons: 12 },
  'human.g10.mathstats': { chapters: 4, lessons: 0 },
  'human.g11.mathstats': { chapters: 4, lessons: 0 },
  'human.g12.mathstats': { chapters: 3, lessons: 0 },
  'human.g10.geography': { chapters: 3, lessons: 10 },
  'human.g11.geography': { chapters: 4, lessons: 11 },
  'human.g12.geography': { chapters: 3, lessons: 6 },
  'human.g10.logic': { chapters: 7, lessons: 10 },
  'human.g10.economics': { chapters: 4, lessons: 14 },
  'human.g11.psychology': { chapters: 0, lessons: 8 },
  'human.g11.philosophy': { chapters: 3, lessons: 11 },
  'human.g12.philosophy': { chapters: 3, lessons: 12 },
} as const

test('Human Sciences catalog contains the exact grade-specific subject matrix', () => {
  for (const [gradeRef, expected] of Object.entries(expectedHumanSubjects)) {
    assert.deepEqual(childrenOf(gradeRef).map((record) => record.displayLabel), expected)
  }
  assert.equal(Object.values(expectedHumanSubjects).flat().length, 20)
})

test('shared subjects are owned once and not cloned into branch grades', () => {
  for (const [gradeRef, expected] of Object.entries(expectedSharedSubjects)) {
    assert.deepEqual(childrenOf(gradeRef).map((record) => record.displayLabel), expected)
  }
  assert.equal(Object.values(expectedSharedSubjects).flat().length, 12)
  const sharedNames = new Set(Object.values(expectedSharedSubjects).flat())
  const branchSubjects = byType('SUBJECT').filter((record) => record.ref.startsWith('human.'))
  assert.equal(branchSubjects.some((record) => sharedNames.has(record.displayLabel as never)), false)
  const subjectOwnership = byType('SUBJECT').map((record) => `${record.parentRef}:${record.displayLabel}`)
  assert.equal(new Set(subjectOwnership).size, subjectOwnership.length)
})

test('shared subject applicability links each shared grade subject to every theoretical branch grade', () => {
  assert.equal(humanSciencesApplicability.length, 36)
  for (const grade of ['g10', 'g11', 'g12']) {
    for (const subject of ['persian', 'arabic', 'religion', 'english']) {
      const sourceRef = `shared.${grade}.${subject}`
      const targets = humanSciencesApplicability
        .filter((relationship) => relationship.sourceRef === sourceRef)
        .map((relationship) => relationship.targetRef)
      assert.deepEqual(targets, [`mathematics.${grade}`, `experimental.${grade}`, `human.${grade}`])
    }
  }
})

test('chapter and explicit lesson counts match the reviewed transcription', () => {
  assert.deepEqual(humanSciencesStructuralCounts, expectedStructuralCounts)
  assert.equal(Object.values(humanSciencesStructuralCounts).reduce((sum, value) => sum + value.chapters, 0), 86)
  assert.equal(Object.values(humanSciencesStructuralCounts).reduce((sum, value) => sum + value.lessons, 0), 285)
  assert.equal(byType('CHAPTER').length, 86)
  assert.equal(byType('TOPIC').length, 285)
})

test('catalog excludes deferred modules, excluded subjects, and lower topic detail', () => {
  const subjectLabels = new Set(byType('SUBJECT').map((record) => record.displayLabel))
  for (const excluded of ['نگارش ۱', 'نگارش ۲', 'نگارش ۳', 'آمادگی دفاعی', 'سلامت و بهداشت', 'هویت اجتماعی']) {
    assert.equal(subjectLabels.has(excluded), false)
  }
  assert.equal(byType('CONCEPT').length, 0)
  assert.equal(byType('SUBCONCEPT').length, 0)
})

test('catalog remains byte-aligned with the canonical transcription and builds a valid manifest', async () => {
  const transcription = await readFile(new URL('../../../docs/curriculum/CANONICAL_CURRICULUM.md', import.meta.url))
  assert.doesNotThrow(() => assertHumanSciencesTranscription(transcription.toString('utf8')))
  const manifest = buildCurriculumImportManifest(createHumanSciencesManifestDraft({
    expectedRevision: 0,
    idempotencyKey: 'human-sciences-structural-test-v1',
  }), {
    sourceArtifact: Buffer.from('test-source-artifact'),
    sourceArtifactName: 'cori.docx',
    transcription,
  })
  const report = validateCurriculumImportManifest(manifest)
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.deepEqual(report.issues, [])
  assert.equal(report.recordCount, 420)
  assert.equal(report.ambiguousRecordCount, 0)
  assert.deepEqual(report.typeCounts, {
    CHAPTER: 86,
    CURRICULUM_ROOT: 1,
    FIELD: 4,
    GRADE: 12,
    SUBJECT: 32,
    TOPIC: 285,
  })
})
