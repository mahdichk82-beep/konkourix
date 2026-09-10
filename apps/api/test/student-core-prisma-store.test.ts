import assert from 'node:assert/strict'
import test from 'node:test'
import type { PrismaClient } from '../src/generated/prisma/client.js'
import { createPrismaStudentCoreStore } from '../src/student-core/prisma-store.js'

test('Prisma plan and task queries skip cursor rows and fetch one lookahead row', async () => {
  const planQueries: unknown[] = []
  const taskQueries: unknown[] = []
  const prisma = {
    studyPlan: {
      async findMany(query: unknown) {
        planQueries.push(query)
        return []
      },
    },
    dailyTask: {
      async findMany(query: unknown) {
        taskQueries.push(query)
        return []
      },
    },
  } as unknown as PrismaClient
  const store = createPrismaStudentCoreStore(prisma)
  const scheduledFor = new Date('2026-09-03T00:00:00.000Z')

  await store.listPlans('student-profile-1', { cursor: 'plan-2', limit: 2, status: 'ACTIVE' })
  await store.listTasks('student-profile-1', {
    cursor: 'task-2',
    limit: 2,
    scheduledFor,
    status: 'PENDING',
    studyPlanId: 'plan-1',
    subjectId: 'subject-1',
  })

  assert.deepEqual(planQueries[0], {
    cursor: { id: 'plan-2' },
    orderBy: { startsOn: 'desc' },
    skip: 1,
    take: 3,
    where: { studentProfileId: 'student-profile-1', status: 'ACTIVE' },
  })
  assert.deepEqual(taskQueries[0], {
    cursor: { id: 'task-2' },
    orderBy: [{ scheduledFor: 'desc' }, { createdAt: 'desc' }],
    skip: 1,
    take: 3,
    where: {
      scheduledFor,
      status: 'PENDING',
      studentProfileId: 'student-profile-1',
      studyPlanId: 'plan-1',
      subjectId: 'subject-1',
    },
  })
})

test('Prisma task reads and updates always include student ownership', async () => {
  const findQueries: unknown[] = []
  const updateQueries: unknown[] = []
  const prisma = {
    dailyTask: {
      async findFirst(query: unknown) {
        findQueries.push(query)
        return null
      },
      async updateMany(query: unknown) {
        updateQueries.push(query)
        return { count: 0 }
      },
    },
  } as unknown as PrismaClient
  const store = createPrismaStudentCoreStore(prisma)

  const found = await store.findTaskById('student-profile-1', 'task-1')
  const updated = await store.updateTask('student-profile-1', 'task-1', {
    status: 'COMPLETED',
  })

  assert.equal(found, null)
  assert.equal(updated, null)
  assert.deepEqual(findQueries, [
    { where: { id: 'task-1', studentProfileId: 'student-profile-1' } },
  ])
  assert.deepEqual(updateQueries, [
    {
      data: { status: 'COMPLETED' },
      where: { id: 'task-1', studentProfileId: 'student-profile-1' },
    },
  ])
})
