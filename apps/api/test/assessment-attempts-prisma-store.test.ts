import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import type { PrismaClient } from '../src/generated/prisma/client.js'
import { createPrismaAssessmentAttemptStore } from '../src/assessment-attempts/prisma-store.js'

test('Prisma assessment reads and writes retain student ownership and validity predicates', async () => {
  const listQueries: unknown[] = []
  const updateQueries: unknown[] = []
  const invalidateQueries: unknown[] = []
  const transaction = {
    async $queryRawUnsafe() { return [{ id: 'student-profile' }] },
    assessmentAttempt: {
      async findMany(query: unknown) { listQueries.push(query); return [] },
      async findFirst() { return null },
      async updateMany(query: { data: { invalidatedAt?: Date } }) {
        if ('invalidatedAt' in query.data) invalidateQueries.push(query)
        else updateQueries.push(query)
        return { count: 0 }
      },
    },
  }
  const prisma = {
    ...transaction,
    async $transaction<T>(operation: (client: typeof transaction) => Promise<T>) {
      return operation(transaction)
    },
  } as unknown as PrismaClient
  const store = createPrismaAssessmentAttemptStore(prisma)

  await store.listAttempts('student-profile', { limit: 20 })
  await store.updateAttempt('student-profile', 'attempt', { correctCount: 2 })
  await store.invalidateAttempt('student-profile', 'attempt', new Date('2026-09-13T12:00:00.000Z'))

  assert.deepEqual(listQueries, [{
    cursor: undefined,
    orderBy: [{ endedAt: 'desc' }, { id: 'desc' }],
    skip: undefined,
    take: 21,
    where: { dailyTaskId: undefined, studentProfileId: 'student-profile' },
  }])
  assert.deepEqual(updateQueries, [{
    data: { correctCount: 2 },
    where: { id: 'attempt', invalidatedAt: null, studentProfileId: 'student-profile' },
  }])
  assert.equal(invalidateQueries.length, 1)
  assert.deepEqual((invalidateQueries[0] as { where: unknown }).where, {
    id: 'attempt', invalidatedAt: null, studentProfileId: 'student-profile',
  })
})

test('assessment migration creates one completed-attempt table with required integrity constraints', () => {
  const migration = readFileSync(
    '../../database/prisma/migrations/20260913230000_add_assessment_attempt_foundation/migration.sql',
    'utf8',
  )
  assert.match(migration, /CREATE TABLE "assessment_attempts"/)
  assert.match(migration, /CHECK \("endedAt" > "startedAt"\)/)
  assert.match(migration, /"correctCount" >= 0 AND "incorrectCount" >= 0 AND "blankCount" >= 0/)
  assert.match(migration, /"correctCount" \+ "incorrectCount" \+ "blankCount" > 0/)
  assert.match(migration, /"topicId" IS NULL OR "subjectId" IS NOT NULL/)
  assert.doesNotMatch(migration, /StudySession|study_sessions/)
})
