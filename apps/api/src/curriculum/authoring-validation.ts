import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { parseAllDocuments } from 'yaml'

export const CURRICULUM_AUTHORING_FORMAT_VERSION = 'konkourix-curriculum-authoring/v1'

export const curriculumAuthoringStatuses = [
  'DRAFT',
  'READY_FOR_AUTHORING_REVIEW',
  'AUTHORING_REVIEWED',
] as const

export const curriculumAuthoringCoverageStatuses = ['PARTIAL', 'COMPLETE'] as const

export const curriculumAuthoringNodeTypes = [
  'CURRICULUM_ROOT',
  'FIELD',
  'GRADE',
  'SUBJECT',
  'CHAPTER',
  'TOPIC',
  'CONCEPT',
  'SUBCONCEPT',
] as const

const recordKinds = ['NODE_CANDIDATE', 'AMBIGUOUS_SOURCE', 'SOURCE_NOTE'] as const
const relationshipTypes = [
  'PREREQUISITE', 'APPLICABILITY', 'EQUIVALENCE', 'PREDECESSOR',
  'SUCCESSOR', 'SPLIT', 'MERGE', 'REPLACEMENT',
] as const
const ambiguityCodes = [
  'SOURCE_DETAIL_INCOMPLETE', 'CURRICULUM_VERSION_METADATA_MISSING',
  'BIOLOGY_SUBJECT_BOUNDARIES_MISSING', 'STRUCTURAL_LEVEL_UNRESOLVED',
  'CANONICAL_PARENT_UNRESOLVED', 'THEMATIC_TREE_CLASSIFICATION_UNRESOLVED',
  'BRIDGING_SKILLS_OWNERSHIP_UNRESOLVED', 'CHEMISTRY_SHARED_OWNERSHIP_UNRESOLVED',
  'INFORMAL_FIELD_HEADING_UNRESOLVED', 'ARABIC_JOINED_PARAGRAPH',
  'STAR_MARKER_UNRESOLVED', 'SOURCE_NOTE_NOT_EDUCATIONAL_NODE',
  'UNDEFINED_EDUCATIONAL_METADATA',
] as const
const reviewOutcomes = ['ACCEPTED_FOR_MANIFEST', 'CHANGES_REQUIRED', 'REJECTED'] as const
const sourceKeyPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,499}$/
const checksumPattern = /^[0-9a-f]{64}$/

const documentRequiredFields = [
  'format_version',
  'document_key',
  'status',
  'coverage_status',
  'source',
  'target',
  'records',
  'relationship_proposals',
  'authoring_review',
  'review_history',
] as const

const sourceRequiredFields = [
  'artifact_name',
  'artifact_sha256',
  'transcription_id',
  'transcription_sha256',
] as const

const recordRequiredFields = [
  'source_record_key',
  'record_kind',
  'raw_text',
  'display_label',
  'source_locator',
  'source_order',
  'proposed_node_type',
  'parent_source_record_key',
  'ambiguity_markers',
] as const

const validationChecks = [
  'YAML_SCHEMA',
  'DOCUMENT_FIELDS',
  'SOURCE_INTEGRITY',
  'RECORD_SHAPE',
  'RECORD_UNIQUENESS',
  'SOURCE_ORDER',
  'NODE_TYPES',
  'PARENT_RULES',
  'AMBIGUITY_QUARANTINE',
  'FORBIDDEN_INFERENCE',
  'CONTENT_PRESERVATION',
  'RELATIONSHIP_PROPOSALS',
  'AUTHORING_REVIEW',
] as const

type ValidationCheck = typeof validationChecks[number]

export interface CurriculumAuthoringFinding {
  check: ValidationCheck
  code: string
  file: string
  message: string
  path: string
  sourceRecordKey?: string
}

interface AuthoringRecordView {
  ambiguityMarkers: unknown[]
  index: number
  parentSourceRecordKey: unknown
  proposedNodeType: unknown
  raw: Record<string, unknown>
  sourceOrder: unknown
  sourceRecordKey: unknown
}

interface AuthoringFileValidation {
  ambiguityCount: number
  declaredChecksums: {
    artifactSha256: string | null
    transcriptionSha256: string | null
  }
  failures: CurriculumAuthoringFinding[]
  file: string
  fileSha256: string
  passedChecks: ValidationCheck[]
  recordKinds: string[]
  recordTypes: string[]
  recordCount: number
  recordKeys: Array<{ key: string; path: string }>
  status: string | null
  coverageStatus: string | null
  ambiguityCodes: string[]
  warnings: CurriculumAuthoringFinding[]
}

export interface CurriculumAuthoringAuditReport {
  ambiguityCount: number
  ambiguityCodes: Record<string, number>
  documentCount: number
  lifecycleSummary: {
    byStatus: Record<string, number>
    byCoverageStatus: Record<string, number>
  }
  provenanceReadiness: {
    documentsWithBothChecksums: number
    documentsMissingChecksums: number
  }
  checksumSummary: {
    aggregateSha256: string
    algorithm: 'SHA-256'
    files: Array<{
      artifactSha256: string | null
      file: string
      fileSha256: string
      transcriptionSha256: string | null
    }>
  }
  failedChecks: {
    byCode: Record<string, number>
    count: number
    items: CurriculumAuthoringFinding[]
  }
  passedChecks: {
    byCheck: Record<string, number>
    count: number
  }
  recordCounts: {
    accepted: number
    byNodeType: Record<string, number>
    byRecordKind: Record<string, number>
    quarantined: number
    total: number
  }
  scannedFiles: string[]
  timestamp: string
  valid: boolean
  warnings: {
    byCode: Record<string, number>
    count: number
    items: CurriculumAuthoringFinding[]
  }
}

export interface CurriculumAuthoringSourceFile {
  content: Uint8Array
  file: string
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasOwn = (value: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key)

const nonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isPlaceholder = (value: string): boolean => /^<.*>$/.test(value.trim())

const sha256 = (value: Uint8Array | string): string => createHash('sha256').update(value).digest('hex')

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right, 'en'))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    )
  }
  return value
}

const canonicalJson = (value: unknown): string => JSON.stringify(canonicalize(value))

const countValues = (values: readonly string[]): Record<string, number> => {
  const counts: Record<string, number> = {}
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right, 'en')))
}

const normalizedIdentifierValue = (value: string): string => value
  .trim()
  .toLocaleLowerCase('en')
  .replace(/[^\p{L}\p{N}]+/gu, '-')
  .replace(/^-+|-+$/g, '')

const looksDerivedFromLabel = (sourceRecordKey: string, displayLabel: string): boolean => {
  const normalizedLabel = normalizedIdentifierValue(displayLabel)
  if (!normalizedLabel) return false
  const normalizedKey = normalizedIdentifierValue(sourceRecordKey)
  const withoutKnownPrefix = normalizedKey.replace(/^(src|record|node)-/, '')
  return normalizedKey === normalizedLabel || withoutKnownPrefix === normalizedLabel
}

const findForbiddenNodeIdPaths = (value: unknown, path: string): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => findForbiddenNodeIdPaths(entry, `${path}[${index}]`))
  }
  if (!isObject(value)) return []
  const paths: string[] = []
  for (const [key, entry] of Object.entries(value)) {
    const entryPath = path ? `${path}.${key}` : key
    if (key === 'curriculum_node_id' || key === 'curriculumNodeId') paths.push(entryPath)
    paths.push(...findForbiddenNodeIdPaths(entry, entryPath))
  }
  return paths
}

const findingSort = (left: CurriculumAuthoringFinding, right: CurriculumAuthoringFinding): number =>
  left.file.localeCompare(right.file, 'en')
  || left.path.localeCompare(right.path, 'en')
  || left.code.localeCompare(right.code, 'en')

const validateAuthoringFile = (source: CurriculumAuthoringSourceFile): AuthoringFileValidation => {
  const failures: CurriculumAuthoringFinding[] = []
  const warnings: CurriculumAuthoringFinding[] = []
  const executed = new Set<ValidationCheck>(['YAML_SCHEMA'])
  const failed = new Set<ValidationCheck>()
  const fileSha256 = sha256(source.content)

  const addFailure = (
    check: ValidationCheck,
    code: string,
    path: string,
    message: string,
    sourceRecordKey?: string,
  ): void => {
    failed.add(check)
    failures.push({ check, code, file: source.file, message, path, ...(sourceRecordKey ? { sourceRecordKey } : {}) })
  }
  const addWarning = (
    check: ValidationCheck,
    code: string,
    path: string,
    message: string,
    sourceRecordKey?: string,
  ): void => {
    warnings.push({ check, code, file: source.file, message, path, ...(sourceRecordKey ? { sourceRecordKey } : {}) })
  }

  let parsed: unknown
  try {
    const contentText = new TextDecoder('utf-8', { fatal: true }).decode(source.content)
    const documents = parseAllDocuments(contentText, { uniqueKeys: true })
    if (documents.length !== 1) {
      addFailure('YAML_SCHEMA', 'YAML_DOCUMENT_COUNT_INVALID', '', 'An authoring file must contain exactly one YAML document')
    } else if (documents[0]!.errors.length > 0) {
      for (const error of documents[0]!.errors) {
        addFailure('YAML_SCHEMA', 'YAML_PARSE_ERROR', '', error.message)
      }
    } else {
      parsed = documents[0]!.toJS({ maxAliasCount: 0 })
    }
  } catch (error) {
    addFailure('YAML_SCHEMA', 'YAML_PARSE_ERROR', '', error instanceof Error ? error.message : 'Unable to parse YAML')
  }

  const emptyResult = (): AuthoringFileValidation => ({
    ambiguityCount: 0,
    ambiguityCodes: [],
    declaredChecksums: { artifactSha256: null, transcriptionSha256: null },
    failures: failures.sort(findingSort),
    file: source.file,
    fileSha256,
    passedChecks: [...executed].filter((check) => !failed.has(check)),
    recordCount: 0,
    recordKeys: [],
    recordKinds: [],
    recordTypes: [],
    status: null,
    coverageStatus: null,
    warnings: warnings.sort(findingSort),
  })

  if (parsed === undefined) return emptyResult()
  if (!isObject(parsed)) {
    addFailure('YAML_SCHEMA', 'DOCUMENT_OBJECT_REQUIRED', '', 'The YAML document must be an object')
    return emptyResult()
  }

  for (const check of validationChecks) executed.add(check)

  for (const field of documentRequiredFields) {
    if (!hasOwn(parsed, field)) {
      addFailure('YAML_SCHEMA', 'REQUIRED_DOCUMENT_FIELD_MISSING', field, `Required document field '${field}' is missing`)
    }
  }
  if (parsed.format_version !== CURRICULUM_AUTHORING_FORMAT_VERSION) {
    addFailure('DOCUMENT_FIELDS', 'FORMAT_VERSION_INVALID', 'format_version', `format_version must equal '${CURRICULUM_AUTHORING_FORMAT_VERSION}'`)
  }
  if (!(curriculumAuthoringStatuses as readonly unknown[]).includes(parsed.status)) {
    addFailure('DOCUMENT_FIELDS', 'STATUS_INVALID', 'status', 'status is not an allowed authoring status')
  }
  if (!(curriculumAuthoringCoverageStatuses as readonly unknown[]).includes(parsed.coverage_status)) {
    addFailure('DOCUMENT_FIELDS', 'COVERAGE_STATUS_INVALID', 'coverage_status', 'coverage_status must be PARTIAL or COMPLETE')
  }
  if (!isObject(parsed.target)) {
    addFailure('YAML_SCHEMA', 'TARGET_OBJECT_REQUIRED', 'target', 'target must be an object')
  }
  if (typeof parsed.document_key !== 'string' || parsed.document_key.trim().length === 0) {
    addWarning('DOCUMENT_FIELDS', 'DOCUMENT_KEY_INCOMPLETE', 'document_key', 'document_key is present but has not been assigned')
  } else if (isPlaceholder(parsed.document_key)) {
    addWarning('DOCUMENT_FIELDS', 'DOCUMENT_KEY_PLACEHOLDER', 'document_key', 'document_key remains a template placeholder')
  }
  if (isObject(parsed.target)) {
    if (!hasOwn(parsed.target, 'expected_draft_revision') || !Number.isInteger(parsed.target.expected_draft_revision)
      || (parsed.target.expected_draft_revision as number) < 0) {
      addFailure('DOCUMENT_FIELDS', 'EXPECTED_DRAFT_REVISION_INVALID', 'target.expected_draft_revision', 'expected_draft_revision must be a non-negative integer')
    }
    if (!hasOwn(parsed.target, 'idempotency_key')) {
      addFailure('DOCUMENT_FIELDS', 'IDEMPOTENCY_KEY_MISSING', 'target.idempotency_key', 'idempotency_key field is required')
    } else if (!nonEmptyString(parsed.target.idempotency_key) || isPlaceholder(parsed.target.idempotency_key)) {
      addWarning('DOCUMENT_FIELDS', 'IDEMPOTENCY_KEY_INCOMPLETE', 'target.idempotency_key', 'idempotency_key is not ready for conversion')
    }
  }

  let artifactSha256: string | null = null
  let transcriptionSha256: string | null = null
  if (!isObject(parsed.source)) {
    addFailure('SOURCE_INTEGRITY', 'SOURCE_OBJECT_REQUIRED', 'source', 'source must be an object')
  } else {
    for (const field of sourceRequiredFields) {
      if (!hasOwn(parsed.source, field)) {
        addFailure('SOURCE_INTEGRITY', 'SOURCE_FIELD_MISSING', `source.${field}`, `Required source field '${field}' is missing`)
      }
    }
    for (const field of ['artifact_name', 'artifact_sha256', 'transcription_id', 'transcription_sha256'] as const) {
      const value = parsed.source[field]
      if (typeof value !== 'string' || value.trim().length === 0) {
        addWarning('SOURCE_INTEGRITY', 'SOURCE_METADATA_INCOMPLETE', `source.${field}`, `Source metadata '${field}' is incomplete; the validator will not calculate it`)
      }
    }
    if (typeof parsed.source.artifact_sha256 === 'string') artifactSha256 = parsed.source.artifact_sha256
    if (typeof parsed.source.transcription_sha256 === 'string') transcriptionSha256 = parsed.source.transcription_sha256
    for (const field of ['artifact_sha256', 'transcription_sha256'] as const) {
      const value = parsed.source[field]
      if (typeof value === 'string' && value.length > 0 && !checksumPattern.test(value)) {
        addFailure('SOURCE_INTEGRITY', 'SOURCE_CHECKSUM_INVALID', `source.${field}`, `${field} must be an exact lowercase SHA-256 when supplied`)
      }
    }
  }

  const requireReviewString = (review: Record<string, unknown>, field: string, path: string): void => {
    if (!nonEmptyString(review[field]) || isPlaceholder(review[field])) {
      addFailure('AUTHORING_REVIEW', 'REVIEW_EVIDENCE_MISSING', `${path}.${field}`, `${field} requires actual review evidence`)
    }
  }
  const validateReview = (value: unknown, path: string, completed: boolean): void => {
    if (!isObject(value)) {
      addFailure('AUTHORING_REVIEW', 'REVIEW_OBJECT_REQUIRED', path, 'Review entry must be an object')
      return
    }
    for (const field of [
      'prepared_by', 'prepared_at', 'preparation_reason', 'reviewed_by', 'reviewed_at',
      'review_outcome', 'review_notes', 'source_reconciliation_reference',
    ]) {
      if (!hasOwn(value, field)) addFailure('AUTHORING_REVIEW', 'REVIEW_FIELD_MISSING', `${path}.${field}`, `Review field '${field}' is missing`)
    }
    for (const field of [
      'prepared_by', 'prepared_at', 'preparation_reason', 'reviewed_by', 'reviewed_at',
      'source_reconciliation_reference',
    ]) {
      if (value[field] !== null && value[field] !== undefined && typeof value[field] !== 'string') {
        addFailure('AUTHORING_REVIEW', 'REVIEW_FIELD_INVALID', `${path}.${field}`, `${field} must be a string or null`)
      }
    }
    if (!Array.isArray(value.review_notes) || value.review_notes.some((note) => !nonEmptyString(note))) {
      addFailure('AUTHORING_REVIEW', 'REVIEW_NOTES_INVALID', `${path}.review_notes`, 'review_notes must be an array of non-empty strings')
    }
    for (const field of ['prepared_at', 'reviewed_at'] as const) {
      const date = value[field]
      if (nonEmptyString(date) && (isPlaceholder(date) || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(date)
        || Number.isNaN(Date.parse(date)))) {
        addFailure('AUTHORING_REVIEW', 'REVIEW_TIMESTAMP_INVALID', `${path}.${field}`, `${field} must be an ISO-8601 timestamp`)
      }
    }
    if (value.review_outcome !== null && value.review_outcome !== undefined
      && !(reviewOutcomes as readonly unknown[]).includes(value.review_outcome)) {
      addFailure('AUTHORING_REVIEW', 'REVIEW_OUTCOME_INVALID', `${path}.review_outcome`, 'review_outcome is not allowed')
    }
    if (completed) {
      for (const field of ['prepared_by', 'prepared_at', 'preparation_reason', 'reviewed_by', 'reviewed_at', 'source_reconciliation_reference']) {
        requireReviewString(value, field, path)
      }
      if (!(reviewOutcomes as readonly unknown[]).includes(value.review_outcome)) {
        addFailure('AUTHORING_REVIEW', 'REVIEW_OUTCOME_REQUIRED', `${path}.review_outcome`, 'A completed review requires an outcome')
      }
      if (nonEmptyString(value.prepared_by) && value.prepared_by === value.reviewed_by) {
        addFailure('AUTHORING_REVIEW', 'INDEPENDENT_REVIEW_REQUIRED', `${path}.reviewed_by`, 'The authoring reviewer must be independent of the preparer')
      }
    }
  }
  validateReview(parsed.authoring_review, 'authoring_review', parsed.status === 'AUTHORING_REVIEWED')
  if (!Array.isArray(parsed.review_history)) {
    addFailure('AUTHORING_REVIEW', 'REVIEW_HISTORY_ARRAY_REQUIRED', 'review_history', 'review_history must be an array')
  } else {
    parsed.review_history.forEach((entry, index) => validateReview(entry, `review_history[${index}]`, true))
  }
  if (parsed.status === 'READY_FOR_AUTHORING_REVIEW' || parsed.status === 'AUTHORING_REVIEWED') {
    if (isObject(parsed.authoring_review)) {
      for (const field of ['prepared_by', 'prepared_at', 'preparation_reason']) {
        requireReviewString(parsed.authoring_review, field, 'authoring_review')
      }
    }
  }
  if (parsed.status === 'DRAFT' || parsed.status === 'READY_FOR_AUTHORING_REVIEW') {
    if (isObject(parsed.authoring_review) && [
      parsed.authoring_review.reviewed_by,
      parsed.authoring_review.reviewed_at,
      parsed.authoring_review.review_outcome,
    ].some((value) => value !== null && value !== undefined)) {
      addFailure('AUTHORING_REVIEW', 'UNREVIEWED_STATUS_HAS_REVIEW_DECISION', 'authoring_review', 'Current review decision is inconsistent with DRAFT or READY status')
    }
  }
  if (parsed.status === 'AUTHORING_REVIEWED') {
    if (isObject(parsed.authoring_review) && parsed.authoring_review.review_outcome !== 'ACCEPTED_FOR_MANIFEST') {
      addFailure('AUTHORING_REVIEW', 'REVIEW_ACCEPTANCE_REQUIRED', 'authoring_review.review_outcome', 'AUTHORING_REVIEWED requires ACCEPTED_FOR_MANIFEST')
    }
    if (parsed.coverage_status !== 'COMPLETE') {
      addFailure('AUTHORING_REVIEW', 'REVIEWED_COVERAGE_INCOMPLETE', 'coverage_status', 'Reviewed authoring requires reconciled COMPLETE coverage')
    }
    if (!nonEmptyString(parsed.document_key) || isPlaceholder(parsed.document_key)) {
      addFailure('AUTHORING_REVIEW', 'REVIEWED_DOCUMENT_KEY_MISSING', 'document_key', 'Reviewed authoring requires an assigned document_key')
    }
    if (!isObject(parsed.source) || !nonEmptyString(parsed.source.artifact_name)
      || isPlaceholder(parsed.source.artifact_name)
      || !nonEmptyString(parsed.source.transcription_id)
      || isPlaceholder(parsed.source.transcription_id)
      || !checksumPattern.test(String(parsed.source.artifact_sha256 ?? ''))
      || !checksumPattern.test(String(parsed.source.transcription_sha256 ?? ''))) {
      addFailure('SOURCE_INTEGRITY', 'REVIEWED_SOURCE_INCOMPLETE', 'source', 'Reviewed authoring requires complete source identity and exact checksums')
    }
    if (!isObject(parsed.target) || !nonEmptyString(parsed.target.idempotency_key)
      || isPlaceholder(parsed.target.idempotency_key)) {
      addFailure('DOCUMENT_FIELDS', 'REVIEWED_IMPORT_INTENT_INCOMPLETE', 'target.idempotency_key', 'Reviewed authoring requires an assigned import-intent key')
    }
  }

  for (const path of findForbiddenNodeIdPaths(parsed, '')) {
    addFailure('FORBIDDEN_INFERENCE', 'CURRICULUM_NODE_ID_FORBIDDEN', path, 'Authoring files must not assign curriculum_node_id manually')
  }

  if (!Array.isArray(parsed.records)) {
    addFailure('YAML_SCHEMA', 'RECORDS_ARRAY_REQUIRED', 'records', 'records must be an array')
    return {
      ...emptyResult(),
      declaredChecksums: { artifactSha256, transcriptionSha256 },
    }
  }

  const records: AuthoringRecordView[] = []
  const recordKindsFound: string[] = []
  const recordTypes: string[] = []
  const ambiguityCodesFound: string[] = []
  let ambiguityCount = 0

  for (const [index, value] of parsed.records.entries()) {
    const path = `records[${index}]`
    if (!isObject(value)) {
      addFailure('RECORD_SHAPE', 'RECORD_OBJECT_REQUIRED', path, 'Each record must be an object')
      continue
    }
    const key = typeof value.source_record_key === 'string' ? value.source_record_key : undefined
    for (const field of recordRequiredFields) {
      if (!hasOwn(value, field)) {
        addFailure('RECORD_SHAPE', 'REQUIRED_RECORD_FIELD_MISSING', `${path}.${field}`, `Required record field '${field}' is missing`, key)
      }
    }
    if (!(recordKinds as readonly unknown[]).includes(value.record_kind)) {
      addFailure('RECORD_SHAPE', 'RECORD_KIND_INVALID', `${path}.record_kind`, 'record_kind is not supported by the authoring contract', key)
    } else {
      recordKindsFound.push(value.record_kind as string)
    }
    if (!nonEmptyString(value.source_record_key) || !sourceKeyPattern.test(value.source_record_key)) {
      addFailure('RECORD_SHAPE', 'SOURCE_RECORD_KEY_INVALID', `${path}.source_record_key`, 'source_record_key must be a stable opaque transport key', key)
    }
    const ambiguityMarkers = Array.isArray(value.ambiguity_markers) ? value.ambiguity_markers : []
    if (!Array.isArray(value.ambiguity_markers)) {
      addFailure('RECORD_SHAPE', 'AMBIGUITY_MARKERS_ARRAY_REQUIRED', `${path}.ambiguity_markers`, 'ambiguity_markers must be an array', key)
    } else if (new Set(value.ambiguity_markers.map(canonicalJson)).size !== value.ambiguity_markers.length) {
      addFailure('RECORD_SHAPE', 'DUPLICATE_AMBIGUITY_MARKER', `${path}.ambiguity_markers`, 'ambiguity_markers must not contain duplicates', key)
    }
    for (const [markerIndex, marker] of ambiguityMarkers.entries()) {
      if (!(ambiguityCodes as readonly unknown[]).includes(marker)) {
        addFailure('RECORD_SHAPE', 'AMBIGUITY_CODE_INVALID', `${path}.ambiguity_markers[${markerIndex}]`, 'Ambiguity code is not in the documented vocabulary', key)
      } else {
        ambiguityCodesFound.push(marker as string)
      }
    }
    if (ambiguityMarkers.length > 0) {
      ambiguityCount += 1
      addWarning('AMBIGUITY_QUARANTINE', 'AMBIGUITY_QUARANTINED', `${path}.ambiguity_markers`, 'Record has ambiguity markers and remains quarantined', key)
    }

    if (value.proposed_node_type !== null && !(curriculumAuthoringNodeTypes as readonly unknown[]).includes(value.proposed_node_type)) {
      addFailure('NODE_TYPES', 'NODE_TYPE_INVALID', `${path}.proposed_node_type`, 'proposed_node_type is not an allowed Curriculum node type', key)
    } else if (typeof value.proposed_node_type === 'string') {
      recordTypes.push(value.proposed_node_type)
    }
    if (ambiguityMarkers.length === 0 && value.proposed_node_type === null) {
      addFailure('NODE_TYPES', 'NODE_TYPE_OR_AMBIGUITY_REQUIRED', `${path}.proposed_node_type`, 'An accepted record requires an allowed node type or an explicit ambiguity marker', key)
    }
    if (value.record_kind === 'AMBIGUOUS_SOURCE' && ambiguityMarkers.length === 0) {
      addFailure('AMBIGUITY_QUARANTINE', 'AMBIGUOUS_SOURCE_MARKER_REQUIRED', `${path}.ambiguity_markers`, 'AMBIGUOUS_SOURCE requires a documented ambiguity marker', key)
    }
    if (value.record_kind === 'SOURCE_NOTE') {
      if (value.proposed_node_type !== null || value.parent_source_record_key !== null
        || !ambiguityMarkers.includes('SOURCE_NOTE_NOT_EDUCATIONAL_NODE')) {
        addFailure('AMBIGUITY_QUARANTINE', 'SOURCE_NOTE_QUARANTINE_REQUIRED', path, 'SOURCE_NOTE requires null type and parent plus SOURCE_NOTE_NOT_EDUCATIONAL_NODE', key)
      }
    }
    if (value.record_kind === 'NODE_CANDIDATE' && ambiguityMarkers.length === 0 && value.proposed_node_type === null) {
      addFailure('NODE_TYPES', 'NODE_CANDIDATE_TYPE_REQUIRED', `${path}.proposed_node_type`, 'An accepted node candidate requires an explicit type', key)
    }
    if (hasOwn(value, 'structural_hints') && !isObject(value.structural_hints)) {
      addFailure('RECORD_SHAPE', 'STRUCTURAL_HINTS_OBJECT_REQUIRED', `${path}.structural_hints`, 'structural_hints must be an object when supplied', key)
    } else if (isObject(value.structural_hints)) {
      for (const field of ['candidate_type_codes', 'candidate_parent_keys', 'evidence_references'] as const) {
        if (hasOwn(value.structural_hints, field)
          && (!Array.isArray(value.structural_hints[field])
            || value.structural_hints[field].some((hint: unknown) => typeof hint !== 'string'))) {
          addFailure('RECORD_SHAPE', 'STRUCTURAL_HINTS_FIELD_INVALID', `${path}.structural_hints.${field}`, `${field} must be an array of strings`, key)
        }
      }
    }
    if (hasOwn(value, 'editor_notes') && (!Array.isArray(value.editor_notes)
      || value.editor_notes.some((note: unknown) => typeof note !== 'string'))) {
      addFailure('RECORD_SHAPE', 'EDITOR_NOTES_INVALID', `${path}.editor_notes`, 'editor_notes must be an array of strings when supplied', key)
    }
    if (typeof value.display_label !== 'string' || value.display_label.length === 0) {
      addFailure('RECORD_SHAPE', 'DISPLAY_LABEL_MISSING', `${path}.display_label`, 'display_label must contain the reviewed source label', key)
    }

    if (typeof value.raw_text !== 'string' || value.raw_text.length === 0) {
      addWarning('CONTENT_PRESERVATION', 'RAW_TEXT_EMPTY', `${path}.raw_text`, 'raw_text is empty; exact source content may not have been preserved', key)
      addFailure('RECORD_SHAPE', 'RAW_TEXT_MISSING', `${path}.raw_text`, 'raw_text must contain exact source text', key)
    }
    if (typeof value.source_locator !== 'string' || value.source_locator.trim().length === 0) {
      addWarning('CONTENT_PRESERVATION', 'SOURCE_LOCATOR_MISSING', `${path}.source_locator`, 'source_locator is missing or empty', key)
      addFailure('RECORD_SHAPE', 'SOURCE_LOCATOR_REQUIRED', `${path}.source_locator`, 'source_locator must identify a recoverable source location', key)
    }
    if ((typeof value.raw_text === 'string' && value.raw_text.includes('⭐'))
      || (typeof value.display_label === 'string' && value.display_label.includes('⭐'))) {
      if (!ambiguityMarkers.includes('STAR_MARKER_UNRESOLVED')) {
        addFailure('AMBIGUITY_QUARANTINE', 'STAR_MARKER_REQUIRED', `${path}.ambiguity_markers`, 'A visible star requires STAR_MARKER_UNRESOLVED', key)
      }
    }
    if (typeof value.raw_text === 'string' && typeof value.display_label === 'string' && value.raw_text !== value.display_label) {
      addWarning('CONTENT_PRESERVATION', 'DISPLAY_LABEL_MISMATCH', `${path}.display_label`, 'display_label differs from raw_text and requires source review', key)
    }
    if (typeof value.display_label === 'string' && value.display_label !== value.display_label.normalize('NFC')) {
      addWarning('CONTENT_PRESERVATION', 'DISPLAY_LABEL_NOT_NFC', `${path}.display_label`, 'display_label is not NFC; the validator did not normalize it', key)
    }

    if (typeof value.source_record_key === 'string' && typeof value.display_label === 'string'
      && looksDerivedFromLabel(value.source_record_key, value.display_label)) {
      addFailure('FORBIDDEN_INFERENCE', 'LABEL_DERIVED_SOURCE_RECORD_KEY', `${path}.source_record_key`, 'source_record_key appears to be generated from display_label', key)
    }
    const duplicateParentFields = [
      'parents',
      'parent_source_record_keys',
      'parent_curriculum_node_ids',
      'additional_parent_source_record_key',
      'secondary_parent_source_record_key',
    ].filter((field) => hasOwn(value, field))
    if (Array.isArray(value.parent_source_record_key) || duplicateParentFields.length > 0) {
      addFailure('FORBIDDEN_INFERENCE', 'DUPLICATE_PARENT_RELATIONSHIP', `${path}.parent_source_record_key`, 'A record may contain exactly one canonical parent field', key)
    }
    if (value.parent_source_record_key !== null && typeof value.parent_source_record_key !== 'string') {
      addFailure('PARENT_RULES', 'PARENT_KEY_INVALID', `${path}.parent_source_record_key`, 'parent_source_record_key must be an opaque key or null', key)
    }
    if ((value.proposed_node_type === 'CONCEPT' || value.proposed_node_type === 'SUBCONCEPT')
      && ambiguityMarkers.length === 0
      && (value.record_kind !== 'NODE_CANDIDATE'
        || typeof value.raw_text !== 'string' || value.raw_text.length === 0
        || typeof value.source_locator !== 'string' || value.source_locator.trim().length === 0)) {
      addFailure('FORBIDDEN_INFERENCE', 'CONCEPT_SOURCE_SUPPORT_REQUIRED', path, 'Accepted concepts and subconcepts require explicit raw source text and a source locator', key)
    }

    records.push({
      ambiguityMarkers,
      index,
      parentSourceRecordKey: value.parent_source_record_key,
      proposedNodeType: value.proposed_node_type,
      raw: value,
      sourceOrder: value.source_order,
      sourceRecordKey: value.source_record_key,
    })
  }

  const byKey = new Map<string, AuthoringRecordView>()
  const orders = new Set<number>()
  const recordSignatures = new Map<string, AuthoringRecordView>()
  for (const record of records) {
    const path = `records[${record.index}]`
    const key = typeof record.sourceRecordKey === 'string' ? record.sourceRecordKey : undefined
    if (key) {
      if (byKey.has(key)) {
        addFailure('RECORD_UNIQUENESS', 'SOURCE_RECORD_KEY_DUPLICATE', `${path}.source_record_key`, 'source_record_key must be unique within the document', key)
      } else {
        byKey.set(key, record)
      }
    }
    if (!Number.isInteger(record.sourceOrder) || (record.sourceOrder as number) < 0) {
      addFailure('SOURCE_ORDER', 'SOURCE_ORDER_INVALID', `${path}.source_order`, 'source_order must be a non-negative integer', key)
    } else {
      const order = record.sourceOrder as number
      if (orders.has(order)) {
        addFailure('RECORD_UNIQUENESS', 'SOURCE_ORDER_DUPLICATE', `${path}.source_order`, 'source_order must be unique within the document', key)
      }
      orders.add(order)
    }
    const { source_record_key: _key, source_order: _order, ...duplicateComparable } = record.raw
    const signature = canonicalJson(duplicateComparable)
    if (recordSignatures.has(signature)) {
      addFailure('RECORD_UNIQUENESS', 'DUPLICATE_RECORD', path, 'Duplicate record content was found', key)
    } else {
      recordSignatures.set(signature, record)
    }
  }

  for (let index = 1; index < records.length; index += 1) {
    const previous = records[index - 1]!
    const current = records[index]!
    if (typeof previous.sourceOrder === 'number' && typeof current.sourceOrder === 'number'
      && current.sourceOrder <= previous.sourceOrder) {
      const key = typeof current.sourceRecordKey === 'string' ? current.sourceRecordKey : undefined
      addFailure('SOURCE_ORDER', 'SOURCE_ORDER_NOT_STRICTLY_INCREASING', `records[${current.index}].source_order`, 'Records must appear in strictly increasing source_order', key)
    }
  }

  for (const record of records) {
    const path = `records[${record.index}]`
    const key = typeof record.sourceRecordKey === 'string' ? record.sourceRecordKey : undefined
    const parentKey = record.parentSourceRecordKey
    if (record.proposedNodeType === 'CURRICULUM_ROOT' && parentKey !== null && parentKey !== undefined) {
      addFailure('PARENT_RULES', 'ROOT_PARENT_FORBIDDEN', `${path}.parent_source_record_key`, 'A Curriculum root must not have a parent', key)
    }
    if (record.ambiguityMarkers.length === 0 && record.proposedNodeType
      && record.proposedNodeType !== 'CURRICULUM_ROOT'
      && (parentKey === null || parentKey === undefined || parentKey === '')) {
      addFailure('PARENT_RULES', 'PARENT_REQUIRED', `${path}.parent_source_record_key`, 'An accepted non-root node requires one parent unless ambiguity is explicit', key)
    }
    if (typeof parentKey === 'string' && parentKey.length > 0) {
      const parent = byKey.get(parentKey)
      if (!parent) {
        addFailure('PARENT_RULES', 'PARENT_NOT_FOUND', `${path}.parent_source_record_key`, 'Parent source record does not exist in this document', key)
      } else if (typeof parent.sourceOrder === 'number' && typeof record.sourceOrder === 'number'
        && parent.sourceOrder >= record.sourceOrder) {
        addFailure('PARENT_RULES', 'PARENT_MUST_APPEAR_EARLIER', `${path}.parent_source_record_key`, 'Parent source_order must be earlier than child source_order', key)
      } else if (record.ambiguityMarkers.length === 0 && parent.ambiguityMarkers.length > 0) {
        addFailure('PARENT_RULES', 'ACCEPTED_CHILD_OF_QUARANTINED_PARENT', `${path}.parent_source_record_key`, 'An accepted child cannot depend on a quarantined parent', key)
      }
    }
  }

  const acceptedRoots = records.filter((record) => record.proposedNodeType === 'CURRICULUM_ROOT'
    && record.ambiguityMarkers.length === 0 && record.raw.record_kind === 'NODE_CANDIDATE')
  if (acceptedRoots.length > 1) {
    addFailure('PARENT_RULES', 'MULTIPLE_ACCEPTED_ROOTS', 'records', 'An authoring document cannot contain multiple accepted Curriculum roots')
  }

  if (!Array.isArray(parsed.relationship_proposals)) {
    addFailure('RELATIONSHIP_PROPOSALS', 'RELATIONSHIP_PROPOSALS_ARRAY_REQUIRED', 'relationship_proposals', 'relationship_proposals must be an array')
  } else {
    const proposalKeys = new Set<string>()
    parsed.relationship_proposals.forEach((proposal, index) => {
      const path = `relationship_proposals[${index}]`
      if (!isObject(proposal)) {
        addFailure('RELATIONSHIP_PROPOSALS', 'RELATIONSHIP_PROPOSAL_OBJECT_REQUIRED', path, 'Each proposal must be an object')
        return
      }
      for (const field of ['proposal_key', 'type', 'source_record_key', 'target_record_keys', 'source_evidence', 'rationale', 'ambiguity_markers']) {
        if (!hasOwn(proposal, field)) addFailure('RELATIONSHIP_PROPOSALS', 'RELATIONSHIP_FIELD_MISSING', `${path}.${field}`, `Proposal field '${field}' is missing`)
      }
      if (!nonEmptyString(proposal.proposal_key) || !sourceKeyPattern.test(proposal.proposal_key)) {
        addFailure('RELATIONSHIP_PROPOSALS', 'PROPOSAL_KEY_INVALID', `${path}.proposal_key`, 'proposal_key must be an opaque transport key')
      } else if (proposalKeys.has(proposal.proposal_key)) {
        addFailure('RELATIONSHIP_PROPOSALS', 'PROPOSAL_KEY_DUPLICATE', `${path}.proposal_key`, 'proposal_key must be unique')
      } else proposalKeys.add(proposal.proposal_key)
      if (!(relationshipTypes as readonly unknown[]).includes(proposal.type)) {
        addFailure('RELATIONSHIP_PROPOSALS', 'RELATIONSHIP_TYPE_INVALID', `${path}.type`, 'Relationship type is not in the approved vocabulary')
      }
      if (!nonEmptyString(proposal.source_record_key) || !sourceKeyPattern.test(proposal.source_record_key)) {
        addFailure('RELATIONSHIP_PROPOSALS', 'RELATIONSHIP_SOURCE_KEY_INVALID', `${path}.source_record_key`, 'source_record_key must be an opaque source key')
      }
      if (!Array.isArray(proposal.target_record_keys) || proposal.target_record_keys.length === 0
        || proposal.target_record_keys.some((target: unknown) => !nonEmptyString(target) || !sourceKeyPattern.test(target))) {
        addFailure('RELATIONSHIP_PROPOSALS', 'RELATIONSHIP_TARGET_KEYS_INVALID', `${path}.target_record_keys`, 'target_record_keys must be a non-empty array of opaque source keys')
      } else if (new Set(proposal.target_record_keys).size !== proposal.target_record_keys.length) {
        addFailure('RELATIONSHIP_PROPOSALS', 'RELATIONSHIP_TARGET_DUPLICATE', `${path}.target_record_keys`, 'A proposal must not repeat a target key')
      }
      for (const field of ['source_evidence', 'rationale']) {
        if (!nonEmptyString(proposal[field]) || isPlaceholder(proposal[field])) {
          addFailure('RELATIONSHIP_PROPOSALS', 'RELATIONSHIP_EVIDENCE_REQUIRED', `${path}.${field}`, `${field} requires explicit source/review evidence`)
        }
      }
      if (!Array.isArray(proposal.ambiguity_markers)) {
        addFailure('RELATIONSHIP_PROPOSALS', 'RELATIONSHIP_MARKERS_ARRAY_REQUIRED', `${path}.ambiguity_markers`, 'ambiguity_markers must be an array')
      } else {
        if (new Set(proposal.ambiguity_markers.map(canonicalJson)).size !== proposal.ambiguity_markers.length) {
          addFailure('RELATIONSHIP_PROPOSALS', 'RELATIONSHIP_MARKER_DUPLICATE', `${path}.ambiguity_markers`, 'Proposal ambiguity markers must be unique')
        }
        for (const marker of proposal.ambiguity_markers) {
          if (!(ambiguityCodes as readonly unknown[]).includes(marker)) {
            addFailure('RELATIONSHIP_PROPOSALS', 'RELATIONSHIP_MARKER_INVALID', `${path}.ambiguity_markers`, 'Proposal ambiguity marker is not documented')
          }
        }
      }
      for (const forbidden of ['parent_source_record_key', 'parent_source_record_keys', 'curriculum_node_id']) {
        if (hasOwn(proposal, forbidden)) {
          addFailure('RELATIONSHIP_PROPOSALS', 'RELATIONSHIP_PARENT_FORBIDDEN', `${path}.${forbidden}`, 'A relationship proposal cannot establish canonical parentage or identity')
        }
      }
    })
  }

  return {
    ambiguityCount,
    ambiguityCodes: ambiguityCodesFound,
    declaredChecksums: { artifactSha256, transcriptionSha256 },
    failures: failures.sort(findingSort),
    file: source.file,
    fileSha256,
    passedChecks: [...executed].filter((check) => !failed.has(check)),
    recordCount: parsed.records.length,
    recordKeys: records.filter((record) => nonEmptyString(record.sourceRecordKey)).map((record) => ({
      key: record.sourceRecordKey as string,
      path: `records[${record.index}].source_record_key`,
    })),
    recordKinds: recordKindsFound,
    recordTypes,
    status: typeof parsed.status === 'string' ? parsed.status : null,
    coverageStatus: typeof parsed.coverage_status === 'string' ? parsed.coverage_status : null,
    warnings: warnings.sort(findingSort),
  }
}

export const validateCurriculumAuthoringYaml = (
  yaml: string,
  file = '<memory>',
): AuthoringFileValidation => validateAuthoringFile({ content: new TextEncoder().encode(yaml), file })

export const createCurriculumAuthoringAuditReport = (
  sources: readonly CurriculumAuthoringSourceFile[],
  timestamp = new Date().toISOString(),
): CurriculumAuthoringAuditReport => {
  const validations = [...sources]
    .sort((left, right) => left.file.localeCompare(right.file, 'en'))
    .map(validateAuthoringFile)
  const failures = validations.flatMap((validation) => validation.failures)
  const recordKeyOwner = new Map<string, string>()
  for (const validation of validations) {
    for (const record of validation.recordKeys) {
      const owner = recordKeyOwner.get(record.key)
      if (owner && owner !== validation.file) {
        failures.push({
          check: 'RECORD_UNIQUENESS',
          code: 'SOURCE_RECORD_KEY_DUPLICATE_ACROSS_FILES',
          file: validation.file,
          path: record.path,
          sourceRecordKey: record.key,
          message: `source_record_key already appears in ${owner}`,
        })
      } else if (!owner) {
        recordKeyOwner.set(record.key, validation.file)
      }
    }
  }
  failures.sort(findingSort)
  const warnings = validations.flatMap((validation) => validation.warnings).sort(findingSort)
  const ambiguityCount = validations.reduce((sum, validation) => sum + validation.ambiguityCount, 0)
  const recordCount = validations.reduce((sum, validation) => sum + validation.recordCount, 0)
  const passedChecks = validations.flatMap((validation) => validation.passedChecks)
  const checksumFiles = validations.map((validation) => ({
    artifactSha256: validation.declaredChecksums.artifactSha256,
    file: validation.file,
    fileSha256: validation.fileSha256,
    transcriptionSha256: validation.declaredChecksums.transcriptionSha256,
  }))
  const aggregateSha256 = sha256(checksumFiles.map(({ file, fileSha256 }) => `${file}\0${fileSha256}\n`).join(''))
  return {
    ambiguityCount,
    ambiguityCodes: countValues(validations.flatMap((validation) => validation.ambiguityCodes)),
    documentCount: validations.length,
    lifecycleSummary: {
      byStatus: countValues(validations.map((validation) => validation.status ?? 'INVALID')),
      byCoverageStatus: countValues(validations.map((validation) => validation.coverageStatus ?? 'INVALID')),
    },
    provenanceReadiness: {
      documentsWithBothChecksums: validations.filter((validation) =>
        checksumPattern.test(validation.declaredChecksums.artifactSha256 ?? '')
        && checksumPattern.test(validation.declaredChecksums.transcriptionSha256 ?? '')).length,
      documentsMissingChecksums: validations.filter((validation) =>
        !checksumPattern.test(validation.declaredChecksums.artifactSha256 ?? '')
        || !checksumPattern.test(validation.declaredChecksums.transcriptionSha256 ?? '')).length,
    },
    checksumSummary: { aggregateSha256, algorithm: 'SHA-256', files: checksumFiles },
    failedChecks: { byCode: countValues(failures.map((entry) => entry.code)), count: failures.length, items: failures },
    passedChecks: { byCheck: countValues(passedChecks), count: passedChecks.length },
    recordCounts: {
      accepted: recordCount - ambiguityCount,
      byNodeType: countValues(validations.flatMap((validation) => validation.recordTypes)),
      byRecordKind: countValues(validations.flatMap((validation) => validation.recordKinds)),
      quarantined: ambiguityCount,
      total: recordCount,
    },
    scannedFiles: validations.map((validation) => validation.file),
    timestamp,
    valid: failures.length === 0,
    warnings: { byCode: countValues(warnings.map((entry) => entry.code)), count: warnings.length, items: warnings },
  }
}

const findAuthoringFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return findAuthoringFiles(path)
    return entry.isFile() && entry.name.endsWith('.curriculum.yaml') ? [path] : []
  }))
  return files.flat().sort((left, right) => left.localeCompare(right, 'en'))
}

export const auditCurriculumAuthoringDirectory = async (
  directory: string,
  relativeTo: string,
  timestamp = new Date().toISOString(),
): Promise<CurriculumAuthoringAuditReport> => {
  const paths = await findAuthoringFiles(directory)
  const sources = await Promise.all(paths.map(async (path) => ({
    content: await readFile(path),
    file: relative(relativeTo, path).split(sep).join('/'),
  })))
  const report = createCurriculumAuthoringAuditReport(sources, timestamp)
  if (paths.length === 0) {
    const finding: CurriculumAuthoringFinding = {
      check: 'YAML_SCHEMA',
      code: 'NO_AUTHORING_FILES',
      file: relative(relativeTo, directory).split(sep).join('/'),
      message: 'No .curriculum.yaml files were found',
      path: '',
    }
    report.failedChecks = { byCode: { NO_AUTHORING_FILES: 1 }, count: 1, items: [finding] }
    report.valid = false
  }
  return report
}
