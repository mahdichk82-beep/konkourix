import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'
import type { AuthService } from '../src/auth/auth-service.js'
import type { PublicUser } from '../src/auth/types.js'
import { createCurriculumServices } from '../src/curriculum/services.js'
import type { CurriculumStore } from '../src/curriculum/store.js'
import type { CurriculumCapability, CurriculumNodeRecord, CurriculumVersionRecord } from '../src/curriculum/types.js'

const timestamp = new Date('2026-09-18T00:00:00.000Z')
const admin: PublicUser = {
  createdAt: timestamp, email: 'admin@example.com', id: '10000000-0000-4000-8000-000000000001',
  phone: null, role: 'ADMIN', status: 'ACTIVE', updatedAt: timestamp,
}
const student: PublicUser = { ...admin, email: 'student@example.com', id: '10000000-0000-4000-8000-000000000002', role: 'STUDENT' }
const version: CurriculumVersionRecord = {
  basedOnVersionId: null, createdAt: timestamp, createdById: admin.id, effectiveFrom: null,
  id: '20000000-0000-4000-8000-000000000001', publishedAt: timestamp,
  publishedById: admin.id, revision: 1, reviewedAt: timestamp, sourceSummary: 'cori.docx',
  status: 'PUBLISHED', supersededAt: null, updatedAt: timestamp, versionLabel: '1405-v1',
}
const node: CurriculumNodeRecord = {
  availabilityStatus: 'ACTIVE', createdAt: timestamp,
  curriculumNodeId: '30000000-0000-4000-8000-000000000001',
  curriculumVersionId: version.id, deprecationReason: null,
  displayName: 'زیست‌شناسی', nodeTypeCode: 'SUBJECT',
  nodeTypeId: '20000000-0000-4000-8000-000000000004', parentNodeId: null,
  provenance: { sourceLocator: 'protected-locator' }, searchName: 'زیست‌شناسی',
  siblingPosition: 0, sourceDisplayName: 'زیست‌شناسی', sourceOrder: 12,
  updatedAt: timestamp,
}

const authFor = (user: PublicUser): AuthService => ({
  authenticateAccessToken: async () => user,
  changePassword: async () => undefined,
  getCurrentUser: async () => user,
  login: async () => { throw new Error('not used') },
  logout: async () => undefined,
  logoutAll: async () => undefined,
  refresh: async () => { throw new Error('not used') },
  register: async () => { throw new Error('not used') },
})

const makeStore = (
  capabilities: CurriculumCapability[] = [],
  overrides: Partial<CurriculumStore> = {},
): CurriculumStore => new Proxy({
  findCurrentPublishedVersion: async () => version,
  findPublishedVersion: async (id: string) => id === version.id ? version : null,
  hasCapability: async (_id: string, capability: CurriculumCapability) => capabilities.includes(capability),
  listVersions: async () => ({ items: [version], nextCursor: null }),
  ...overrides,
}, {
  get(target, property) {
    if (property in target) return target[property as keyof typeof target]
    return async () => { throw new Error(`Unexpected store call: ${String(property)}`) }
  },
}) as CurriculumStore

const createApp = (user: PublicUser, capabilities: CurriculumCapability[] = []) => buildApp({
  auth: authFor(user),
  curriculum: createCurriculumServices(makeStore(capabilities)),
  environment: 'test', logger: false,
  prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
})

test('authenticated students can read published curriculum metadata', async () => {
  const app = createApp(student)
  const response = await app.inject({ headers: { authorization: 'Bearer token' }, method: 'GET', url: '/api/v1/curriculum/versions/current' })
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().data.id, version.id)
  assert.equal(response.json().data.status, 'PUBLISHED')
  assert.equal('createdById' in response.json().data, false)
  assert.equal('publishedById' in response.json().data, false)
  await app.close()
})

test('published node responses omit protected source and administrative metadata', async () => {
  const app = buildApp({
    auth: authFor(student),
    curriculum: createCurriculumServices(makeStore([], { findNode: async () => node })),
    environment: 'test', logger: false,
    prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  })
  const response = await app.inject({
    headers: { authorization: 'Bearer token' }, method: 'GET',
    url: `/api/v1/curriculum/versions/${version.id}/nodes/${node.curriculumNodeId}`,
  })
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().data.displayName, node.displayName)
  assert.equal('provenance' in response.json().data, false)
  assert.equal('sourceDisplayName' in response.json().data, false)
  assert.equal('searchName' in response.json().data, false)
  await app.close()
})

test('published curriculum endpoints require authentication', async () => {
  const app = createApp(student)
  const response = await app.inject({ method: 'GET', url: '/api/v1/curriculum/versions/current' })
  assert.equal(response.statusCode, 401)
  assert.equal(response.json().error.code, 'TOKEN_MISSING')
  await app.close()
})

test('admin curriculum routes deny role-only administrators and allow exact grants', async () => {
  const deniedApp = createApp(admin)
  const denied = await deniedApp.inject({ headers: { authorization: 'Bearer token' }, method: 'GET', url: '/api/v1/admin/curriculum/versions' })
  assert.equal(denied.statusCode, 403)
  assert.equal(denied.json().error.code, 'CURRICULUM_CAPABILITY_FORBIDDEN')
  await deniedApp.close()

  const allowedApp = createApp(admin, ['CURRICULUM_DRAFT_READ'])
  const allowed = await allowedApp.inject({ headers: { authorization: 'Bearer token' }, method: 'GET', url: '/api/v1/admin/curriculum/versions?limit=10' })
  assert.equal(allowed.statusCode, 200)
  assert.equal(allowed.json().data.items[0].id, version.id)
  await allowedApp.close()
})

test('student roles cannot use curriculum administration even if a stale grant exists', async () => {
  const app = createApp(student, ['CURRICULUM_DRAFT_READ'])
  const response = await app.inject({ headers: { authorization: 'Bearer token' }, method: 'GET', url: '/api/v1/admin/curriculum/versions' })
  assert.equal(response.statusCode, 403)
  assert.equal(response.json().error.code, 'ROLE_FORBIDDEN')
  await app.close()
})

test('admin mutation schemas reject server-owned actor and lifecycle fields', async () => {
  const app = createApp(admin, ['CURRICULUM_DRAFT_EDIT'])
  const response = await app.inject({
    headers: { authorization: 'Bearer token' }, method: 'POST',
    payload: {
      createdById: student.id,
      publishedAt: '2026-09-18T00:00:00.000Z',
      reason: 'Attempt forged version creation',
      status: 'PUBLISHED',
      versionLabel: 'forged',
    },
    url: '/api/v1/admin/curriculum/versions',
  })
  assert.equal(response.statusCode, 400)
  assert.equal(response.json().error.code, 'VALIDATION_ERROR')
  await app.close()
})

test('curriculum admin and published-read routes have independent release controls', async () => {
  const services = createCurriculumServices(makeStore(['CURRICULUM_DRAFT_READ']))
  const readOnlyApp = buildApp({
    auth: authFor(admin), curriculum: services,
    curriculumAdminEnabled: false, curriculumReadEnabled: true,
    environment: 'test', logger: false,
    prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  })
  const published = await readOnlyApp.inject({ headers: { authorization: 'Bearer token' }, method: 'GET', url: '/api/v1/curriculum/versions/current' })
  const adminResponse = await readOnlyApp.inject({ headers: { authorization: 'Bearer token' }, method: 'GET', url: '/api/v1/admin/curriculum/versions' })
  assert.equal(published.statusCode, 200)
  assert.equal(adminResponse.statusCode, 404)
  await readOnlyApp.close()

  const adminOnlyApp = buildApp({
    auth: authFor(admin), curriculum: services,
    curriculumAdminEnabled: true, curriculumReadEnabled: false,
    environment: 'test', logger: false,
    prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  })
  const hiddenPublished = await adminOnlyApp.inject({ headers: { authorization: 'Bearer token' }, method: 'GET', url: '/api/v1/curriculum/versions/current' })
  const visibleAdmin = await adminOnlyApp.inject({ headers: { authorization: 'Bearer token' }, method: 'GET', url: '/api/v1/admin/curriculum/versions' })
  assert.equal(hiddenPublished.statusCode, 404)
  assert.equal(visibleAdmin.statusCode, 200)
  await adminOnlyApp.close()
})
