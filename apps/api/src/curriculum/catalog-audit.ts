import type {
  HumanSciencesApplicability,
  HumanSciencesCatalogRecord,
} from './data/human-sciences.js'
import type { CurriculumReviewItem } from './data/theoretical-curriculum.js'

export type CurriculumAuditIssue = Readonly<{
  code: string
  message: string
  ref?: string
}>

export type CurriculumAuditSubject = Readonly<{
  ref: string
  sourceRecordKey: string
  label: string
  gradeRef: string
  scopeRef: string
  shared: boolean
}>

export type CurriculumCatalogAuditReport = Readonly<{
  valid: boolean
  totals: Readonly<{
    nodes: number
    scopes: number
    grades: number
    subjects: number
    chapters: number
    structuralLessons: number
    applicabilityRelationships: number
  }>
  sharedSubjects: readonly CurriculumAuditSubject[]
  scopeSpecificSubjects: readonly CurriculumAuditSubject[]
  unresolvedReviewItems: readonly CurriculumReviewItem[]
  issues: readonly CurriculumAuditIssue[]
}>

export type CurriculumFreezeManifest = Readonly<{
  schemaVersion: '1.0.0'
  status: 'CANDIDATE_NOT_FROZEN'
  snapshotId: string
  curriculumVersionIdentifier: string | null
  catalogSha256: string
  source: Readonly<{
    artifactName: 'cori.docx'
    artifactSha256: string | null
    transcriptionId: string
    transcriptionSha256: string | null
  }>
  nodeCounts: CurriculumCatalogAuditReport['totals']
  subjectList: readonly CurriculumAuditSubject[]
  unresolvedReviewItems: readonly CurriculumReviewItem[]
}>

const supportedTypes = new Set(['CURRICULUM_ROOT', 'FIELD', 'GRADE', 'SUBJECT', 'CHAPTER', 'TOPIC'])
const scopeRefs = ['shared', 'mathematics', 'experimental', 'human'] as const
const gradeCodes = ['g10', 'g11', 'g12'] as const
const expectedGradeLabels: Record<typeof gradeCodes[number], string> = {
  g10: 'دهم',
  g11: 'یازدهم',
  g12: 'دوازدهم',
}

const sourceLine = (record: HumanSciencesCatalogRecord): number => {
  const match = /:L([0-9]+)(?:-L[0-9]+)?$/.exec(record.sourceLocator)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

const persianDigitValue = (value: string): number => Number(
  value.replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))),
)

const chapterNumber = (label: string): number | null => {
  const match = /^(?:فصل|بخش)\s+([۰-۹0-9]+)/u.exec(label)
  return match?.[1] ? persianDigitValue(match[1]) : null
}

const issue = (issues: CurriculumAuditIssue[], code: string, message: string, ref?: string): void => {
  issues.push({ code, message, ...(ref ? { ref } : {}) })
}

export const auditCurriculumCatalog = (input: {
  records: readonly HumanSciencesCatalogRecord[]
  applicability: readonly HumanSciencesApplicability[]
  unresolvedReviewItems: readonly CurriculumReviewItem[]
}): CurriculumCatalogAuditReport => {
  const issues: CurriculumAuditIssue[] = []
  const byRef = new Map<string, HumanSciencesCatalogRecord>()
  const sourceKeys = new Set<string>()

  for (const record of input.records) {
    if (byRef.has(record.ref)) issue(issues, 'DUPLICATE_REF', `Duplicate catalog reference ${record.ref}`, record.ref)
    else byRef.set(record.ref, record)
    if (sourceKeys.has(record.sourceRecordKey)) {
      issue(issues, 'DUPLICATE_SOURCE_KEY', `Duplicate source key ${record.sourceRecordKey}`, record.ref)
    }
    sourceKeys.add(record.sourceRecordKey)
    if (!record.sourceRecordKey.trim() || !record.rawText || !record.sourceLocator) {
      issue(issues, 'MISSING_PROVENANCE', 'Structural node lacks source key, raw text, or locator', record.ref)
    }
    if (!/^CANONICAL_CURRICULUM\.md:L[0-9]+$/.test(record.sourceLocator)) {
      issue(issues, 'INVALID_SOURCE_LOCATOR', `Unsupported source locator ${record.sourceLocator}`, record.ref)
    }
    if (!supportedTypes.has(record.proposedNodeTypeCode)) {
      issue(issues, 'UNSUPPORTED_NODE_TYPE', `Unsupported structural type ${record.proposedNodeTypeCode}`, record.ref)
    }
    if (record.proposedNodeTypeCode === 'TOPIC' && !/^(?:درس|Lesson)\s/u.test(record.displayLabel)) {
      issue(issues, 'INFERRED_TOPIC', 'TOPIC is not backed by an explicit lesson label', record.ref)
    }
    if (record.proposedNodeTypeCode === 'CHAPTER' && !/^(?:فصل|بخش)\s/u.test(record.displayLabel)) {
      issue(issues, 'INFERRED_CHAPTER', 'CHAPTER is not backed by an explicit chapter/section label', record.ref)
    }
  }

  const roots = input.records.filter((record) => record.proposedNodeTypeCode === 'CURRICULUM_ROOT')
  if (roots.length !== 1) issue(issues, 'ROOT_COUNT', `Expected one root, found ${roots.length}`)

  const allowedParents: Record<string, ReadonlySet<string>> = {
    CURRICULUM_ROOT: new Set(),
    FIELD: new Set(['CURRICULUM_ROOT']),
    GRADE: new Set(['FIELD']),
    SUBJECT: new Set(['GRADE']),
    CHAPTER: new Set(['SUBJECT']),
    TOPIC: new Set(['SUBJECT', 'CHAPTER']),
  }

  for (const record of input.records) {
    if (record.proposedNodeTypeCode === 'CURRICULUM_ROOT') {
      if (record.parentRef !== null) issue(issues, 'ROOT_HAS_PARENT', 'Root must not have a parent', record.ref)
      continue
    }
    if (!record.parentRef) {
      issue(issues, 'ORPHAN_NODE', 'Non-root node has no parent', record.ref)
      continue
    }
    const parent = byRef.get(record.parentRef)
    if (!parent) {
      issue(issues, 'MISSING_PARENT', `Parent ${record.parentRef} does not exist`, record.ref)
      continue
    }
    if (!allowedParents[record.proposedNodeTypeCode]?.has(parent.proposedNodeTypeCode)) {
      issue(issues, 'BROKEN_HIERARCHY', `${record.proposedNodeTypeCode} cannot be owned by ${parent.proposedNodeTypeCode}`, record.ref)
    }
    const seen = new Set([record.ref])
    let cursor: HumanSciencesCatalogRecord | undefined = parent
    while (cursor) {
      if (seen.has(cursor.ref)) {
        issue(issues, 'PARENT_CYCLE', 'Parent hierarchy contains a cycle', record.ref)
        break
      }
      seen.add(cursor.ref)
      cursor = cursor.parentRef ? byRef.get(cursor.parentRef) : undefined
    }
  }

  const fields = input.records.filter((record) => record.proposedNodeTypeCode === 'FIELD')
  assertExpectedSet(fields.map((record) => record.ref), scopeRefs, 'SCOPE_MAPPING', issues)
  for (const scopeRef of scopeRefs) {
    const field = byRef.get(scopeRef)
    if (!field || field.parentRef !== 'root') issue(issues, 'SCOPE_OWNER', `Scope ${scopeRef} must be owned by root`, scopeRef)
    const gradeRefs = input.records
      .filter((record) => record.proposedNodeTypeCode === 'GRADE' && record.parentRef === scopeRef)
      .map((record) => record.ref)
    assertExpectedSet(gradeRefs, gradeCodes.map((grade) => `${scopeRef}.${grade}`), 'GRADE_MAPPING', issues)
  }

  for (const gradeCode of gradeCodes) {
    for (const scopeRef of scopeRefs) {
      const ref = `${scopeRef}.${gradeCode}`
      const grade = byRef.get(ref)
      if (!grade || grade.displayLabel !== expectedGradeLabels[gradeCode]) {
        issue(issues, 'GRADE_LABEL', `Grade ${ref} must use source label ${expectedGradeLabels[gradeCode]}`, ref)
      }
    }
  }

  const subjects = input.records.filter((record) => record.proposedNodeTypeCode === 'SUBJECT')
  const subjectList: CurriculumAuditSubject[] = []
  const subjectOwnershipKeys = new Set<string>()
  for (const subject of subjects) {
    const grade = subject.parentRef ? byRef.get(subject.parentRef) : undefined
    const scope = grade?.parentRef ? byRef.get(grade.parentRef) : undefined
    if (!grade || grade.proposedNodeTypeCode !== 'GRADE' || !scope || scope.proposedNodeTypeCode !== 'FIELD') {
      issue(issues, 'SUBJECT_OWNER', 'Subject does not resolve to exactly one Grade and Scope owner', subject.ref)
      continue
    }
    if (!subject.ref.startsWith(`${grade.ref}.`)) {
      issue(issues, 'SUBJECT_GRADE_PREFIX', `Subject reference does not match owning grade ${grade.ref}`, subject.ref)
    }
    const ownershipKey = `${grade.ref}:${subject.displayLabel}`
    if (subjectOwnershipKeys.has(ownershipKey)) {
      issue(issues, 'DUPLICATE_SUBJECT_OWNERSHIP', `Subject ${subject.displayLabel} is owned more than once by ${grade.ref}`, subject.ref)
    }
    subjectOwnershipKeys.add(ownershipKey)
    subjectList.push({
      ref: subject.ref,
      sourceRecordKey: subject.sourceRecordKey,
      label: subject.displayLabel,
      gradeRef: grade.ref,
      scopeRef: scope.ref,
      shared: scope.ref === 'shared',
    })
  }

  for (const scopeRef of ['human', 'mathematics', 'experimental'] as const) {
    for (const record of input.records.filter((candidate) => candidate.ref.startsWith(`${scopeRef}.`))) {
      let cursor: HumanSciencesCatalogRecord | undefined = record
      while (cursor && cursor.proposedNodeTypeCode !== 'FIELD') {
        cursor = cursor.parentRef ? byRef.get(cursor.parentRef) : undefined
      }
      if (cursor?.ref !== scopeRef) issue(issues, 'SCOPE_ISOLATION', `Node escapes ${scopeRef} ownership`, record.ref)
    }
  }

  const sharedSubjects = subjectList.filter((subject) => subject.shared)
  const scopeSpecificSubjects = subjectList.filter((subject) => !subject.shared)
  const sharedIdentity = new Set(sharedSubjects.map((subject) => `${subject.gradeRef.split('.')[1]}:${subject.label}`))
  for (const subject of scopeSpecificSubjects) {
    const gradeCode = subject.gradeRef.split('.')[1]
    if (sharedIdentity.has(`${gradeCode}:${subject.label}`)) {
      issue(issues, 'DUPLICATED_SHARED_OWNERSHIP', 'Shared subject is cloned under a branch scope', subject.ref)
    }
  }

  const relationshipKeys = new Set<string>()
  for (const relationship of input.applicability) {
    const key = `${relationship.sourceRef}:${relationship.targetRef}:${relationship.type}`
    if (relationshipKeys.has(key)) issue(issues, 'DUPLICATE_APPLICABILITY', `Duplicate applicability ${key}`)
    relationshipKeys.add(key)
    const source = byRef.get(relationship.sourceRef)
    const target = byRef.get(relationship.targetRef)
    if (!source || source.proposedNodeTypeCode !== 'SUBJECT' || !source.ref.startsWith('shared.')) {
      issue(issues, 'INVALID_APPLICABILITY_SOURCE', 'Applicability source must be a shared subject', relationship.sourceRef)
    }
    if (!target || target.proposedNodeTypeCode !== 'GRADE' || target.ref.startsWith('shared.')) {
      issue(issues, 'INVALID_APPLICABILITY_TARGET', 'Applicability target must be a branch grade', relationship.targetRef)
    }
    const sourceGrade = source?.parentRef?.split('.')[1]
    const targetGrade = target?.ref.split('.')[1]
    if (sourceGrade !== targetGrade) {
      issue(issues, 'APPLICABILITY_GRADE_MISMATCH', 'Applicability crosses grade boundaries', relationship.sourceRef)
    }
  }
  for (const subject of sharedSubjects) {
    const gradeCode = subject.gradeRef.split('.')[1]
    for (const scopeRef of ['mathematics', 'experimental', 'human']) {
      const key = `${subject.ref}:${scopeRef}.${gradeCode}:APPLICABILITY`
      if (!relationshipKeys.has(key)) issue(issues, 'MISSING_SHARED_APPLICABILITY', `Missing ${key}`, subject.ref)
    }
  }

  for (const subject of subjects) {
    const chapters = input.records
      .filter((record) => record.parentRef === subject.ref && record.proposedNodeTypeCode === 'CHAPTER')
      .sort((left, right) => sourceLine(left) - sourceLine(right))
    const numbers = chapters.map((chapter) => chapterNumber(chapter.displayLabel))
    if (numbers.length > 0 && numbers.every((number): number is number => number !== null)) {
      for (let index = 0; index < numbers.length; index += 1) {
        if (numbers[index] !== index + 1) {
          issue(issues, 'CHAPTER_NUMBER_ORDER', `Expected chapter/section ${index + 1}, found ${numbers[index]}`, chapters[index]?.ref)
        }
      }
    }
  }

  const count = (type: string): number => input.records.filter((record) => record.proposedNodeTypeCode === type).length
  return {
    valid: issues.length === 0,
    totals: {
      nodes: input.records.length,
      scopes: count('FIELD'),
      grades: count('GRADE'),
      subjects: count('SUBJECT'),
      chapters: count('CHAPTER'),
      structuralLessons: count('TOPIC'),
      applicabilityRelationships: input.applicability.length,
    },
    sharedSubjects,
    scopeSpecificSubjects,
    unresolvedReviewItems: input.unresolvedReviewItems,
    issues,
  }
}

const assertExpectedSet = (
  actual: readonly string[],
  expected: readonly string[],
  code: string,
  issues: CurriculumAuditIssue[],
): void => {
  const actualSet = new Set(actual)
  const expectedSet = new Set(expected)
  const missing = expected.filter((value) => !actualSet.has(value))
  const unexpected = actual.filter((value) => !expectedSet.has(value))
  if (missing.length || unexpected.length) {
    issue(issues, code, `Missing [${missing.join(', ')}]; unexpected [${unexpected.join(', ')}]`)
  }
}

export const createCurriculumFreezeManifest = (input: {
  audit: CurriculumCatalogAuditReport
  catalogSha256: string
  snapshotId: string
  curriculumVersionIdentifier?: string | null
  sourceArtifactSha256?: string | null
  transcriptionId: string
  transcriptionSha256?: string | null
}): CurriculumFreezeManifest => {
  if (!input.audit.valid) throw new Error('Cannot create a freeze manifest from a failing curriculum audit')
  return {
    schemaVersion: '1.0.0',
    status: 'CANDIDATE_NOT_FROZEN',
    snapshotId: input.snapshotId,
    curriculumVersionIdentifier: input.curriculumVersionIdentifier ?? null,
    catalogSha256: input.catalogSha256,
    source: {
      artifactName: 'cori.docx',
      artifactSha256: input.sourceArtifactSha256 ?? null,
      transcriptionId: input.transcriptionId,
      transcriptionSha256: input.transcriptionSha256 ?? null,
    },
    nodeCounts: input.audit.totals,
    subjectList: [...input.audit.sharedSubjects, ...input.audit.scopeSpecificSubjects],
    unresolvedReviewItems: input.audit.unresolvedReviewItems,
  }
}
