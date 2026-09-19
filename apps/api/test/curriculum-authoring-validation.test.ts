import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createCurriculumAuthoringAuditReport,
  validateCurriculumAuthoringYaml,
} from '../src/curriculum/authoring-validation.js'

const sha = 'a'.repeat(64)

const validYaml = (records: string, overrides = ''): string => `
format_version: "konkourix-curriculum-authoring/v1"
document_key: "auth-01990000-0000-7000-8000-000000000001"
status: "DRAFT"
coverage_status: "PARTIAL"
source:
  artifact_name: "cori.docx"
  artifact_sha256: "${sha}"
  transcription_id: "CANONICAL_CURRICULUM.md#reviewed"
  transcription_sha256: "${sha}"
target:
  expected_draft_revision: 0
  idempotency_key: "authoring-test-key"
records:
${records}
relationship_proposals: []
authoring_review:
  prepared_by: null
  prepared_at: null
  preparation_reason: null
  reviewed_by: null
  reviewed_at: null
  review_outcome: null
  review_notes: []
  source_reconciliation_reference: null
review_history: []
${overrides}`

const root = `  - source_record_key: "src-01990000-0000-7000-8000-000000000001"
    record_kind: "NODE_CANDIDATE"
    raw_text: "برنامه درسی"
    display_label: "برنامه درسی"
    source_locator: "fixture:L1"
    source_order: 0
    proposed_node_type: "CURRICULUM_ROOT"
    parent_source_record_key: null
    ambiguity_markers: []`

const field = `  - source_record_key: "src-01990000-0000-7000-8000-000000000002"
    record_kind: "NODE_CANDIDATE"
    raw_text: "رشته علوم تجربی"
    display_label: "رشته علوم تجربی"
    source_locator: "fixture:L2"
    source_order: 1
    proposed_node_type: "FIELD"
    parent_source_record_key: "src-01990000-0000-7000-8000-000000000001"
    ambiguity_markers: []`

test('valid authoring YAML passes every validation check', () => {
  const report = validateCurriculumAuthoringYaml(validYaml(`${root}\n${field}`))
  assert.deepEqual(report.failures, [])
  assert.deepEqual(report.warnings, [])
  assert.equal(report.recordCount, 2)
  assert.equal(report.passedChecks.length, 13)
})

test('duplicate source keys fail validation', () => {
  const duplicate = field.replace('src-01990000-0000-7000-8000-000000000002', 'src-01990000-0000-7000-8000-000000000001')
  const report = validateCurriculumAuthoringYaml(validYaml(`${root}\n${duplicate}`))
  assert.ok(report.failures.some((entry) => entry.code === 'SOURCE_RECORD_KEY_DUPLICATE'))
})

test('duplicate source orders fail validation', () => {
  const report = validateCurriculumAuthoringYaml(validYaml(`${root}\n${field.replace('source_order: 1', 'source_order: 0')}`))
  assert.ok(report.failures.some((entry) => entry.code === 'SOURCE_ORDER_DUPLICATE'))
})

test('unsupported record kinds fail validation', () => {
  const report = validateCurriculumAuthoringYaml(validYaml(root.replace('NODE_CANDIDATE', 'INFERRED_NODE')))
  assert.ok(report.failures.some((entry) => entry.code === 'RECORD_KIND_INVALID'))
})

test('root cannot have a parent', () => {
  const report = validateCurriculumAuthoringYaml(validYaml(root.replace(
    'parent_source_record_key: null',
    'parent_source_record_key: "src-01990000-0000-7000-8000-000000000001"',
  )))
  assert.ok(report.failures.some((entry) => entry.code === 'ROOT_PARENT_FORBIDDEN'))
})

test('invalid node type fails validation', () => {
  const report = validateCurriculumAuthoringYaml(validYaml(root.replace('CURRICULUM_ROOT', 'LESSON')))
  assert.ok(report.failures.some((entry) => entry.code === 'NODE_TYPE_INVALID'))
})

test('broken parent reference fails validation', () => {
  const report = validateCurriculumAuthoringYaml(validYaml(`${root}\n${field.replace(
    'src-01990000-0000-7000-8000-000000000001',
    'src-01990000-0000-7000-8000-999999999999',
  )}`))
  assert.ok(report.failures.some((entry) => entry.code === 'PARENT_NOT_FOUND'))
})

test('wrong format version fails validation', () => {
  const report = validateCurriculumAuthoringYaml(validYaml(root).replace(
    'konkourix-curriculum-authoring/v1',
    'konkourix-curriculum-authoring/v2',
  ))
  assert.ok(report.failures.some((entry) => entry.code === 'FORMAT_VERSION_INVALID'))
})

test('records outside strictly increasing source order fail validation', () => {
  const outOfOrderRoot = root.replace('source_order: 0', 'source_order: 2')
  const report = validateCurriculumAuthoringYaml(validYaml(`${outOfOrderRoot}\n${field}`))
  assert.ok(report.failures.some((entry) => entry.code === 'SOURCE_ORDER_NOT_STRICTLY_INCREASING'))
  assert.ok(report.failures.some((entry) => entry.code === 'PARENT_MUST_APPEAR_EARLIER'))
})

test('ambiguity markers quarantine and warn without rejecting the document', () => {
  const ambiguous = `  - source_record_key: "src-01990000-0000-7000-8000-000000000003"
    record_kind: "AMBIGUOUS_SOURCE"
    raw_text: "متن نامشخص"
    display_label: "متن نامشخص"
    source_locator: "fixture:L3"
    source_order: 0
    proposed_node_type: null
    parent_source_record_key: null
    ambiguity_markers:
      - "STRUCTURAL_LEVEL_UNRESOLVED"`
  const report = validateCurriculumAuthoringYaml(validYaml(ambiguous))
  assert.deepEqual(report.failures, [])
  assert.equal(report.ambiguityCount, 1)
  assert.ok(report.warnings.some((entry) => entry.code === 'AMBIGUITY_QUARANTINED'))
})

test('incomplete source metadata warns without calculating missing hashes', () => {
  const yaml = validYaml(root)
    .replace(`  artifact_sha256: "${sha}"`, '  artifact_sha256: null')
    .replace('  transcription_id: "CANONICAL_CURRICULUM.md#reviewed"', '  transcription_id: null')
    .replace(`  transcription_sha256: "${sha}"`, '  transcription_sha256: null')
  const validation = validateCurriculumAuthoringYaml(yaml, 'fixture.curriculum.yaml')
  assert.deepEqual(validation.failures, [])
  assert.equal(validation.warnings.filter((entry) => entry.code === 'SOURCE_METADATA_INCOMPLETE').length, 3)
  assert.deepEqual(validation.declaredChecksums, { artifactSha256: null, transcriptionSha256: null })

  const audit = createCurriculumAuthoringAuditReport([
    { content: new TextEncoder().encode(yaml), file: 'fixture.curriculum.yaml' },
  ], '2026-09-19T00:00:00.000Z')
  assert.equal(audit.valid, true)
  assert.equal(audit.checksumSummary.files[0]?.artifactSha256, null)
  assert.match(audit.checksumSummary.files[0]?.fileSha256 ?? '', /^[0-9a-f]{64}$/)
})

test('DRAFT/PARTIAL with null source checksums is a valid authoring state', () => {
  const yaml = validYaml('  []')
    .replace(`  artifact_sha256: "${sha}"`, '  artifact_sha256: null')
    .replace(`  transcription_sha256: "${sha}"`, '  transcription_sha256: null')
  const report = validateCurriculumAuthoringYaml(yaml)
  assert.deepEqual(report.failures, [])
})

test('valid relationship proposal remains separate authoring data', () => {
  const proposal = `relationship_proposals:
  - proposal_key: "rel-01990000-0000-7000-8000-000000000001"
    type: "APPLICABILITY"
    source_record_key: "src-01990000-0000-7000-8000-000000000001"
    target_record_keys:
      - "src-01990000-0000-7000-8000-000000000002"
    source_evidence: "fixture:L1-L2"
    rationale: "Reviewed explicit source relationship"
    ambiguity_markers: []`
  const report = validateCurriculumAuthoringYaml(validYaml(`${root}\n${field}`).replace('relationship_proposals: []', proposal))
  assert.deepEqual(report.failures, [])
  assert.equal(report.recordCount, 2)
})

test('relationship proposals cannot introduce a second parent', () => {
  const yaml = validYaml(root).replace('relationship_proposals: []', `relationship_proposals:
  - proposal_key: "rel-1"
    type: "APPLICABILITY"
    source_record_key: "src-01990000-0000-7000-8000-000000000001"
    target_record_keys: ["src-01990000-0000-7000-8000-000000000002"]
    source_evidence: "fixture:L1"
    rationale: "reviewed"
    ambiguity_markers: []
    parent_source_record_key: "src-01990000-0000-7000-8000-000000000002"`)
  const report = validateCurriculumAuthoringYaml(yaml)
  assert.ok(report.failures.some((entry) => entry.code === 'RELATIONSHIP_PARENT_FORBIDDEN'))
})

test('reviewed document with complete source and independent review evidence passes', () => {
  const yaml = validYaml(root)
    .replace('status: "DRAFT"', 'status: "AUTHORING_REVIEWED"')
    .replace('coverage_status: "PARTIAL"', 'coverage_status: "COMPLETE"')
    .replace('prepared_by: null', 'prepared_by: "editor-1"')
    .replace('prepared_at: null', 'prepared_at: "2026-09-18T08:00:00Z"')
    .replace('preparation_reason: null', 'preparation_reason: "Source reconciliation"')
    .replace('reviewed_by: null', 'reviewed_by: "reviewer-2"')
    .replace('reviewed_at: null', 'reviewed_at: "2026-09-19T08:00:00Z"')
    .replace('review_outcome: null', 'review_outcome: "ACCEPTED_FOR_MANIFEST"')
    .replace('source_reconciliation_reference: null', 'source_reconciliation_reference: "fixture:whole-source-audit"')
  const report = validateCurriculumAuthoringYaml(yaml)
  assert.deepEqual(report.failures, [])
})

test('reviewed status without review evidence or checksums fails', () => {
  const yaml = validYaml(root)
    .replace('status: "DRAFT"', 'status: "AUTHORING_REVIEWED"')
    .replace(`  artifact_sha256: "${sha}"`, '  artifact_sha256: null')
  const report = validateCurriculumAuthoringYaml(yaml)
  const codes = new Set(report.failures.map((entry) => entry.code))
  assert.ok(codes.has('REVIEW_EVIDENCE_MISSING'))
  assert.ok(codes.has('REVIEWED_SOURCE_INCOMPLETE'))
  assert.ok(codes.has('REVIEWED_COVERAGE_INCOMPLETE'))
})

test('accepted child cannot depend on a quarantined parent', () => {
  const unresolvedRoot = root.replace('ambiguity_markers: []', 'ambiguity_markers: [CURRICULUM_VERSION_METADATA_MISSING]')
  const report = validateCurriculumAuthoringYaml(validYaml(`${unresolvedRoot}\n${field}`))
  assert.ok(report.failures.some((entry) => entry.code === 'ACCEPTED_CHILD_OF_QUARANTINED_PARENT'))
})

test('undocumented ambiguity markers and source notes without quarantine fail', () => {
  const invalid = root.replace('NODE_CANDIDATE', 'SOURCE_NOTE')
    .replace('proposed_node_type: "CURRICULUM_ROOT"', 'proposed_node_type: null')
    .replace('ambiguity_markers: []', 'ambiguity_markers: [UNKNOWN_ISSUE]')
  const report = validateCurriculumAuthoringYaml(validYaml(invalid))
  assert.ok(report.failures.some((entry) => entry.code === 'AMBIGUITY_CODE_INVALID'))
  assert.ok(report.failures.some((entry) => entry.code === 'SOURCE_NOTE_QUARANTINE_REQUIRED'))
})

test('a documented source note stays quarantined without becoming a node', () => {
  const note = root.replace('NODE_CANDIDATE', 'SOURCE_NOTE')
    .replace('proposed_node_type: "CURRICULUM_ROOT"', 'proposed_node_type: null')
    .replace('ambiguity_markers: []', 'ambiguity_markers: [SOURCE_NOTE_NOT_EDUCATIONAL_NODE]')
  const report = validateCurriculumAuthoringYaml(validYaml(note))
  assert.deepEqual(report.failures, [])
  assert.equal(report.ambiguityCount, 1)
})

test('a star must remain explicitly unresolved', () => {
  const starred = root.replace('raw_text: ', 'raw_text: "⭐ " # ')
  const report = validateCurriculumAuthoringYaml(validYaml(starred))
  assert.ok(report.failures.some((entry) => entry.code === 'STAR_MARKER_REQUIRED'))
})

test('review history requires complete retained review evidence', () => {
  const yaml = validYaml(root).replace('review_history: []', 'review_history: [{}]')
  const report = validateCurriculumAuthoringYaml(yaml)
  assert.ok(report.failures.some((entry) => entry.code === 'REVIEW_EVIDENCE_MISSING'))
})

test('source record keys are unique across scanned authoring files', () => {
  const content = new TextEncoder().encode(validYaml(root))
  const report = createCurriculumAuthoringAuditReport([
    { content, file: 'a.curriculum.yaml' },
    { content, file: 'b.curriculum.yaml' },
  ], '2026-09-19T00:00:00.000Z')
  assert.equal(report.valid, false)
  assert.equal(report.failedChecks.byCode.SOURCE_RECORD_KEY_DUPLICATE_ACROSS_FILES, 1)
  assert.equal(report.documentCount, 2)
  assert.equal(report.lifecycleSummary.byStatus.DRAFT, 2)
})

test('forbidden inferred identity, duplicate parents, and unsupported concepts are reported', () => {
  const inferred = `  - source_record_key: "src-فیزیک-۳"
    curriculum_node_id: "con-manual"
    record_kind: "NODE_CANDIDATE"
    raw_text: ""
    display_label: "فیزیک ۳"
    source_locator: ""
    source_order: 0
    proposed_node_type: "CONCEPT"
    parent_source_record_key: null
    parent_source_record_keys: []
    ambiguity_markers: []`
  const report = validateCurriculumAuthoringYaml(validYaml(inferred))
  const codes = new Set(report.failures.map((entry) => entry.code))
  assert.ok(codes.has('CURRICULUM_NODE_ID_FORBIDDEN'))
  assert.ok(codes.has('LABEL_DERIVED_SOURCE_RECORD_KEY'))
  assert.ok(codes.has('DUPLICATE_PARENT_RELATIONSHIP'))
  assert.ok(codes.has('CONCEPT_SOURCE_SUPPORT_REQUIRED'))
})
