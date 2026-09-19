import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildCurriculumImportManifest,
  createCurriculumAmbiguityReport,
  curriculumManifestPayloadChecksum,
  validateCurriculumImportManifest,
  validateCurriculumManifestProvenance,
} from '../src/curriculum/import-manifest.js'
import type { CurriculumImportManifestDraft, CurriculumManifestRecord } from '../src/curriculum/types.js'

const sourceArtifact = Buffer.from('reviewed cori.docx fixture bytes')
const transcription = Buffer.from('# Reviewed canonical transcription\n', 'utf8')
const provenance = { sourceArtifact, sourceArtifactName: 'cori.docx', transcription }

const draft = (): CurriculumImportManifestDraft => ({
  expectedRevision: 0,
  idempotencyKey: 'initial-curriculum-v1',
  records: [
    {
      displayLabel: 'برنامه درسی کنکوریکس',
      proposedNodeTypeCode: 'CURRICULUM_ROOT',
      rawText: 'برنامه درسی کنکوریکس',
      sourceLocator: 'reviewed-transcription:root',
      sourceOrder: 0,
      sourceRecordKey: 'src.root.001',
    },
    {
      ambiguityMarkers: ['STAR_MARKER_UNRESOLVED', 'BRIDGING_SKILLS_OWNERSHIP_UNRESOLVED'],
      displayLabel: 'مهارت‌ها و مباحث پیوندی ⭐',
      rawText: 'مهارت‌ها و مباحث پیوندی ⭐',
      sourceLocator: 'reviewed-transcription:source-tree:chemistry-bridging-skills',
      sourceOrder: 1,
      sourceRecordKey: 'src.chemistry.bridging.001',
    },
  ],
  transcriptionId: 'CANONICAL_CURRICULUM.md@reviewed-fixture',
})

test('manifest builder creates deterministic record, payload, and envelope checksums', () => {
  const first = buildCurriculumImportManifest(draft(), provenance)
  const second = buildCurriculumImportManifest(draft(), provenance)

  assert.deepEqual(first, second)
  assert.equal(validateCurriculumImportManifest(first).valid, true)
  assert.equal(first.records[1]?.displayLabel, 'مهارت‌ها و مباحث پیوندی ⭐')
  assert.equal(first.records[1]?.rawText, 'مهارت‌ها و مباحث پیوندی ⭐')
})

test('manifest payload checksums are key-order stable and preserve exact Persian source text', () => {
  const manifest = buildCurriculumImportManifest(draft(), provenance)
  const first = manifest.records[1]!
  const reordered = {
    sourceRecordKey: first.sourceRecordKey,
    sourceOrder: first.sourceOrder,
    sourceLocator: first.sourceLocator,
    rawText: first.rawText,
    proposedNodeTypeCode: first.proposedNodeTypeCode,
    displayLabel: first.displayLabel,
    checksum: first.checksum,
    ambiguityMarkers: first.ambiguityMarkers,
  } satisfies CurriculumManifestRecord

  assert.equal(curriculumManifestPayloadChecksum([first]), curriculumManifestPayloadChecksum([reordered]))
  assert.notEqual(
    curriculumManifestPayloadChecksum([first]),
    curriculumManifestPayloadChecksum([{ ...first, rawText: 'مهارت ها و مباحث پیوندی ⭐' }]),
  )
})

test('manifest validation rejects tampering at record, payload, and envelope boundaries', () => {
  const manifest = buildCurriculumImportManifest(draft(), provenance)
  const tampered = structuredClone(manifest)
  tampered.records[0]!.rawText = 'متن تغییر یافته'

  const report = validateCurriculumImportManifest(tampered)
  assert.equal(report.valid, false)
  assert.deepEqual(
    new Set(report.issues.map((entry) => entry.code)),
    new Set(['RECORD_CHECKSUM_MISMATCH', 'PAYLOAD_CHECKSUM_MISMATCH', 'MANIFEST_CHECKSUM_MISMATCH']),
  )
})

test('manifest validation requires explicit quarantine instead of inferring missing structure', () => {
  const noParent = draft()
  noParent.records[1] = {
    displayLabel: 'فصل بدون والد',
    proposedNodeTypeCode: 'CHAPTER',
    rawText: 'فصل بدون والد',
    sourceLocator: 'reviewed-transcription:orphan',
    sourceOrder: 1,
    sourceRecordKey: 'src.orphan.001',
  }
  const unmarkedStar = draft()
  unmarkedStar.records[1] = {
    ambiguityMarkers: ['BRIDGING_SKILLS_OWNERSHIP_UNRESOLVED'],
    displayLabel: 'مهارت‌ها و مباحث پیوندی ⭐',
    rawText: 'مهارت‌ها و مباحث پیوندی ⭐',
    sourceLocator: 'reviewed-transcription:star',
    sourceOrder: 1,
    sourceRecordKey: 'src.star.001',
  }

  assert.ok(validateCurriculumImportManifest(buildCurriculumImportManifest(noParent, provenance)).issues
    .some((entry) => entry.code === 'CANONICAL_PARENT_REQUIRED'))
  assert.ok(validateCurriculumImportManifest(buildCurriculumImportManifest(unmarkedStar, provenance)).issues
    .some((entry) => entry.code === 'STAR_MARKER_NOT_QUARANTINED'))
})

test('provenance validation binds the exact source artifact and reviewed transcription bytes', () => {
  const manifest = buildCurriculumImportManifest(draft(), provenance)
  assert.deepEqual(validateCurriculumManifestProvenance(manifest, provenance), [])
  assert.deepEqual(
    validateCurriculumManifestProvenance(manifest, {
      ...provenance,
      transcription: Buffer.from('# changed transcription\n', 'utf8'),
    }).map((entry) => entry.code),
    ['TRANSCRIPTION_CHECKSUM_MISMATCH'],
  )
})

test('ambiguity reports retain exact labels, source locators, and unresolved markers', () => {
  const manifest = buildCurriculumImportManifest(draft(), provenance)
  const report = createCurriculumAmbiguityReport(manifest)

  assert.equal(report.unresolvedRecordCount, 1)
  assert.equal(report.records[0]?.displayLabel, 'مهارت‌ها و مباحث پیوندی ⭐')
  assert.equal(report.markerCounts.STAR_MARKER_UNRESOLVED, 1)
  assert.equal(report.markerCounts.BRIDGING_SKILLS_OWNERSHIP_UNRESOLVED, 1)
})

test('idempotency identity is stable for identical evidence and changes with provenance', () => {
  const first = buildCurriculumImportManifest(draft(), provenance)
  const same = buildCurriculumImportManifest(draft(), provenance)
  const changed = buildCurriculumImportManifest(draft(), {
    ...provenance,
    transcription: Buffer.from('# another reviewed transcription\n', 'utf8'),
  })

  assert.equal(first.manifestChecksum, same.manifestChecksum)
  assert.equal(first.payloadChecksum, same.payloadChecksum)
  assert.notEqual(first.manifestChecksum, changed.manifestChecksum)
  assert.equal(first.payloadChecksum, changed.payloadChecksum)
})
