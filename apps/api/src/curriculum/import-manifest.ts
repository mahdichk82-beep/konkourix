import { createHash } from 'node:crypto'
import { z } from 'zod'
import type {
  CurriculumAmbiguityReport,
  CurriculumImportManifest,
  CurriculumImportManifestDraft,
  CurriculumManifestRecord,
  CurriculumManifestRecordDraft,
  CurriculumManifestValidationIssue,
  CurriculumManifestValidationReport,
} from './types.js'

export const CURRICULUM_IMPORT_MANIFEST_SCHEMA_VERSION = '1.0.0'

export const curriculumManifestNodeTypeCodes = [
  'CURRICULUM_ROOT',
  'FIELD',
  'GRADE',
  'SUBJECT',
  'CHAPTER',
  'TOPIC',
  'CONCEPT',
  'SUBCONCEPT',
] as const

const sha256 = z.string().regex(/^[0-9a-f]{64}$/)
const sourceRecordKey = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,499}$/)

export const curriculumManifestRecordSchema = z.object({
  ambiguityMarkers: z.array(z.string().trim().min(1).max(200)).max(50).optional(),
  checksum: sha256,
  displayLabel: z.string().min(1).max(2000),
  parentSourceRecordKey: sourceRecordKey.nullable().optional(),
  proposedNodeTypeCode: z.enum(curriculumManifestNodeTypeCodes).nullable().optional(),
  rawText: z.string().min(1).max(10000),
  sourceLocator: z.string().min(1).max(1000),
  sourceOrder: z.number().int().min(0),
  sourceRecordKey,
  structuralHints: z.unknown().optional(),
}).strict()

export const curriculumManifestRecordDraftSchema = curriculumManifestRecordSchema.omit({ checksum: true })

export const curriculumImportManifestDraftSchema = z.object({
  expectedRevision: z.number().int().min(0),
  idempotencyKey: z.string().trim().min(8).max(200),
  manifestSchemaVersion: z.literal(CURRICULUM_IMPORT_MANIFEST_SCHEMA_VERSION).optional(),
  records: z.array(curriculumManifestRecordDraftSchema).min(1).max(10000),
  transcriptionId: z.string().trim().min(1).max(500),
}).strict()

export const curriculumImportManifestSchema = z.object({
  expectedRevision: z.number().int().min(0),
  idempotencyKey: z.string().trim().min(8).max(200),
  manifestChecksum: sha256,
  manifestSchemaVersion: z.literal(CURRICULUM_IMPORT_MANIFEST_SCHEMA_VERSION),
  payloadChecksum: sha256,
  records: z.array(curriculumManifestRecordSchema).min(1).max(10000),
  sourceArtifactName: z.string().trim().min(1).max(500),
  sourceArtifactSha256: sha256,
  transcriptionId: z.string().trim().min(1).max(500),
  transcriptionSha256: sha256,
}).strict().superRefine((value, context) => {
  const keys = new Set<string>()
  const orders = new Set<number>()
  for (const [index, record] of value.records.entries()) {
    if (keys.has(record.sourceRecordKey)) {
      context.addIssue({ code: 'custom', message: 'Duplicate source record key', path: ['records', index, 'sourceRecordKey'] })
    }
    if (orders.has(record.sourceOrder)) {
      context.addIssue({ code: 'custom', message: 'Duplicate source order', path: ['records', index, 'sourceOrder'] })
    }
    if (index > 0 && record.sourceOrder <= value.records[index - 1]!.sourceOrder) {
      context.addIssue({ code: 'custom', message: 'Records must be ordered by increasing sourceOrder', path: ['records', index, 'sourceOrder'] })
    }
    keys.add(record.sourceRecordKey)
    orders.add(record.sourceOrder)
  }
})

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right, 'en'))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    )
  }
  return value
}

const checksumJson = (value: unknown): string => createHash('sha256')
  .update(JSON.stringify(canonicalize(value)), 'utf8')
  .digest('hex')

export const curriculumSourceArtifactChecksum = (content: Uint8Array): string =>
  createHash('sha256').update(content).digest('hex')

export const curriculumManifestRecordChecksum = (
  record: CurriculumManifestRecordDraft,
): string => checksumJson(record)

export const curriculumManifestPayloadChecksum = (
  records: readonly CurriculumManifestRecord[],
): string => checksumJson(records)

export const curriculumManifestChecksum = (
  manifest: Omit<CurriculumImportManifest, 'manifestChecksum'> | CurriculumImportManifest,
): string => {
  const { manifestChecksum: _ignored, ...content } = manifest as CurriculumImportManifest
  return checksumJson(content)
}

export const buildCurriculumImportManifest = (
  draft: CurriculumImportManifestDraft,
  provenance: {
    sourceArtifactName: string
    sourceArtifact: Uint8Array
    transcription: Uint8Array
  },
): CurriculumImportManifest => {
  const checkedDraft = curriculumImportManifestDraftSchema.parse(draft)
  const records = checkedDraft.records.map((record) => ({
    ...record,
    checksum: curriculumManifestRecordChecksum(record),
  }))
  const content: Omit<CurriculumImportManifest, 'manifestChecksum'> = {
    ...checkedDraft,
    manifestSchemaVersion: checkedDraft.manifestSchemaVersion ?? CURRICULUM_IMPORT_MANIFEST_SCHEMA_VERSION,
    payloadChecksum: curriculumManifestPayloadChecksum(records),
    records,
    sourceArtifactName: provenance.sourceArtifactName,
    sourceArtifactSha256: curriculumSourceArtifactChecksum(provenance.sourceArtifact),
    transcriptionSha256: curriculumSourceArtifactChecksum(provenance.transcription),
  }
  return { ...content, manifestChecksum: curriculumManifestChecksum(content) }
}

const issue = (
  code: string,
  path: string,
  message: string,
  severity: CurriculumManifestValidationIssue['severity'] = 'ERROR',
): CurriculumManifestValidationIssue => ({ code, message, path, severity })

const structuralIssues = (manifest: CurriculumImportManifest): CurriculumManifestValidationIssue[] => {
  const issues: CurriculumManifestValidationIssue[] = []
  const byKey = new Map(manifest.records.map((record, index) => [record.sourceRecordKey, { index, record }]))

  for (const [index, record] of manifest.records.entries()) {
    const path = `records[${index}]`
    const markers = record.ambiguityMarkers ?? []
    if (new Set(markers).size !== markers.length) {
      issues.push(issue('DUPLICATE_AMBIGUITY_MARKER', `${path}.ambiguityMarkers`, 'Ambiguity markers must be unique'))
    }
    if (record.displayLabel !== record.displayLabel.normalize('NFC')) {
      issues.push(issue('DISPLAY_LABEL_NOT_NFC', `${path}.displayLabel`, 'The proposed display label must be NFC; rawText retains exact source text'))
    }
    if ((record.rawText.includes('⭐') || record.displayLabel.includes('⭐')) && !markers.includes('STAR_MARKER_UNRESOLVED')) {
      issues.push(issue('STAR_MARKER_NOT_QUARANTINED', `${path}.ambiguityMarkers`, 'A source star must remain explicit and quarantined'))
    }
    if (curriculumManifestRecordChecksum({
      ambiguityMarkers: record.ambiguityMarkers,
      displayLabel: record.displayLabel,
      parentSourceRecordKey: record.parentSourceRecordKey,
      proposedNodeTypeCode: record.proposedNodeTypeCode,
      rawText: record.rawText,
      sourceLocator: record.sourceLocator,
      sourceOrder: record.sourceOrder,
      sourceRecordKey: record.sourceRecordKey,
      structuralHints: record.structuralHints,
    }) !== record.checksum) {
      issues.push(issue('RECORD_CHECKSUM_MISMATCH', `${path}.checksum`, 'Source record checksum does not match its exact content'))
    }
    if (markers.length === 0 && !record.proposedNodeTypeCode) {
      issues.push(issue('NODE_TYPE_OR_AMBIGUITY_REQUIRED', `${path}.proposedNodeTypeCode`, 'A record must have a reviewed type or an explicit ambiguity marker'))
    }
    if (record.proposedNodeTypeCode === 'CURRICULUM_ROOT' && record.parentSourceRecordKey) {
      issues.push(issue('ROOT_PARENT_FORBIDDEN', `${path}.parentSourceRecordKey`, 'A curriculum root cannot have a parent'))
    }
    if (markers.length === 0 && record.proposedNodeTypeCode && record.proposedNodeTypeCode !== 'CURRICULUM_ROOT' && !record.parentSourceRecordKey) {
      issues.push(issue('CANONICAL_PARENT_REQUIRED', `${path}.parentSourceRecordKey`, 'An unambiguous non-root record requires one reviewed parent'))
    }
    if (record.parentSourceRecordKey) {
      const parent = byKey.get(record.parentSourceRecordKey)
      if (!parent) {
        issues.push(issue('PARENT_SOURCE_RECORD_NOT_FOUND', `${path}.parentSourceRecordKey`, 'Parent source record key does not exist in this manifest'))
      } else if (parent.index >= index) {
        issues.push(issue('PARENT_MUST_PRECEDE_CHILD', `${path}.parentSourceRecordKey`, 'Parent must precede child in source order'))
      }
    }
  }

  for (const [index, record] of manifest.records.entries()) {
    const seen = new Set([record.sourceRecordKey])
    let parentKey = record.parentSourceRecordKey
    while (parentKey) {
      if (seen.has(parentKey)) {
        issues.push(issue('SOURCE_PARENT_CYCLE', `records[${index}].parentSourceRecordKey`, 'Source-record parent references contain a cycle'))
        break
      }
      seen.add(parentKey)
      parentKey = byKey.get(parentKey)?.record.parentSourceRecordKey
    }
  }
  return issues
}

const countValues = (values: readonly string[]): Record<string, number> => {
  const counts: Record<string, number> = {}
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right, 'en')))
}

export const validateCurriculumImportManifest = (input: unknown): CurriculumManifestValidationReport => {
  const parsed = curriculumImportManifestSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ambiguityCounts: {}, ambiguousRecordCount: 0,
      calculatedManifestChecksum: null, calculatedPayloadChecksum: null,
      importableRecordCount: 0,
      issues: parsed.error.issues.map((entry) => issue(
        'MANIFEST_SCHEMA_INVALID', entry.path.map(String).join('.'), entry.message,
      )),
      manifestChecksum: null, payloadChecksum: null, recordCount: 0,
      schemaVersion: null, typeCounts: {}, valid: false,
    }
  }

  const manifest = parsed.data
  const calculatedPayloadChecksum = curriculumManifestPayloadChecksum(manifest.records)
  const calculatedManifestChecksum = curriculumManifestChecksum(manifest)
  const issues = structuralIssues(manifest)
  if (manifest.payloadChecksum !== calculatedPayloadChecksum) {
    issues.push(issue('PAYLOAD_CHECKSUM_MISMATCH', 'payloadChecksum', 'Payload checksum does not match ordered source records'))
  }
  if (manifest.manifestChecksum !== calculatedManifestChecksum) {
    issues.push(issue('MANIFEST_CHECKSUM_MISMATCH', 'manifestChecksum', 'Manifest checksum does not match the complete manifest envelope'))
  }
  const ambiguousRecords = manifest.records.filter((record) => (record.ambiguityMarkers?.length ?? 0) > 0)
  return {
    ambiguityCounts: countValues(ambiguousRecords.flatMap((record) => record.ambiguityMarkers ?? [])),
    ambiguousRecordCount: ambiguousRecords.length,
    calculatedManifestChecksum,
    calculatedPayloadChecksum,
    importableRecordCount: manifest.records.length - ambiguousRecords.length,
    issues,
    manifestChecksum: manifest.manifestChecksum,
    payloadChecksum: manifest.payloadChecksum,
    recordCount: manifest.records.length,
    schemaVersion: manifest.manifestSchemaVersion,
    typeCounts: countValues(manifest.records.flatMap((record) => record.proposedNodeTypeCode ? [record.proposedNodeTypeCode] : [])),
    valid: !issues.some((entry) => entry.severity === 'ERROR'),
  }
}

export const parseCurriculumImportManifest = (input: unknown): CurriculumImportManifest => {
  const report = validateCurriculumImportManifest(input)
  if (!report.valid) {
    const codes = [...new Set(report.issues.map((entry) => entry.code))].join(', ')
    throw new Error(`Curriculum import manifest is invalid: ${codes}`)
  }
  return curriculumImportManifestSchema.parse(input)
}

export const createCurriculumAmbiguityReport = (
  manifest: CurriculumImportManifest,
): CurriculumAmbiguityReport => {
  const records = manifest.records
    .filter((record) => (record.ambiguityMarkers?.length ?? 0) > 0)
    .map((record) => ({
      displayLabel: record.displayLabel,
      markers: [...new Set(record.ambiguityMarkers)].sort((left, right) => left.localeCompare(right, 'en')),
      sourceLocator: record.sourceLocator,
      sourceOrder: record.sourceOrder,
      sourceRecordKey: record.sourceRecordKey,
    }))
  return {
    manifestChecksum: manifest.manifestChecksum,
    markerCounts: countValues(records.flatMap((record) => record.markers)),
    records,
    sourceArtifactName: manifest.sourceArtifactName,
    sourceArtifactSha256: manifest.sourceArtifactSha256,
    transcriptionId: manifest.transcriptionId,
    transcriptionSha256: manifest.transcriptionSha256,
    unresolvedRecordCount: records.length,
  }
}

export const validateCurriculumManifestProvenance = (
  manifest: CurriculumImportManifest,
  provenance: {
    sourceArtifactName: string
    sourceArtifact: Uint8Array
    transcription: Uint8Array
  },
): CurriculumManifestValidationIssue[] => {
  const issues: CurriculumManifestValidationIssue[] = []
  if (manifest.sourceArtifactName !== provenance.sourceArtifactName) {
    issues.push(issue('SOURCE_ARTIFACT_NAME_MISMATCH', 'sourceArtifactName', 'Source artifact filename does not match the reviewed manifest'))
  }
  if (manifest.sourceArtifactSha256 !== curriculumSourceArtifactChecksum(provenance.sourceArtifact)) {
    issues.push(issue('SOURCE_ARTIFACT_CHECKSUM_MISMATCH', 'sourceArtifactSha256', 'Source artifact bytes do not match the reviewed manifest'))
  }
  if (manifest.transcriptionSha256 !== curriculumSourceArtifactChecksum(provenance.transcription)) {
    issues.push(issue('TRANSCRIPTION_CHECKSUM_MISMATCH', 'transcriptionSha256', 'Reviewed transcription bytes do not match the manifest'))
  }
  return issues
}
