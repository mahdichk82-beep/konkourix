import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { auditCurriculumCatalog } from '../src/curriculum/catalog-audit.js'
import {
  theoreticalCurriculumAuditReport,
  theoreticalCurriculumFreezeManifest,
} from '../src/curriculum/data/theoretical-curriculum-freeze.js'
import {
  theoreticalCurriculumApplicability,
  theoreticalCurriculumCatalog,
  theoreticalCurriculumFieldCatalogs,
  theoreticalCurriculumReviewItems,
} from '../src/curriculum/data/theoretical-curriculum.js'

const audit = (records = theoreticalCurriculumCatalog) => auditCurriculumCatalog({
  applicability: theoreticalCurriculumApplicability,
  records,
  unresolvedReviewItems: theoreticalCurriculumReviewItems,
})

test('complete theoretical catalog passes the freeze audit with pinned totals', () => {
  assert.equal(theoreticalCurriculumAuditReport.valid, true)
  assert.deepEqual(theoreticalCurriculumAuditReport.issues, [])
  assert.deepEqual(theoreticalCurriculumAuditReport.totals, {
    nodes: 535,
    scopes: 4,
    grades: 12,
    subjects: 56,
    chapters: 177,
    structuralLessons: 285,
    applicabilityRelationships: 36,
  })
  assert.equal(theoreticalCurriculumAuditReport.sharedSubjects.length, 12)
  assert.equal(theoreticalCurriculumAuditReport.scopeSpecificSubjects.length, 44)
  assert.equal(theoreticalCurriculumAuditReport.unresolvedReviewItems.length, 12)
})

test('shared subjects have one owner and complete applicability instead of branch clones', () => {
  const shared = theoreticalCurriculumAuditReport.sharedSubjects
  assert.equal(new Set(shared.map((subject) => subject.ref)).size, 12)
  assert.ok(shared.every((subject) => subject.scopeRef === 'shared' && subject.shared))
  for (const subject of shared) {
    const grade = subject.gradeRef.split('.')[1]
    const targets = theoreticalCurriculumApplicability
      .filter((relationship) => relationship.sourceRef === subject.ref)
      .map((relationship) => relationship.targetRef)
    assert.deepEqual(targets, [`mathematics.${grade}`, `experimental.${grade}`, `human.${grade}`])
  }
})

test('Human, Mathematics, and Experimental catalog additions remain isolated', () => {
  const sourceKeys = new Set<string>()
  for (const [scope, records] of Object.entries(theoreticalCurriculumFieldCatalogs)) {
    assert.ok(records.length > 0)
    for (const record of records) {
      assert.ok(record.ref.startsWith(`${scope}.`), `${record.ref} escaped ${scope}`)
      assert.equal(sourceKeys.has(record.sourceRecordKey), false, `Duplicate field source key ${record.sourceRecordKey}`)
      sourceKeys.add(record.sourceRecordKey)
    }
  }
})

test('audit rejects future shared-subject ownership clones', () => {
  const source = theoreticalCurriculumCatalog.find((record) => record.ref === 'shared.g10.persian')
  assert.ok(source)
  const report = audit([
    ...theoreticalCurriculumCatalog,
    {
      ...source,
      ref: 'experimental.g10.invalid-persian-clone',
      sourceRecordKey: 'src-00000000-0000-4000-8000-000000000001',
      parentRef: 'experimental.g10',
    },
  ])
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((item) => item.code === 'DUPLICATED_SHARED_OWNERSHIP'))
})

test('audit rejects duplicate keys, orphan nodes, and cross-scope ownership', () => {
  const source = theoreticalCurriculumCatalog.find((record) => record.ref === 'human.g10.logic')
  assert.ok(source)
  const report = audit([
    ...theoreticalCurriculumCatalog,
    { ...source, ref: 'human.g10.duplicate-key' },
    {
      ...source,
      ref: 'mathematics.g10.cross-scope',
      sourceRecordKey: 'src-00000000-0000-4000-8000-000000000002',
      parentRef: 'human.g10',
    },
    {
      ...source,
      ref: 'human.g10.orphan',
      sourceRecordKey: 'src-00000000-0000-4000-8000-000000000003',
      parentRef: 'human.g10.missing',
    },
  ])
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((item) => item.code === 'DUPLICATE_SOURCE_KEY'))
  assert.ok(report.issues.some((item) => item.code === 'DUPLICATE_SUBJECT_OWNERSHIP'))
  assert.ok(report.issues.some((item) => item.code === 'SUBJECT_GRADE_PREFIX'))
  assert.ok(report.issues.some((item) => item.code === 'MISSING_PARENT'))
})

test('checked-in freeze manifest exactly matches the audited candidate', async () => {
  const stored = JSON.parse(await readFile(
    new URL('../../../docs/curriculum/CURRICULUM_FREEZE_MANIFEST.json', import.meta.url),
    'utf8',
  )) as unknown
  assert.deepEqual(stored, theoreticalCurriculumFreezeManifest)
  assert.equal(theoreticalCurriculumFreezeManifest.status, 'CANDIDATE_NOT_FROZEN')
  assert.equal(theoreticalCurriculumFreezeManifest.curriculumVersionIdentifier, null)
  assert.equal(theoreticalCurriculumFreezeManifest.source.artifactSha256, null)
  assert.equal(theoreticalCurriculumFreezeManifest.source.transcriptionSha256, null)
  assert.match(theoreticalCurriculumFreezeManifest.catalogSha256, /^[a-f0-9]{64}$/)
  assert.equal(theoreticalCurriculumFreezeManifest.subjectList.length, 56)
})

test('checked-in audit report exactly matches the generated report', async () => {
  const stored = JSON.parse(await readFile(
    new URL('../../../docs/curriculum/CURRICULUM_AUDIT_REPORT.json', import.meta.url),
    'utf8',
  )) as unknown
  assert.deepEqual(stored, theoreticalCurriculumAuditReport)
})
