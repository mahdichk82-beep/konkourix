import type { HumanSciencesCatalogRecord } from './data/human-sciences.js'

export const taxonomyStatuses = ['EMPTY', 'DRAFT', 'REVIEWED', 'APPROVED'] as const
export type TaxonomyStatus = typeof taxonomyStatuses[number]

export const knowledgeTaxonomyKinds = [
  'TOPIC',
  'SUBTOPIC',
  'CONCEPT',
  'SKILL',
  'QUESTION_PATTERN',
] as const
export type KnowledgeTaxonomyKind = typeof knowledgeTaxonomyKinds[number]

export type TaxonomyRegistryEntry = Readonly<{
  subjectId: string
  curriculumVersionId: string
  curriculumNodeId: string
  taxonomyStatus: TaxonomyStatus
}>

export type TaxonomyProvenance = Readonly<{
  sourceArtifactName: string
  sourceRecordKey: string
  sourceLocator: string
  rawText: string
}>

export type KnowledgeTaxonomyNode = Readonly<{
  taxonomyKey: string
  kind: KnowledgeTaxonomyKind
  subjectId: string
  curriculumVersionId: string
  curriculumNodeId: string
  parentTaxonomyKey: string | null
  displayLabel: string
  provenance: TaxonomyProvenance
}>

export type TaxonomyValidationIssue = Readonly<{
  code: string
  message: string
  taxonomyKey?: string
  subjectId?: string
}>

export type TaxonomyValidationReport = Readonly<{
  valid: boolean
  registryEntryCount: number
  taxonomyNodeCount: number
  statusCounts: Readonly<Record<TaxonomyStatus, number>>
  kindCounts: Readonly<Record<KnowledgeTaxonomyKind, number>>
  issues: readonly TaxonomyValidationIssue[]
}>

const allowedTaxonomyParents: Readonly<Record<KnowledgeTaxonomyKind, ReadonlySet<KnowledgeTaxonomyKind>>> = {
  TOPIC: new Set(),
  SUBTOPIC: new Set(['TOPIC']),
  CONCEPT: new Set(['TOPIC', 'SUBTOPIC']),
  SKILL: new Set(['CONCEPT']),
  QUESTION_PATTERN: new Set(['SKILL']),
}

const addIssue = (
  issues: TaxonomyValidationIssue[],
  code: string,
  message: string,
  reference?: { taxonomyKey?: string; subjectId?: string },
): void => {
  issues.push({ code, message, ...reference })
}

const owningSubject = (
  structuralNodeId: string,
  byRef: ReadonlyMap<string, HumanSciencesCatalogRecord>,
): HumanSciencesCatalogRecord | null => {
  const seen = new Set<string>()
  let cursor = byRef.get(structuralNodeId)
  while (cursor) {
    if (seen.has(cursor.ref)) return null
    seen.add(cursor.ref)
    if (cursor.proposedNodeTypeCode === 'SUBJECT') return cursor
    cursor = cursor.parentRef ? byRef.get(cursor.parentRef) : undefined
  }
  return null
}

const hasProvenance = (provenance: TaxonomyProvenance): boolean =>
  Boolean(
    provenance.sourceArtifactName.trim()
    && provenance.sourceRecordKey.trim()
    && provenance.sourceLocator.trim()
    && provenance.rawText,
  )

export const validateKnowledgeTaxonomy = (input: {
  structuralRecords: readonly HumanSciencesCatalogRecord[]
  registry: readonly TaxonomyRegistryEntry[]
  taxonomyNodes: readonly KnowledgeTaxonomyNode[]
}): TaxonomyValidationReport => {
  const issues: TaxonomyValidationIssue[] = []
  const structuralByRef = new Map(input.structuralRecords.map((record) => [record.ref, record]))
  const registryBySubject = new Map<string, TaxonomyRegistryEntry>()

  for (const entry of input.registry) {
    const registryKey = `${entry.curriculumVersionId}:${entry.subjectId}`
    if (registryBySubject.has(registryKey)) {
      addIssue(issues, 'DUPLICATE_TAXONOMY_REGISTRY', 'Subject has more than one taxonomy registry entry for this curriculum version', { subjectId: entry.subjectId })
    } else {
      registryBySubject.set(registryKey, entry)
    }
    const subject = structuralByRef.get(entry.subjectId)
    if (!subject || subject.proposedNodeTypeCode !== 'SUBJECT') {
      addIssue(issues, 'REGISTRY_SUBJECT_NOT_FOUND', 'Registry subjectId must reference an existing structural SUBJECT', { subjectId: entry.subjectId })
    }
    if (entry.curriculumNodeId !== entry.subjectId) {
      addIssue(issues, 'REGISTRY_ANCHOR_MISMATCH', 'Subject registry must be anchored to the same structural SUBJECT', { subjectId: entry.subjectId })
    }
    if (!entry.curriculumVersionId.trim()) {
      addIssue(issues, 'MISSING_CURRICULUM_VERSION', 'Registry entry must pin a curriculum version', { subjectId: entry.subjectId })
    }
  }

  const taxonomyByKey = new Map<string, KnowledgeTaxonomyNode>()
  for (const node of input.taxonomyNodes) {
    if (!node.taxonomyKey.trim() || taxonomyByKey.has(node.taxonomyKey)) {
      addIssue(issues, 'DUPLICATE_TAXONOMY_KEY', `Taxonomy key must be non-empty and unique: ${node.taxonomyKey}`, { taxonomyKey: node.taxonomyKey })
    } else {
      taxonomyByKey.set(node.taxonomyKey, node)
    }
  }

  for (const node of input.taxonomyNodes) {
    const reference = { taxonomyKey: node.taxonomyKey, subjectId: node.subjectId }
    const registry = registryBySubject.get(`${node.curriculumVersionId}:${node.subjectId}`)
    if (!registry) {
      addIssue(issues, 'TAXONOMY_REGISTRY_NOT_FOUND', 'Taxonomy node requires a registry entry for its subject and curriculum version', reference)
    } else if (registry.taxonomyStatus === 'EMPTY') {
      addIssue(issues, 'EMPTY_REGISTRY_HAS_NODES', 'An EMPTY taxonomy registry cannot contain taxonomy nodes', reference)
    }

    const subject = structuralByRef.get(node.subjectId)
    if (!subject || subject.proposedNodeTypeCode !== 'SUBJECT') {
      addIssue(issues, 'TAXONOMY_SUBJECT_NOT_FOUND', 'subjectId must reference an existing structural SUBJECT', reference)
    }

    const anchor = structuralByRef.get(node.curriculumNodeId)
    if (!anchor) {
      addIssue(issues, 'TAXONOMY_CURRICULUM_NODE_NOT_FOUND', 'Taxonomy node must reference an existing parent curriculum node', reference)
    } else {
      const anchorSubject = owningSubject(anchor.ref, structuralByRef)
      if (!anchorSubject || anchorSubject.ref !== node.subjectId) {
        addIssue(issues, 'CROSS_SUBJECT_OWNERSHIP', 'Taxonomy anchor belongs to a different structural subject', reference)
      }
    }

    if (!node.curriculumVersionId.trim()) {
      addIssue(issues, 'MISSING_CURRICULUM_VERSION', 'Taxonomy node must pin a curriculum version', reference)
    }
    if (!node.displayLabel.trim()) {
      addIssue(issues, 'MISSING_TAXONOMY_LABEL', 'Taxonomy node requires a display label', reference)
    }
    if (!hasProvenance(node.provenance)) {
      addIssue(issues, 'MISSING_TAXONOMY_PROVENANCE', 'Taxonomy node requires complete source provenance', reference)
    }

    if (node.kind === 'TOPIC') {
      if (node.parentTaxonomyKey !== null) {
        addIssue(issues, 'INVALID_TAXONOMY_PARENT', 'TOPIC is rooted directly at a structural curriculum node', reference)
      }
      continue
    }

    if (!node.parentTaxonomyKey) {
      const message = node.kind === 'CONCEPT'
        ? 'CONCEPT requires a TOPIC or SUBTOPIC parent'
        : `${node.kind} requires a taxonomy parent`
      addIssue(issues, 'INVALID_TAXONOMY_PARENT', message, reference)
      continue
    }
    const parent = taxonomyByKey.get(node.parentTaxonomyKey)
    if (!parent) {
      addIssue(issues, 'TAXONOMY_PARENT_NOT_FOUND', `Taxonomy parent ${node.parentTaxonomyKey} does not exist`, reference)
      continue
    }
    if (!allowedTaxonomyParents[node.kind].has(parent.kind)) {
      addIssue(issues, 'INVALID_TAXONOMY_PARENT', `${node.kind} cannot be owned by ${parent.kind}`, reference)
    }
    if (parent.subjectId !== node.subjectId || parent.curriculumVersionId !== node.curriculumVersionId) {
      addIssue(issues, 'CROSS_SUBJECT_OWNERSHIP', 'Taxonomy parent must belong to the same subject and curriculum version', reference)
    }
  }

  const statusCounts: Record<TaxonomyStatus, number> = { EMPTY: 0, DRAFT: 0, REVIEWED: 0, APPROVED: 0 }
  for (const entry of input.registry) statusCounts[entry.taxonomyStatus] += 1
  const kindCounts: Record<KnowledgeTaxonomyKind, number> = {
    TOPIC: 0,
    SUBTOPIC: 0,
    CONCEPT: 0,
    SKILL: 0,
    QUESTION_PATTERN: 0,
  }
  for (const node of input.taxonomyNodes) kindCounts[node.kind] += 1

  return {
    valid: issues.length === 0,
    registryEntryCount: input.registry.length,
    taxonomyNodeCount: input.taxonomyNodes.length,
    statusCounts,
    kindCounts,
    issues,
  }
}
