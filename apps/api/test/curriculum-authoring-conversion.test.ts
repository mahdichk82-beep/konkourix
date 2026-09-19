import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { stringify } from 'yaml'
import { convertCurriculumAuthoringYaml } from '../src/curriculum/authoring-conversion.js'
import {
  curriculumImportManifestSchema,
  curriculumSourceArtifactChecksum,
  validateCurriculumImportManifest,
} from '../src/curriculum/import-manifest.js'

const sourceArtifact = new TextEncoder().encode('isolated fixture source bytes')
const transcription = new TextEncoder().encode('isolated fixture reviewed transcription bytes')
const provenance = { sourceArtifactName: 'cori.docx', sourceArtifact, transcription }

type FixtureRecord = {
  source_record_key: string
  record_kind: string
  raw_text: string
  display_label: string
  source_locator: string
  source_order: number
  proposed_node_type: string | null
  parent_source_record_key: string | null
  ambiguity_markers: string[]
  structural_hints: Record<string, unknown>
  editor_notes: string[]
  [key: string]: unknown
}

const rootKey = 'src-fixture-root-01'
const childKey = 'src-fixture-child-02'
const ambiguousKey = 'src-fixture-unresolved-03'

const fixture = () => ({
  format_version: 'konkourix-curriculum-authoring/v1',
  document_key: 'authoring-fixture-01',
  status: 'AUTHORING_REVIEWED',
  coverage_status: 'COMPLETE',
  source: {
    artifact_name: 'cori.docx',
    artifact_sha256: curriculumSourceArtifactChecksum(sourceArtifact),
    transcription_id: 'fixture-transcription-reviewed-v1',
    transcription_sha256: curriculumSourceArtifactChecksum(transcription),
  },
  target: { expected_draft_revision: 0, idempotency_key: 'fixture-import-intent-01' },
  records: [
    {
      source_record_key: rootKey,
      record_kind: 'NODE_CANDIDATE',
      raw_text: 'ریشهٔ آزمایشی',
      display_label: 'ریشهٔ آزمایشی',
      source_locator: 'fixture:L1',
      source_order: 0,
      proposed_node_type: 'CURRICULUM_ROOT',
      parent_source_record_key: null,
      ambiguity_markers: [],
      structural_hints: {},
      editor_notes: ['This is a test-only editorial note'],
    },
    {
      source_record_key: childKey,
      record_kind: 'NODE_CANDIDATE',
      raw_text: 'فصل ۱ ـ  متنِ دقیق',
      display_label: 'فصل ۱ ـ  متنِ دقیق',
      source_locator: 'fixture:L2',
      source_order: 1,
      proposed_node_type: 'CHAPTER',
      parent_source_record_key: rootKey,
      ambiguity_markers: [],
      structural_hints: {},
      editor_notes: [],
    },
    {
      source_record_key: ambiguousKey,
      record_kind: 'AMBIGUOUS_SOURCE',
      raw_text: 'عبارت نامشخص',
      display_label: 'عبارت نامشخص',
      source_locator: 'fixture:L3',
      source_order: 2,
      proposed_node_type: null,
      parent_source_record_key: null,
      ambiguity_markers: ['STRUCTURAL_LEVEL_UNRESOLVED', 'CANONICAL_PARENT_UNRESOLVED'],
      structural_hints: { candidate_type_codes: ['TOPIC'] },
      editor_notes: ['Reviewer context must not become node content'],
    },
  ] as FixtureRecord[],
  relationship_proposals: [{
    proposal_key: 'rel-fixture-01',
    type: 'APPLICABILITY',
    source_record_key: rootKey,
    target_record_keys: [childKey],
    source_evidence: 'fixture:L1-L2',
    rationale: 'Isolated reviewed fixture relationship',
    ambiguity_markers: [],
  }],
  authoring_review: {
    prepared_by: 'fixture-editor',
    prepared_at: '2026-09-18T08:00:00Z',
    preparation_reason: 'Isolated conversion fixture',
    reviewed_by: 'fixture-independent-reviewer',
    reviewed_at: '2026-09-19T08:00:00Z',
    review_outcome: 'ACCEPTED_FOR_MANIFEST',
    review_notes: ['Fixture review only'],
    source_reconciliation_reference: 'fixture:whole-source-reconciliation',
  },
  review_history: [],
})

const convert = (document = fixture(), supplied = provenance) =>
  convertCurriculumAuthoringYaml(stringify(document), supplied)

const codes = (document = fixture(), supplied = provenance): Set<string> =>
  new Set(convert(document, supplied).report.readinessFailures.map((failure) => failure.code))

test('reviewed source-bound authoring converts through the existing Manifest v1 builder and schema', () => {
  const { manifest, report } = convert()
  assert.ok(manifest)
  assert.equal(report.ready, true)
  assert.deepEqual(report.readinessFailures, [])
  assert.equal(report.sourceRecordCount, 3)
  assert.equal(report.convertedRecordCount, 3)
  assert.equal(report.quarantinedRecordCount, 1)
  assert.equal(report.relationshipProposalCountExcluded, 1)
  assert.equal(curriculumImportManifestSchema.safeParse(manifest).success, true)
  assert.equal(validateCurriculumImportManifest(manifest).valid, true)
})

test('exact source fields and ambiguity survive; editor and relationship data do not enter Manifest v1', () => {
  const document = fixture()
  const { manifest } = convert(document)
  assert.ok(manifest)
  assert.deepEqual(manifest.records.map((record) => ({
    sourceRecordKey: record.sourceRecordKey,
    rawText: record.rawText,
    displayLabel: record.displayLabel,
    sourceLocator: record.sourceLocator,
    sourceOrder: record.sourceOrder,
  })), document.records.map((record) => ({
    sourceRecordKey: record.source_record_key,
    rawText: record.raw_text,
    displayLabel: record.display_label,
    sourceLocator: record.source_locator,
    sourceOrder: record.source_order,
  })))
  assert.deepEqual(manifest.records[2]?.ambiguityMarkers, document.records[2]?.ambiguity_markers)
  assert.deepEqual(manifest.records[2]?.structuralHints, document.records[2]?.structural_hints)
  assert.equal(JSON.stringify(manifest).includes('relationship_proposals'), false)
  assert.equal(JSON.stringify(manifest).includes('editor_notes'), false)
  assert.equal(JSON.stringify(manifest).includes('authoring_review'), false)
})

test('identical authoring and provenance bytes yield identical record, payload, and manifest checksums', () => {
  const firstResult = convert()
  const secondResult = convert()
  const first = firstResult.manifest
  const second = secondResult.manifest
  assert.ok(first && second)
  assert.deepEqual(first, second)
  assert.deepEqual(firstResult.report, secondResult.report)
  assert.deepEqual(first.records.map((record) => record.checksum), second.records.map((record) => record.checksum))
  const changed = fixture()
  changed.records[1]!.raw_text += '!'
  changed.records[1]!.display_label += '!'
  const changedManifest = convert(changed).manifest
  assert.ok(changedManifest)
  assert.notEqual(first.records[1]?.checksum, changedManifest.records[1]?.checksum)
  assert.notEqual(first.payloadChecksum, changedManifest.payloadChecksum)
  assert.notEqual(first.manifestChecksum, changedManifest.manifestChecksum)
})

test('source record order changes the ordered payload checksum', () => {
  const first = convert().manifest
  const changed = fixture()
  const second = changed.records[1]!
  const third = changed.records[2]!
  changed.records.splice(1, 2, { ...third, source_order: 1 }, { ...second, source_order: 2 })
  const reordered = convert(changed).manifest
  assert.ok(first && reordered)
  assert.notEqual(first.payloadChecksum, reordered.payloadChecksum)
  assert.notEqual(first.manifestChecksum, reordered.manifestChecksum)
})

test('DRAFT authoring is valid authoring but is not conversion-ready', () => {
  const document = fixture()
  document.status = 'DRAFT'
  document.authoring_review.reviewed_by = null as never
  document.authoring_review.reviewed_at = null as never
  document.authoring_review.review_outcome = null as never
  assert.ok(codes(document).has('AUTHORING_REVIEW_REQUIRED'))
  assert.equal(convert(document).manifest, null)
})

test('PARTIAL coverage blocks initial whole-source conversion', () => {
  const document = fixture()
  document.coverage_status = 'PARTIAL'
  assert.ok(codes(document).has('COMPLETE_COVERAGE_REQUIRED'))
})

test('missing review evidence blocks conversion', () => {
  const document = fixture()
  document.authoring_review.source_reconciliation_reference = null as never
  assert.ok(codes(document).has('REVIEW_EVIDENCE_MISSING'))
})

test('actual source artifact and transcription bytes must match reviewed checksums', () => {
  const changedArtifact = { ...provenance, sourceArtifact: new TextEncoder().encode('modified source bytes') }
  const changedTranscription = { ...provenance, transcription: new TextEncoder().encode('modified transcription') }
  assert.ok(codes(fixture(), changedArtifact).has('SOURCE_ARTIFACT_CHECKSUM_MISMATCH'))
  assert.ok(codes(fixture(), changedTranscription).has('TRANSCRIPTION_CHECKSUM_MISMATCH'))
})

test('reviewed provenance edits and source-name mismatches fail closed', () => {
  const document = fixture()
  document.source.artifact_sha256 = 'a'.repeat(64)
  assert.ok(codes(document).has('SOURCE_ARTIFACT_CHECKSUM_MISMATCH'))
  assert.ok(codes(fixture(), { ...provenance, sourceArtifactName: 'other.docx' }).has('SOURCE_ARTIFACT_NAME_MISMATCH'))
})

test('template placeholders anywhere in reviewed authoring block conversion', () => {
  const document = fixture()
  document.authoring_review.review_notes.push('<review finding>')
  assert.ok(codes(document).has('AUTHORING_PLACEHOLDER_REMAINS'))
})

test('reviewed metadata is never silently trimmed by the manifest builder', () => {
  const document = fixture()
  document.source.transcription_id = ' fixture-transcription-reviewed-v1 '
  assert.ok(codes(document).has('AUTHORING_METADATA_WHITESPACE'))
})

test('invalid and duplicate source keys or orders block conversion', () => {
  const badKey = fixture()
  badKey.records[1]!.source_record_key = 'bad key'
  assert.ok(codes(badKey).has('SOURCE_RECORD_KEY_INVALID'))
  const duplicateKey = fixture()
  duplicateKey.records[1]!.source_record_key = rootKey
  assert.ok(codes(duplicateKey).has('SOURCE_RECORD_KEY_DUPLICATE'))
  const badOrder = fixture()
  badOrder.records[1]!.source_order = -1
  assert.ok(codes(badOrder).has('SOURCE_ORDER_INVALID'))
  const duplicateOrder = fixture()
  duplicateOrder.records[1]!.source_order = 0
  assert.ok(codes(duplicateOrder).has('SOURCE_ORDER_DUPLICATE'))
})

test('broken parent, unsupported type, and malformed ambiguity cannot convert', () => {
  const badParent = fixture()
  badParent.records[1]!.parent_source_record_key = 'src-missing'
  assert.ok(codes(badParent).has('PARENT_NOT_FOUND'))
  const badType = fixture()
  badType.records[1]!.proposed_node_type = 'LESSON'
  assert.ok(codes(badType).has('NODE_TYPE_INVALID'))
  const badMarker = fixture()
  badMarker.records[2]!.ambiguity_markers = ['UNREVIEWED_ISSUE']
  assert.ok(codes(badMarker).has('AMBIGUITY_CODE_INVALID'))
})

test('display labels are checked for NFC without normalizing source text', () => {
  const document = fixture()
  document.records[1]!.display_label = 'Cafe\u0301'
  assert.ok(codes(document).has('DISPLAY_LABEL_NOT_NFC'))
  assert.equal(document.records[1]!.display_label, 'Cafe\u0301')
})

test('canonical IDs and unsupported record fields cannot be smuggled into output', () => {
  const canonicalId = fixture()
  canonicalId.records[0]!.curriculum_node_id = 'con-manual'
  assert.ok(codes(canonicalId).has('CURRICULUM_NODE_ID_FORBIDDEN'))
  const unsupported = fixture()
  unsupported.records[0]!.unapprovedManifestField = 'value'
  assert.ok(codes(unsupported).has('UNSUPPORTED_AUTHORING_RECORD_FIELD'))
  const unsafeHint = fixture()
  unsafeHint.records[0]!.structural_hints.editor_notes = ['Do not copy']
  assert.ok(codes(unsafeHint).has('UNSAFE_STRUCTURAL_HINT'))
})

test('Manifest v1 schema rejects a projected value outside its contract', () => {
  const document = fixture()
  document.target.idempotency_key = 'short'
  assert.ok(codes(document).has('MANIFEST_SCHEMA_INVALID'))
  assert.equal(convert(document).manifest, null)
})

test('source notes remain quarantined transport records without inferred node types', () => {
  const document = fixture()
  document.records[2]!.record_kind = 'SOURCE_NOTE'
  document.records[2]!.ambiguity_markers = ['SOURCE_NOTE_NOT_EDUCATIONAL_NODE']
  const { manifest, report } = convert(document)
  assert.ok(manifest)
  assert.equal(report.quarantinedRecordCount, 1)
  assert.equal(manifest.records[2]?.proposedNodeTypeCode, null)
  assert.deepEqual(manifest.records[2]?.ambiguityMarkers, ['SOURCE_NOTE_NOT_EDUCATIONAL_NODE'])
})

test('offline build CLI writes a valid manifest and deterministic conversion report', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'konkourx-authoring-conversion-'))
  try {
    const authoringPath = join(directory, 'reviewed.curriculum.yaml')
    const sourcePath = join(directory, 'cori.docx')
    const transcriptionPath = join(directory, 'transcription.md')
    const outputPath = join(directory, 'manifest.json')
    const scriptPath = fileURLToPath(new URL('../src/scripts/prepare-curriculum-import.ts', import.meta.url))
    await Promise.all([
      writeFile(authoringPath, stringify(fixture()), 'utf8'),
      writeFile(sourcePath, sourceArtifact),
      writeFile(transcriptionPath, transcription),
    ])
    const command = spawnSync(process.execPath, [
      '--import', 'tsx', scriptPath, 'build',
      '--draft', authoringPath,
      '--source-artifact', sourcePath,
      '--transcription', transcriptionPath,
      '--out', outputPath,
      '--report-dir', directory,
    ], { encoding: 'utf8', cwd: fileURLToPath(new URL('../', import.meta.url)) })
    assert.equal(command.status, 0, command.stderr)
    const manifest = JSON.parse(await readFile(outputPath, 'utf8')) as unknown
    const report = JSON.parse(await readFile(join(directory, 'curriculum-authoring-conversion.json'), 'utf8')) as { ready: boolean }
    assert.equal(curriculumImportManifestSchema.safeParse(manifest).success, true)
    assert.equal(report.ready, true)
  } finally {
    assert.equal(dirname(resolve(directory)), resolve(tmpdir()))
    await rm(directory, { recursive: true, force: true })
  }
})
