import assert from 'node:assert/strict'
import test from 'node:test'
import type { PrismaClient } from '../src/generated/prisma/client.js'
import {
  developmentSeedIds,
  seedDomainData,
} from '../src/seed/domain-seed.js'

test('development domain seed is deterministic and idempotent by key', async () => {
  const calls: Array<{ model: string; where: unknown }> = []
  const upsert = (model: string) => async (input: { where: unknown }) => {
    calls.push({ model, where: input.where })
    return {}
  }
  const transaction = {
    user: { upsert: upsert('user') },
    studentProfile: { upsert: upsert('studentProfile') },
    counselorProfile: { upsert: upsert('counselorProfile') },
    studentCounselor: { upsert: upsert('studentCounselor') },
  }
  const prisma = {
    $transaction: async (callback: (tx: typeof transaction) => Promise<void>) => callback(transaction),
  } as unknown as PrismaClient

  const previousEnvironment = process.env.NODE_ENV
  process.env.NODE_ENV = 'test'
  try {
    await seedDomainData(prisma)
  } finally {
    if (previousEnvironment === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = previousEnvironment
  }

  assert.deepEqual(calls, [
    { model: 'user', where: { id: developmentSeedIds.student } },
    { model: 'user', where: { id: developmentSeedIds.counselor } },
    { model: 'user', where: { id: developmentSeedIds.admin } },
    { model: 'studentProfile', where: { userId: developmentSeedIds.student } },
    { model: 'counselorProfile', where: { userId: developmentSeedIds.counselor } },
    {
      model: 'studentCounselor',
      where: {
        studentId_counselorId: {
          studentId: developmentSeedIds.student,
          counselorId: developmentSeedIds.counselor,
        },
      },
    },
  ])
})

test('development domain seed refuses production', async () => {
  const prisma = {} as PrismaClient
  const previousEnvironment = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  try {
    await assert.rejects(seedDomainData(prisma), /cannot run in production/)
  } finally {
    if (previousEnvironment === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = previousEnvironment
  }
})
