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

test('Prisma session finish atomically retains ownership and unfinished predicates', async () => {
  const finds: unknown[] = []
  const locks: unknown[][] = []
  const updates: unknown[] = []
  const startedAt = new Date('2026-09-03T08:00:00.000Z')
  const endedAt = new Date('2026-09-03T09:00:00.000Z')
  const session = {
    id: 'session-1',
    studentProfileId: 'student-profile-1',
    subjectId: null,
    dailyTaskId: 'task-1',
    startedAt,
    endedAt: null,
    notes: null,
    createdAt: startedAt,
    updatedAt: startedAt,
  }
  const transaction = {
    async $queryRawUnsafe(...args: unknown[]) {
      locks.push(args)
      return [{ id: 'student-profile-1' }]
    },
    studySession: {
      async findFirst(query: unknown) {
        finds.push(query)
        return finds.length === 1 ? session : { ...session, endedAt }
      },
      async updateMany(query: unknown) {
        updates.push(query)
        return { count: 1 }
      },
    },
  }
  const prisma = {
    async $transaction<T>(operation: (client: typeof transaction) => Promise<T>) {
      return operation(transaction)
    },
  } as unknown as PrismaClient
  const store = createPrismaStudyTrackingStore(prisma)

  const result = await store.finishSession('student-profile-1', 'session-1', endedAt, 'Done')

  assert.equal(result.ok, true)
  assert.deepEqual(locks, [[
    'SELECT "id" FROM "student_profiles" WHERE "id" = $1::uuid FOR UPDATE',
    'student-profile-1',
  ]])
  assert.deepEqual(finds, [
    { where: { id: 'session-1', studentProfileId: 'student-profile-1' } },
    { where: { id: 'session-1', studentProfileId: 'student-profile-1' } },
  ])
  assert.deepEqual(updates, [{
    data: { endedAt, notes: 'Done' },
    where: {
      endedAt: null,
      id: 'session-1',
      startedAt: { lt: endedAt },
      studentProfileId: 'student-profile-1',
    },
  }])
})

test('Prisma live start locks the student row before inspecting active sessions', async () => {
  const calls: string[] = []
  const startedAt = new Date('2026-09-03T08:00:00.000Z')
  const created = {
    id: 'session-1',
    studentProfileId: 'student-profile-1',
    subjectId: 'subject-1',
    dailyTaskId: 'task-1',
    startedAt,
    endedAt: null,
    notes: null,
    createdAt: startedAt,
    updatedAt: startedAt,
  }
  const transaction = {
    async $queryRawUnsafe(sql: string, profileId: string) {
      calls.push(`lock:${profileId}`)
      assert.equal(sql, 'SELECT "id" FROM "student_profiles" WHERE "id" = $1::uuid FOR UPDATE')
      return [{ id: profileId }]
    },
    dailyTask: {
      async findFirst() {
        calls.push('task')
        return {
          id: 'task-1',
          studentProfileId: 'student-profile-1',
          subjectId: 'subject-1',
          status: 'PENDING',
          subject: { archivedAt: null },
        }
      },
    },
    studySession: {
      async findFirst() {
        calls.push('active')
        return null
      },
      async create(query: { data: unknown }) {
        calls.push('create')
        assert.deepEqual(query.data, {
          dailyTaskId: 'task-1',
          endedAt: null,
          notes: null,
          startedAt,
          studentProfileId: 'student-profile-1',
          subjectId: 'subject-1',
        })
        return created
      },
    },
  }
  const prisma = {
    async $transaction<T>(operation: (client: typeof transaction) => Promise<T>) {
      return operation(transaction)
    },
  } as unknown as PrismaClient

  const result = await createPrismaStudyTrackingStore(prisma)
    .startTaskSession('student-profile-1', 'task-1', startedAt)

  assert.deepEqual(calls, ['lock:student-profile-1', 'task', 'active', 'create'])
  assert.deepEqual(result, { ok: true, reused: false, value: created })
})

test('Prisma switch closes and starts intervals at one logical timestamp under the same lock', async () => {
  const calls: string[] = []
  const transitionAt = new Date('2026-09-03T08:25:00.000Z')
  const active = {
    id: 'session-a', studentProfileId: 'student-profile-1', subjectId: 'subject-a',
    dailyTaskId: 'task-a', startedAt: new Date('2026-09-03T08:00:00.000Z'),
    endedAt: null, notes: null, createdAt: new Date('2026-09-03T08:00:00.000Z'),
    updatedAt: new Date('2026-09-03T08:00:00.000Z'),
  }
  const finished = { ...active, endedAt: transitionAt, updatedAt: transitionAt }
  const next = {
    ...active,
    id: 'session-b',
    dailyTaskId: 'task-b',
    subjectId: 'subject-b',
    startedAt: transitionAt,
    createdAt: transitionAt,
    updatedAt: transitionAt,
  }
  let findCount = 0
  const transaction = {
    async $queryRawUnsafe() {
      calls.push('lock')
      return [{ id: 'student-profile-1' }]
    },
    dailyTask: {
      async findFirst() {
        calls.push('task')
        return {
          id: 'task-b', studentProfileId: 'student-profile-1', subjectId: 'subject-b',
          status: 'PENDING', subject: { archivedAt: null },
        }
      },
    },
    studySession: {
      async findFirst() {
        findCount += 1
        calls.push(findCount === 1 ? 'active' : 'finished')
        return findCount === 1 ? active : finished
      },
      async updateMany(query: { data: { endedAt: Date } }) {
        calls.push('finish')
        assert.equal(query.data.endedAt, transitionAt)
        return { count: 1 }
      },
      async create(query: { data: { startedAt: Date } }) {
        calls.push('create')
        assert.equal(query.data.startedAt, transitionAt)
        return next
      },
    },
  }
  const prisma = {
    async $transaction<T>(operation: (client: typeof transaction) => Promise<T>) {
      return operation(transaction)
    },
  } as unknown as PrismaClient

  const result = await createPrismaStudyTrackingStore(prisma)
    .switchTaskSession('student-profile-1', 'task-b', transitionAt)

  assert.deepEqual(calls, ['lock', 'task', 'active', 'finish', 'finished', 'create'])
  assert.deepEqual(result, {
    ok: true,
    value: { activeSession: next, finishedSession: finished },
  })
})

test('different students lock independently and may each start one live session', async () => {
  const lockedProfiles: string[] = []
  const createdProfiles: string[] = []
  const transaction = {
    async $queryRawUnsafe(_sql: string, profileId: string) {
      lockedProfiles.push(profileId)
      return [{ id: profileId }]
    },
    dailyTask: {
      async findFirst(query: { where: { studentProfileId: string } }) {
        const profileId = query.where.studentProfileId
        return {
          id: `task-${profileId}`,
          studentProfileId: profileId,
          subjectId: null,
          status: 'PENDING',
          subject: null,
        }
      },
    },
    studySession: {
      async findFirst() { return null },
      async create(query: { data: { studentProfileId: string; startedAt: Date } }) {
        createdProfiles.push(query.data.studentProfileId)
        return {
          ...query.data,
          id: `session-${query.data.studentProfileId}`,
          createdAt: query.data.startedAt,
          updatedAt: query.data.startedAt,
        }
      },
    },
  }
  const prisma = {
    async $transaction<T>(operation: (client: typeof transaction) => Promise<T>) {
      return operation(transaction)
    },
  } as unknown as PrismaClient
  const store = createPrismaStudyTrackingStore(prisma)
  const startedAt = new Date('2026-09-03T08:00:00.000Z')

  const results = await Promise.all([
    store.startTaskSession('profile-a', 'task-profile-a', startedAt),
    store.startTaskSession('profile-b', 'task-profile-b', startedAt),
  ])

  assert.equal(results.every((result) => result.ok), true)
  assert.deepEqual(lockedProfiles.sort(), ['profile-a', 'profile-b'])
  assert.deepEqual(createdProfiles.sort(), ['profile-a', 'profile-b'])
})
