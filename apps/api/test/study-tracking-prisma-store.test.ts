import assert from 'node:assert/strict'
import test from 'node:test'
import type { PrismaClient } from '../src/generated/prisma/client.js'
import { createPrismaStudyTrackingStore } from '../src/study-tracking/prisma-store.js'

test('Prisma task-session reads retain student and task ownership filters', async () => {
  const queries: unknown[] = []
  const prisma = {
    studySession: {
      async findMany(query: unknown) {
        queries.push(query)
        return []
      },
    },
  } as unknown as PrismaClient
  const store = createPrismaStudyTrackingStore(prisma)

  await store.listSessions('student-profile-1', {
    dailyTaskId: 'task-1',
    limit: 20,
  })

  assert.deepEqual(queries, [{
    cursor: undefined,
    orderBy: { startedAt: 'desc' },
    skip: undefined,
    take: 21,
    where: {
      dailyTaskId: 'task-1',
      startedAt: undefined,
      studentProfileId: 'student-profile-1',
      subjectId: undefined,
    },
  }])
})
