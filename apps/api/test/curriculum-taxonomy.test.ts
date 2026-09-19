import assert from 'node:assert/strict'
import test from 'node:test'
import {
  knowledgeTaxonomyNodes,
  taxonomyRegistry,
} from '../src/curriculum/data/taxonomy-registry.js'
import {
  theoreticalCurriculumAuditReport,
  theoreticalCurriculumFreezeManifest,
} from '../src/curriculum/data/theoretical-curriculum-freeze.js'
import { theoreticalCurriculumCatalog } from '../src/curriculum/data/theoretical-curriculum.js'
import {
  validateKnowledgeTaxonomy,
  type KnowledgeTaxonomyNode,
  type TaxonomyRegistryEntry,
} from '../src/curriculum/taxonomy.js'

const versionId = 'test-curriculum-version'
const subjectId = 'experimental.g10.math1'
const curriculumNodeId = 'experimental.g10.math1.chapter.3210'

const registry = (taxonomyStatus: TaxonomyRegistryEntry['taxonomyStatus'] = 'DRAFT'): TaxonomyRegistryEntry[] => [{
  subjectId,
  curriculumVersionId: versionId,
  curriculumNodeId: subjectId,
  taxonomyStatus,
}]

const provenance = {
  sourceArtifactName: 'reviewed-test-source.txt',
  sourceRecordKey: 'test-source-record',
  sourceLocator: 'reviewed-test-source.txt:L1',
  rawText: 'reviewed fixture content',
} as const

const taxonomyNode = (
  taxonomyKey: string,
  kind: KnowledgeTaxonomyNode['kind'],
  parentTaxonomyKey: string | null,
  overrides: Partial<KnowledgeTaxonomyNode> = {},
): KnowledgeTaxonomyNode => ({
  taxonomyKey,
  kind,
  subjectId,
  curriculumVersionId: versionId,
  curriculumNodeId,
  parentTaxonomyKey,
  displayLabel: taxonomyKey,
  provenance,
  ...overrides,
})

test('production taxonomy registry contains only the two isolated pilots', () => {
  assert.equal(taxonomyRegistry.length, 2)
  assert.equal(knowledgeTaxonomyNodes.length, 57)
  const report = validateKnowledgeTaxonomy({
    structuralRecords: theoreticalCurriculumCatalog,
    registry: taxonomyRegistry,
    taxonomyNodes: knowledgeTaxonomyNodes,
  })
  assert.equal(report.valid, true)
  assert.equal(report.registryEntryCount, 2)
  assert.equal(report.taxonomyNodeCount, 57)
  assert.deepEqual(report.statusCounts, { EMPTY: 0, DRAFT: 2, REVIEWED: 0, APPROVED: 0 })
  assert.deepEqual(report.kindCounts, { TOPIC: 4, SUBTOPIC: 10, CONCEPT: 15, SKILL: 15, QUESTION_PATTERN: 13 })
  assert.deepEqual(report.issues, [])
})

test('validator accepts the future reviewed taxonomy hierarchy', () => {
  const nodes = [
    taxonomyNode('tax-topic', 'TOPIC', null),
    taxonomyNode('tax-subtopic', 'SUBTOPIC', 'tax-topic'),
    taxonomyNode('tax-concept', 'CONCEPT', 'tax-subtopic'),
    taxonomyNode('tax-skill', 'SKILL', 'tax-concept'),
    taxonomyNode('tax-pattern', 'QUESTION_PATTERN', 'tax-skill'),
  ]
  const report = validateKnowledgeTaxonomy({
    structuralRecords: theoreticalCurriculumCatalog,
    registry: registry(),
    taxonomyNodes: nodes,
  })
  assert.equal(report.valid, true, JSON.stringify(report.issues))
  assert.deepEqual(report.kindCounts, {
    TOPIC: 1,
    SUBTOPIC: 1,
    CONCEPT: 1,
    SKILL: 1,
    QUESTION_PATTERN: 1,
  })
})

test('validator rejects topic without an existing parent curriculum node', () => {
  const report = validateKnowledgeTaxonomy({
    structuralRecords: theoreticalCurriculumCatalog,
    registry: registry(),
    taxonomyNodes: [taxonomyNode('tax-topic', 'TOPIC', null, { curriculumNodeId: 'missing.structural.node' })],
  })
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((item) => item.code === 'TAXONOMY_CURRICULUM_NODE_NOT_FOUND'))
})

test('validator rejects concept without a topic or subtopic parent', () => {
  const report = validateKnowledgeTaxonomy({
    structuralRecords: theoreticalCurriculumCatalog,
    registry: registry(),
    taxonomyNodes: [taxonomyNode('tax-concept', 'CONCEPT', null)],
  })
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((item) => item.code === 'INVALID_TAXONOMY_PARENT'))
})

test('validator rejects duplicate taxonomy keys', () => {
  const report = validateKnowledgeTaxonomy({
    structuralRecords: theoreticalCurriculumCatalog,
    registry: registry(),
    taxonomyNodes: [
      taxonomyNode('duplicate-key', 'TOPIC', null),
      taxonomyNode('duplicate-key', 'TOPIC', null),
    ],
  })
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((item) => item.code === 'DUPLICATE_TAXONOMY_KEY'))
})

test('validator rejects cross-subject structural and taxonomy ownership', () => {
  const nodes = [
    taxonomyNode('tax-topic', 'TOPIC', null),
    taxonomyNode('foreign-subtopic', 'SUBTOPIC', 'tax-topic', {
      subjectId: 'experimental.g10.physics1',
      curriculumNodeId: 'experimental.g10.physics1.chapter.2653',
    }),
  ]
  const report = validateKnowledgeTaxonomy({
    structuralRecords: theoreticalCurriculumCatalog,
    registry: [
      ...registry(),
      {
        subjectId: 'experimental.g10.physics1',
        curriculumVersionId: versionId,
        curriculumNodeId: 'experimental.g10.physics1',
        taxonomyStatus: 'DRAFT',
      },
    ],
    taxonomyNodes: nodes,
  })
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((item) => item.code === 'CROSS_SUBJECT_OWNERSHIP'))
})

test('EMPTY registry cannot hide populated taxonomy nodes', () => {
  const report = validateKnowledgeTaxonomy({
    structuralRecords: theoreticalCurriculumCatalog,
    registry: registry('EMPTY'),
    taxonomyNodes: [taxonomyNode('tax-topic', 'TOPIC', null)],
  })
  assert.equal(report.valid, false)
  assert.ok(report.issues.some((item) => item.code === 'EMPTY_REGISTRY_HAS_NODES'))
})

test('knowledge foundation does not modify or reinterpret structural curriculum', () => {
  assert.equal(theoreticalCurriculumCatalog.length, 535)
  assert.equal(
    theoreticalCurriculumCatalog.filter((record) => record.proposedNodeTypeCode === 'TOPIC').length,
    285,
  )
  assert.ok(theoreticalCurriculumCatalog
    .filter((record) => record.proposedNodeTypeCode === 'TOPIC')
    .every((record) => /^(?:درس|Lesson)\s/u.test(record.displayLabel)))
  assert.equal(theoreticalCurriculumAuditReport.valid, true)
  assert.deepEqual(theoreticalCurriculumAuditReport.issues, [])
  assert.equal(
    theoreticalCurriculumFreezeManifest.catalogSha256,
    'ef04a21c556dbc716137d8291c44e933f73fc8fd3c538dc3dfd59a1f560164be',
  )
  assert.deepEqual(new Set(taxonomyRegistry.map((entry) => entry.subjectId)), new Set([
    'mathematics.g12.physics3',
    'shared.g10.arabic',
  ]))
  assert.ok(knowledgeTaxonomyNodes.every((node) =>
    (node.subjectId === 'mathematics.g12.physics3'
      && node.curriculumNodeId === 'mathematics.g12.physics3.chapter.4278')
    || (node.subjectId === 'shared.g10.arabic'
      && node.curriculumNodeId === 'shared.g10.arabic.lesson.186')))
})
