import assert from 'node:assert/strict'
import test from 'node:test'
import type { PublicUser } from '../src/auth/types.js'
import { buildCurriculumImportManifest } from '../src/curriculum/import-manifest.js'
import { createPrismaCurriculumStore } from '../src/curriculum/prisma-store.js'
import type { CurriculumImportManifestDraft } from '../src/curriculum/types.js'
import type { PrismaClient } from '../src/generated/prisma/client.js'

const timestamp = new Date('2026-09-18T00:00:00.000Z')
const admin: PublicUser = {
  createdAt: timestamp, email: 'admin@example.com', id: '10000000-0000-4000-8000-000000000001',
  phone: null, role: 'ADMIN', status: 'ACTIVE', updatedAt: timestamp,
}

const importDraft: CurriculumImportManifestDraft = {
  expectedRevision: 0,
  idempotencyKey: 'initial-import-idempotency',
  records: [{
    displayLabel: 'ریشه', proposedNodeTypeCode: 'CURRICULUM_ROOT', rawText: 'ریشه',
    sourceLocator: 'fixture:1', sourceOrder: 0, sourceRecordKey: 'src.root.001',
  }],
  transcriptionId: 'canonical-fixture',
}

const manifest = buildCurriculumImportManifest(importDraft, {
  sourceArtifact: Buffer.from('source'), sourceArtifactName: 'cori.docx', transcription: Buffer.from('transcription'),
})

test('Prisma mutation boundary rejects a capability revoked after route authorization', async () => {
  let createCalls = 0
  const transaction = {
    curriculumCapabilityGrant: { count: async () => 0 },
    curriculumVersion: {
      create: async () => {
        createCalls += 1
        throw new Error('must not create')
      },
    },
    user: { count: async () => 1 },
  }
  const prisma = {
    $transaction: async (operation: (client: typeof transaction) => Promise<unknown>) => operation(transaction),
  } as unknown as PrismaClient
  const result = await createPrismaCurriculumStore(prisma).createVersion(
    admin,
    { reason: 'Create version after route check', versionLabel: 'v1' },
    { requestId: 'request-1' },
  )
  assert.deepEqual(result, { ok: false, reason: 'CAPABILITY_REVOKED' })
  assert.equal(createCalls, 0)
})

test('Prisma capability lookup requires an unrevoked and unexpired exact grant', async () => {
  const queries: unknown[] = []
  const prisma = {
    curriculumCapabilityGrant: {
      async count(query: unknown) {
        queries.push(query)
        return queries.length === 1 ? 0 : 1
      },
    },
  } as unknown as PrismaClient
  const effective = await createPrismaCurriculumStore(prisma).hasCapability(
    admin.id,
    'CURRICULUM_PUBLISH',
    timestamp,
  )
  assert.equal(effective, true)
  assert.deepEqual(queries, [
    { where: { capability: 'CURRICULUM_PUBLISH', expiresAt: { gt: timestamp }, revokedAt: null, userId: admin.id } },
    { where: { capability: 'CURRICULUM_PUBLISH', expiresAt: null, revokedAt: null, userId: admin.id } },
  ])
})

test('Prisma import boundary returns the original run for the same target and full manifest identity', async () => {
  const existing = {
    ...manifest,
    acceptedCount: 1,
    ambiguousCount: 0,
    completedAt: timestamp,
    createdAt: timestamp,
    excludedCount: 0,
    failedAt: null,
    failureCode: null,
    id: '20000000-0000-4000-8000-000000000001',
    importedById: admin.id,
    rejectedCount: 0,
    report: {},
    retryOfImportId: null,
    startedAt: timestamp,
    status: 'COMPLETED',
    targetVersionId: '30000000-0000-4000-8000-000000000001',
    unchangedCount: 0,
    updatedAt: timestamp,
  }
  const transaction = {
    curriculumCapabilityGrant: { count: async () => 1 },
    user: { count: async () => 1 },
  }
  const prisma = {
    $transaction: async (operation: (client: typeof transaction) => Promise<unknown>) => operation(transaction),
    curriculumImport: { findUnique: async () => existing },
  } as unknown as PrismaClient

  const result = await createPrismaCurriculumStore(prisma).executeImport(
    admin, existing.targetVersionId, manifest, { requestId: 'request-import-1' },
  )

  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.value.id, existing.id)
})

test('Prisma import boundary rejects idempotency reuse when provenance changes with the same records', async () => {
  const changedManifest = buildCurriculumImportManifest(importDraft, {
    sourceArtifact: Buffer.from('different source'), sourceArtifactName: 'cori.docx', transcription: Buffer.from('transcription'),
  })
  assert.equal(changedManifest.payloadChecksum, manifest.payloadChecksum)
  assert.notEqual(changedManifest.manifestChecksum, manifest.manifestChecksum)

  const transaction = {
    curriculumCapabilityGrant: { count: async () => 1 },
    user: { count: async () => 1 },
  }
  const prisma = {
    $transaction: async (operation: (client: typeof transaction) => Promise<unknown>) => operation(transaction),
    curriculumImport: {
      findUnique: async () => ({ manifestChecksum: manifest.manifestChecksum, payloadChecksum: manifest.payloadChecksum }),
    },
  } as unknown as PrismaClient

  const result = await createPrismaCurriculumStore(prisma).executeImport(
    admin, '30000000-0000-4000-8000-000000000001', changedManifest, { requestId: 'request-import-2' },
  )
  assert.deepEqual(result, { ok: false, reason: 'IMPORT_PAYLOAD_CONFLICT' })
})
