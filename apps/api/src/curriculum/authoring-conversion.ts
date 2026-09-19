import { parseDocument } from 'yaml'
import { validateCurriculumAuthoringYaml } from './authoring-validation.js'
import {
  buildCurriculumImportManifest,
  curriculumSourceArtifactChecksum,
  validateCurriculumImportManifest,
} from './import-manifest.js'
import type { CurriculumImportManifest, CurriculumImportManifestDraft, CurriculumManifestRecordDraft } from './types.js'

export interface AuthoringConversionFailure {
  code: string
  path: string
  message: string
}

export interface AuthoringConversionReport {
  ready: boolean
  sourceRecordCount: number
  convertedRecordCount: number
  quarantinedRecordCount: number
  relationshipProposalCountExcluded: number
  sourceArtifactSha256: string
  transcriptionSha256: string
  payloadChecksum: string | null
  manifestChecksum: string | null
  readinessFailures: AuthoringConversionFailure[]
}

export interface AuthoringConversionResult {
  manifest: CurriculumImportManifest | null
  report: AuthoringConversionReport
}

export interface AuthoringConversionProvenance {
  sourceArtifactName: string
  sourceArtifact: Uint8Array
  transcription: Uint8Array
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const placeholderPattern = /^\s*<[^<>]+>\s*$/
const allowedDocumentFields = new Set([
  'format_version', 'document_key', 'status', 'coverage_status', 'source', 'target',
  'records', 'relationship_proposals', 'authoring_review', 'review_history',
])
const allowedRecordFields = new Set([
  'source_record_key', 'record_kind', 'raw_text', 'display_label', 'source_locator',
  'source_order', 'proposed_node_type', 'parent_source_record_key',
  'ambiguity_markers', 'structural_hints', 'editor_notes',
])
const allowedSourceFields = new Set([
  'artifact_name', 'artifact_sha256', 'transcription_id', 'transcription_sha256',
])
const allowedTargetFields = new Set(['expected_draft_revision', 'idempotency_key'])
const allowedReviewFields = new Set([
  'prepared_by', 'prepared_at', 'preparation_reason', 'reviewed_by', 'reviewed_at',
  'review_outcome', 'review_notes', 'source_reconciliation_reference',
])
const allowedProposalFields = new Set([
  'proposal_key', 'type', 'source_record_key', 'target_record_keys',
  'source_evidence', 'rationale', 'ambiguity_markers',
])
const forbiddenHintFields = new Set([
  'curriculum_node_id', 'curriculumNodeId', 'editor_notes', 'review_notes',
  'relationship_proposals', 'parent_source_record_key', 'parent_source_record_keys',
])

const visit = (value: unknown, path: string, callback: (value: unknown, path: string) => void): void => {
  callback(value, path)
  if (Array.isArray(value)) {
    value.forEach((entry, index) => visit(entry, `${path}[${index}]`, callback))
  } else if (isObject(value)) {
    for (const [key, entry] of Object.entries(value)) {
      visit(entry, path ? `${path}.${key}` : key, callback)
    }
  }
}

export const convertCurriculumAuthoringYaml = (
  yaml: string,
  provenance: AuthoringConversionProvenance,
): AuthoringConversionResult => {
  const sourceArtifactSha256 = curriculumSourceArtifactChecksum(provenance.sourceArtifact)
  const transcriptionSha256 = curriculumSourceArtifactChecksum(provenance.transcription)
  const validation = validateCurriculumAuthoringYaml(yaml)
  const readinessFailures: AuthoringConversionFailure[] = validation.failures.map(({ code, path, message }) => ({
    code, path, message,
  }))
  const fail = (code: string, path: string, message: string): void => {
    readinessFailures.push({ code, path, message })
  }
  let document: unknown
  try {
    document = parseDocument(yaml, { uniqueKeys: true }).toJS({ maxAliasCount: 0 })
  } catch {
    fail('AUTHORING_PARSE_FAILED', '', 'Authoring YAML could not be parsed for conversion')
  }
  const authoring = isObject(document) ? document : null
  const records = authoring && Array.isArray(authoring.records) ? authoring.records : []
  const proposals = authoring && Array.isArray(authoring.relationship_proposals)
    ? authoring.relationship_proposals : []
  const sourceQuarantinedCount = records.filter((record) => isObject(record)
    && Array.isArray(record.ambiguity_markers) && record.ambiguity_markers.length > 0).length

  const report = (manifest: CurriculumImportManifest | null): AuthoringConversionReport => ({
    ready: manifest !== null && readinessFailures.length === 0,
    sourceRecordCount: records.length,
    convertedRecordCount: manifest?.records.length ?? 0,
    quarantinedRecordCount: manifest?.records.filter((record) => (record.ambiguityMarkers?.length ?? 0) > 0).length
      ?? sourceQuarantinedCount,
    relationshipProposalCountExcluded: proposals.length,
    sourceArtifactSha256,
    transcriptionSha256,
    payloadChecksum: manifest?.payloadChecksum ?? null,
    manifestChecksum: manifest?.manifestChecksum ?? null,
    readinessFailures,
  })

  if (!authoring) {
    fail('AUTHORING_DOCUMENT_REQUIRED', '', 'A parsed authoring document is required')
    return { manifest: null, report: report(null) }
  }
  if (authoring.status !== 'AUTHORING_REVIEWED') {
    fail('AUTHORING_REVIEW_REQUIRED', 'status', 'Executable conversion requires AUTHORING_REVIEWED')
  }
  if (authoring.coverage_status !== 'COMPLETE') {
    fail('COMPLETE_COVERAGE_REQUIRED', 'coverage_status', 'Initial whole-source conversion requires COMPLETE coverage')
  }
  if (records.length === 0) {
    fail('SOURCE_RECORDS_REQUIRED', 'records', 'Manifest v1 requires at least one reviewed source record')
  }
  for (const key of Object.keys(authoring)) {
    if (!allowedDocumentFields.has(key)) {
      fail('UNSUPPORTED_AUTHORING_FIELD', key, 'An unsupported document field cannot be silently projected into Manifest v1')
    }
  }
  const rejectUnsupportedFields = (value: unknown, allowed: Set<string>, path: string): void => {
    if (!isObject(value)) return
    for (const key of Object.keys(value)) {
      if (!allowed.has(key)) {
        fail('UNSUPPORTED_AUTHORING_FIELD', `${path}.${key}`, 'Undocumented authoring field cannot be silently ignored')
      }
    }
  }
  rejectUnsupportedFields(authoring.source, allowedSourceFields, 'source')
  rejectUnsupportedFields(authoring.target, allowedTargetFields, 'target')
  rejectUnsupportedFields(authoring.authoring_review, allowedReviewFields, 'authoring_review')
  if (Array.isArray(authoring.review_history)) {
    authoring.review_history.forEach((review, index) =>
      rejectUnsupportedFields(review, allowedReviewFields, `review_history[${index}]`))
  }
  proposals.forEach((proposal, index) =>
    rejectUnsupportedFields(proposal, allowedProposalFields, `relationship_proposals[${index}]`))
  visit(authoring, '', (value, path) => {
    if (typeof value === 'string' && placeholderPattern.test(value)) {
      fail('AUTHORING_PLACEHOLDER_REMAINS', path, 'Template placeholder remains in the reviewed authoring document')
    }
  })
  for (const [index, record] of records.entries()) {
    if (!isObject(record)) continue
    for (const key of Object.keys(record)) {
      if (!allowedRecordFields.has(key)) {
        fail('UNSUPPORTED_AUTHORING_RECORD_FIELD', `records[${index}].${key}`, 'Unsupported record field cannot be smuggled into Manifest v1')
      }
    }
    if (isObject(record.structural_hints)) {
      visit(record.structural_hints, `records[${index}].structural_hints`, (_value, path) => {
        const key = path.split('.').at(-1) ?? ''
        if (forbiddenHintFields.has(key)) {
          fail('UNSAFE_STRUCTURAL_HINT', path, 'Editorial, relationship, parent, and canonical-ID data cannot be copied as structural evidence')
        }
      })
    }
  }
  const source = isObject(authoring.source) ? authoring.source : null
  const targetInput = isObject(authoring.target) ? authoring.target : null
  for (const [path, value] of [
    ['source.artifact_name', source?.artifact_name],
    ['source.transcription_id', source?.transcription_id],
    ['target.idempotency_key', targetInput?.idempotency_key],
  ] as const) {
    if (typeof value === 'string' && value.trim() !== value) {
      fail('AUTHORING_METADATA_WHITESPACE', path, 'Reviewed metadata must not be silently trimmed by manifest construction')
    }
  }
  if (source?.artifact_name !== provenance.sourceArtifactName) {
    fail('SOURCE_ARTIFACT_NAME_MISMATCH', 'source.artifact_name', 'Supplied artifact filename differs from reviewed authoring metadata')
  }
  if (source?.artifact_sha256 !== sourceArtifactSha256) {
    fail('SOURCE_ARTIFACT_CHECKSUM_MISMATCH', 'source.artifact_sha256', 'Supplied artifact bytes differ from reviewed authoring checksum')
  }
  if (source?.transcription_sha256 !== transcriptionSha256) {
    fail('TRANSCRIPTION_CHECKSUM_MISMATCH', 'source.transcription_sha256', 'Supplied transcription bytes differ from reviewed authoring checksum')
  }
  if (readinessFailures.length > 0) return { manifest: null, report: report(null) }

  const target = targetInput as Record<string, unknown>
  const checkedSource = source as Record<string, unknown>
  const mappedRecords: CurriculumManifestRecordDraft[] = records.map((record: Record<string, unknown>) => ({
    sourceRecordKey: record.source_record_key as string,
    rawText: record.raw_text as string,
    displayLabel: record.display_label as string,
    sourceLocator: record.source_locator as string,
    sourceOrder: record.source_order as number,
    proposedNodeTypeCode: record.proposed_node_type as string | null,
    parentSourceRecordKey: record.parent_source_record_key as string | null,
    ambiguityMarkers: record.ambiguity_markers as string[],
    ...(record.structural_hints === undefined ? {} : { structuralHints: record.structural_hints }),
  }))
  const draft: CurriculumImportManifestDraft = {
    manifestSchemaVersion: '1.0.0',
    transcriptionId: checkedSource.transcription_id as string,
    expectedRevision: target.expected_draft_revision as number,
    idempotencyKey: target.idempotency_key as string,
    records: mappedRecords,
  }
  let manifest: CurriculumImportManifest
  try {
    manifest = buildCurriculumImportManifest(draft, provenance)
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Manifest draft projection failed'
    fail('MANIFEST_SCHEMA_INVALID', 'records', details)
    return { manifest: null, report: report(null) }
  }
  const manifestValidation = validateCurriculumImportManifest(manifest)
  for (const issue of manifestValidation.issues) {
    if (issue.severity === 'ERROR') fail(issue.code, issue.path, issue.message)
  }
  if (readinessFailures.length > 0) return { manifest: null, report: report(null) }
  return { manifest, report: report(manifest) }
}
