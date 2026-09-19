import assert from 'node:assert/strict'
import test from 'node:test'
import type { PublicUser } from '../src/auth/types.js'
import { createCurriculumServices } from '../src/curriculum/services.js'
import type { CurriculumStore } from '../src/curriculum/store.js'
import type { CurriculumCapability, CurriculumNodeRecord, CurriculumVersionRecord } from '../src/curriculum/types.js'
import { ApiError } from '../src/errors/api-error.js'

const timestamp = new Date('2026-09-18T00:00:00.000Z')
const admin: PublicUser = {
  createdAt: timestamp, email: 'admin@example.com', id: '10000000-0000-4000-8000-000000000001',
  phone: null, role: 'ADMIN', status: 'ACTIVE', updatedAt: timestamp,
}
const student: PublicUser = { ...admin, email: 'student@example.com', id: '10000000-0000-4000-8000-000000000002', role: 'STUDENT' }
const version: CurriculumVersionRecord = {
  basedOnVersionId: null, createdAt: timestamp, createdById: admin.id, effectiveFrom: null,
  id: '20000000-0000-4000-8000-000000000001', publishedAt: timestamp,
  publishedById: admin.id, revision: 3, reviewedAt: timestamp, sourceSummary: 'cori.docx',
  status: 'PUBLISHED', supersededAt: null, updatedAt: timestamp, versionLabel: '1405-v1',
}
const rootNode: CurriculumNodeRecord = {
  availabilityStatus: 'ACTIVE', createdAt: timestamp,
  curriculumNodeId: '30000000-0000-4000-8000-000000000001', curriculumVersionId: version.id,
  deprecationReason: null, displayName: 'برنامه درسی', nodeTypeCode: 'CURRICULUM_ROOT',
  nodeTypeId: '40000000-0000-4000-8000-000000000001', parentNodeId: null,
  provenance: { protected: true }, searchName: 'برنامه درسی', siblingPosition: 0,
  sourceDisplayName: 'برنامه درسی', sourceOrder: 0, updatedAt: timestamp,
}
const subjectNode: CurriculumNodeRecord = {
  ...rootNode,
  curriculumNodeId: '30000000-0000-4000-8000-000000000002',
  displayName: 'زیست‌شناسی', nodeTypeCode: 'SUBJECT', parentNodeId: rootNode.curriculumNodeId,
  searchName: 'زیست‌شناسی', siblingPosition: 1, sourceDisplayName: 'زیست‌شناسی', sourceOrder: 1,
}

const makeStore = (
  capabilities: CurriculumCapability[] = [],
  overrides: Partial<CurriculumStore> = {},
): CurriculumStore => new Proxy({
  hasCapability: async (_userId: string, capability: CurriculumCapability) => capabilities.includes(capability),
  ...overrides,
}, {
  get(target, property) {
    if (property in target) return target[property as keyof typeof target]
    return async () => { throw new Error(`Unexpected store call: ${String(property)}`) }
  },
}) as CurriculumStore

const expectCode = async (operation: () => Promise<unknown>, code: string) => {
  await assert.rejects(operation, (error: unknown) => error instanceof ApiError && error.code === code)
}

test('published curriculum reads allow active product roles and reject inactive users', async () => {
  const services = createCurriculumServices(makeStore([], { findCurrentPublishedVersion: async () => version }))
  assert.equal((await services.currentPublished(student)).id, version.id)
  await expectCode(() => services.currentPublished({ ...student, status: 'SUSPENDED' }), 'ACCOUNT_INACTIVE')
})

test('ADMIN role alone grants no curriculum administrative capability', async () => {
  const services = createCurriculumServices(makeStore())
  await expectCode(() => services.listVersions(admin), 'CURRICULUM_CAPABILITY_FORBIDDEN')
  await expectCode(() => services.listNodeTypes(admin), 'CURRICULUM_CAPABILITY_FORBIDDEN')
  await expectCode(() => services.listCapabilityGrants(admin), 'CURRICULUM_CAPABILITY_FORBIDDEN')
})

test('each administrative family checks its exact independent capability', async () => {
  const services = createCurriculumServices(makeStore(['CURRICULUM_DRAFT_READ']))
  const context = { requestId: 'request-1' }
  const calls: Array<() => Promise<unknown>> = [
    () => services.createVersion(admin, { reason: 'Create reviewed draft', versionLabel: 'v1' }, context),
    () => services.executeImport(admin, version.id, {} as never, context),
    () => services.listSourceRecords(admin, '30000000-0000-4000-8000-000000000001'),
    () => services.resolveImportIssue(admin, '30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', {} as never, context),
    () => services.recordReviewDecision(admin, version.id, {} as never, context),
    () => services.publishVersion(admin, version.id, {} as never, context),
    () => services.createNodeMapping(admin, {} as never, context),
    () => services.listAudit(admin),
    () => services.listCapabilityGrants(admin),
  ]
  for (const call of calls) await expectCode(call, 'CURRICULUM_CAPABILITY_FORBIDDEN')
})

test('exact capability permits its query without implying unrelated capabilities', async () => {
  let versionQueries = 0
  const services = createCurriculumServices(makeStore(['CURRICULUM_DRAFT_READ'], {
    listVersions: async () => {
      versionQueries += 1
      return { items: [version], nextCursor: null }
    },
  }))
  assert.equal((await services.listVersions(admin)).items[0]?.id, version.id)
  assert.equal(versionQueries, 1)
  await expectCode(() => services.listAudit(admin), 'CURRICULUM_CAPABILITY_FORBIDDEN')
})

test('permission administrator cannot self-grant through the service boundary', async () => {
  const services = createCurriculumServices(makeStore(['CURRICULUM_PERMISSION_MANAGE']))
  await expectCode(() => services.grantCapability(admin, {
    capability: 'CURRICULUM_PUBLISH', reason: 'Escalate myself', userId: admin.id,
  }, { requestId: 'request-2' }), 'CURRICULUM_SELF_GRANT_FORBIDDEN')
})

test('store concurrency conflicts become explicit API conflicts', async () => {
  const services = createCurriculumServices(makeStore(['CURRICULUM_DRAFT_EDIT'], {
    updateVersion: async () => ({ ok: false, reason: 'STALE_REVISION', currentRevision: 7 }),
  }))
  await assert.rejects(
    () => services.updateVersion(admin, version.id, {
      expectedRevision: 4, reason: 'Update source summary', sourceSummary: 'updated',
    }, { requestId: 'request-3' }),
    (error: unknown) => error instanceof ApiError
      && error.code === 'CURRICULUM_STALE_REVISION'
      && (error.details as { currentRevision: number }).currentRevision === 7,
  )
})

test('published search returns distinguishing ancestry without protected provenance', async () => {
  let batchPathQueries = 0
  const services = createCurriculumServices(makeStore([], {
    findPublishedVersion: async () => version,
    getPaths: async () => {
      batchPathQueries += 1
      return new Map([[subjectNode.curriculumNodeId, [rootNode, subjectNode]]])
    },
    searchNodes: async () => ({ items: [subjectNode], nextCursor: null }),
  }))
  const result = await services.publishedSearch(student, version.id, 'زیست')
  assert.equal(batchPathQueries, 1)
  assert.equal(result.items[0]?.displayName, 'زیست‌شناسی')
  assert.equal(result.items[0]?.ancestry[0]?.displayName, 'برنامه درسی')
  assert.equal('provenance' in (result.items[0] ?? {}), false)
})
