import assert from 'node:assert/strict'
import test from 'node:test'
import type { PrismaClient } from '../src/generated/prisma/client.js'
import { createCounselorTaskServices } from '../src/counselor-tasks/services.js'
import { createPrismaCounselorTaskStore } from '../src/counselor-tasks/prisma-store.js'

const ids = {
  counselor: '10000000-0000-4000-8000-000000000001',
  student: '30000000-0000-4000-8000-000000000001',
  subject: '40000000-0000-4000-8000-000000000001',
  topic: '50000000-0000-4000-8000-000000000001',
  task: '60000000-0000-4000-8000-000000000001',
} as const

const timestamp = new Date('2026-09-11T00:00:00.000Z')

test('Prisma counselor task visibility is assignment-scoped and does not select creator identity', async () => {
  const profileQueries: unknown[] = []
  const taskQueries: unknown[] = []
  const transaction = {
    studentProfile: {
      async findFirst(query: unknown) {
        profileQueries.push(query)
        return { id: ids.student }
      },
    },
    dailyTask: {
      async findMany(query: unknown) {
        taskQueries.push(query)
        return [{
          completedAt: null,
          createdAt: timestamp,
          description: null,
          estimatedMinutes: 30,
          id: ids.task,
          scheduledFor: timestamp,
          source: 'PERSONAL',
          status: 'PENDING',
          studySessions: [
            {
              endedAt: new Date('2026-09-11T09:30:00.000Z'),
              startedAt: new Date('2026-09-11T09:00:00.000Z'),
            },
            {
              endedAt: new Date('2026-09-11T10:45:00.000Z'),
              startedAt: new Date('2026-09-11T10:00:00.000Z'),
            },
          ],
          studentProfileId: ids.student,
          studyPlanId: null,
          subjectId: null,
          title: 'Visible task',
          topicId: null,
          updatedAt: timestamp,
        }]
      },
    },
  }
  const prisma = {
    async $transaction<T>(operation: (client: typeof transaction) => Promise<T>) {
      return operation(transaction)
    },
  } as unknown as PrismaClient
  const services = createCounselorTaskServices(createPrismaCounselorTaskStore(prisma))

  const result = await services.list(
    { id: ids.counselor, role: 'COUNSELOR', status: 'ACTIVE' },
    ids.student,
    { limit: 25 },
  )

  assert.deepEqual(profileQueries, [{
    select: { id: true },
    where: {
      id: ids.student,
      user: {
        studentRelationships: {
          some: { counselorId: ids.counselor, status: 'ACTIVE' },
        },
      },
    },
  }])
  assert.deepEqual(taskQueries, [{
    cursor: undefined,
    orderBy: [{ scheduledFor: 'desc' }, { createdAt: 'desc' }],
    select: {
      completedAt: true,
      createdAt: true,
      description: true,
      estimatedMinutes: true,
      id: true,
      scheduledFor: true,
      source: true,
      status: true,
      studySessions: { select: { endedAt: true, startedAt: true } },
      studentProfileId: true,
      studyPlanId: true,
      subjectId: true,
      title: true,
      topicId: true,
      updatedAt: true,
    },
    skip: undefined,
    take: 26,
    where: { studentProfileId: ids.student },
  }])
  assert.equal(result.items[0]?.source, 'PERSONAL')
  assert.equal(result.items[0]?.recordedMinutes, 75)
  assert.equal(result.items[0]?.studySessionCount, 2)
  assert.equal('createdByUserId' in (result.items[0] ?? {}), false)
})

test('Prisma counselor weekly visibility keeps assignment and student ownership predicates', async () => {
  const taskQueries: Array<{ where?: unknown }> = []
  const transaction = {
    studentProfile: {
      async findFirst() {
        return { id: ids.student }
      },
    },
    dailyTask: {
      async findMany(query: { where?: unknown }) {
        taskQueries.push(query)
        return []
      },
    },
  }
  const prisma = {
    async $transaction<T>(operation: (client: typeof transaction) => Promise<T>) {
      return operation(transaction)
    },
  } as unknown as PrismaClient
  const services = createCounselorTaskServices(createPrismaCounselorTaskStore(prisma))

  await services.list(
    { id: ids.counselor, role: 'COUNSELOR', status: 'ACTIVE' },
    ids.student,
    { scheduledFrom: '2026-09-12', scheduledTo: '2026-09-18' },
  )

  assert.deepEqual(taskQueries[0]?.where, {
    scheduledFor: {
      gte: new Date('2026-09-12T00:00:00.000Z'),
      lte: new Date('2026-09-18T00:00:00.000Z'),
    },
    studentProfileId: ids.student,
  })
})

test('Prisma counselor task creation validates assignment and relations atomically', async () => {
  const profileQueries: unknown[] = []
  const subjectQueries: unknown[] = []
  const topicQueries: unknown[] = []
  const taskCreates: Array<{ data: Record<string, unknown> }> = []
  let transactionCount = 0
  const transaction = {
    studentProfile: {
      async findFirst(query: unknown) {
        profileQueries.push(query)
        return { id: ids.student }
      },
    },
    studySubject: {
      async findFirst(query: unknown) {
        subjectQueries.push(query)
        return { id: ids.subject, archivedAt: null }
      },
    },
    topic: {
      async findFirst(query: unknown) {
        topicQueries.push(query)
        return { id: ids.topic, subjectId: ids.subject, archivedAt: null }
      },
    },
    dailyTask: {
      async create(input: { data: Record<string, unknown> }) {
        taskCreates.push(input)
        return { id: ids.task, ...input.data, createdAt: timestamp, updatedAt: timestamp }
      },
    },
  }
  const prisma = {
    async $transaction<T>(operation: (client: typeof transaction) => Promise<T>) {
      transactionCount += 1
      return operation(transaction)
    },
  } as unknown as PrismaClient
  const services = createCounselorTaskServices(createPrismaCounselorTaskStore(prisma))

  const result = await services.create(
    { id: ids.counselor, role: 'COUNSELOR', status: 'ACTIVE' },
    ids.student,
    {
      title: 'Review genetics',
      description: null,
      scheduledFor: '2026-09-12',
      estimatedMinutes: 45,
      subjectId: ids.subject,
      topicId: ids.topic,
    },
  )

  assert.equal(transactionCount, 1)
  assert.deepEqual(profileQueries, [{
    select: { id: true },
    where: {
      id: ids.student,
      user: {
        studentRelationships: {
          some: { counselorId: ids.counselor, status: 'ACTIVE' },
        },
      },
    },
  }])
  assert.deepEqual(subjectQueries, [{
    where: { id: ids.subject, studentProfileId: ids.student },
  }])
  assert.deepEqual(topicQueries, [{
    where: { id: ids.topic, subject: { studentProfileId: ids.student } },
  }])
  assert.deepEqual(taskCreates[0]?.data, {
    completedAt: null,
    createdByUserId: ids.counselor,
    description: null,
    estimatedMinutes: 45,
    scheduledFor: new Date('2026-09-12T00:00:00.000Z'),
    source: 'COUNSELOR',
    status: 'PENDING',
    studentProfileId: ids.student,
    studyPlanId: null,
    subjectId: ids.subject,
    title: 'Review genetics',
    topicId: ids.topic,
  })
  assert.equal(result.source, 'COUNSELOR')
  assert.equal(result.studentProfileId, ids.student)
  assert.equal('createdByUserId' in result, false)
})

test('Prisma counselor rescheduling atomically rechecks assignment, ownership, source, and sessions', async () => {
  const profileQueries: unknown[] = []
  const taskFindQueries: unknown[] = []
  const taskUpdateQueries: unknown[] = []
  const task = {
    completedAt: null,
    createdAt: timestamp,
    createdByUserId: ids.counselor,
    description: null,
    estimatedMinutes: 30,
    id: ids.task,
    scheduledFor: timestamp,
    source: 'COUNSELOR' as const,
    status: 'PENDING' as const,
    studentProfileId: ids.student,
    studyPlanId: null,
    subjectId: null,
    title: 'Counselor task',
    topicId: null,
    updatedAt: timestamp,
  }
  const transaction = {
    studentProfile: {
      async findFirst(query: unknown) {
        profileQueries.push(query)
        return { id: ids.student }
      },
    },
    dailyTask: {
      async findFirst(query: unknown) {
        taskFindQueries.push(query)
        return task
      },
      async updateMany(query: unknown) {
        taskUpdateQueries.push(query)
        return { count: 1 }
      },
    },
  }
  const prisma = {
    async $transaction<T>(operation: (client: typeof transaction) => Promise<T>) {
      return operation(transaction)
    },
  } as unknown as PrismaClient
  const store = createPrismaCounselorTaskStore(prisma)
  const scheduledFor = new Date('2026-09-15T00:00:00.000Z')

  const result = await store.rescheduleAssignedStudentTask(
    ids.counselor,
    ids.student,
    ids.task,
    scheduledFor,
  )

  assert.equal(result.ok, true)
  assert.deepEqual(profileQueries, [{
    select: { id: true },
    where: {
      id: ids.student,
      user: {
        studentRelationships: {
          some: { counselorId: ids.counselor, status: 'ACTIVE' },
        },
      },
    },
  }])
  assert.deepEqual(taskFindQueries, [
    { where: { id: ids.task, studentProfileId: ids.student } },
    { where: { id: ids.task, studentProfileId: ids.student } },
  ])
  assert.deepEqual(taskUpdateQueries, [{
    data: { scheduledFor },
    where: {
      id: ids.task,
      source: 'COUNSELOR',
      studentProfileId: ids.student,
      studySessions: { none: {} },
    },
  }])
})

test('Prisma counselor task creation stops before insert when assignment is absent', async () => {
  let createCalled = false
  const transaction = {
    studentProfile: { findFirst: async () => null },
    dailyTask: {
      async create() {
        createCalled = true
        throw new Error('must not create')
      },
    },
  }
  const prisma = {
    async $transaction<T>(operation: (client: typeof transaction) => Promise<T>) {
      return operation(transaction)
    },
  } as unknown as PrismaClient
  const store = createPrismaCounselorTaskStore(prisma)
  const result = await store.createAssignedStudentTask(ids.counselor, ids.student, {
    completedAt: null,
    createdByUserId: ids.counselor,
    description: null,
    estimatedMinutes: null,
    scheduledFor: timestamp,
    source: 'COUNSELOR',
    status: 'PENDING',
    studentProfileId: ids.student,
    studyPlanId: null,
    subjectId: null,
    title: 'Blocked task',
    topicId: null,
  })

  assert.deepEqual(result, { ok: false, reason: 'STUDENT_NOT_FOUND' })
  assert.equal(createCalled, false)
})

test('Prisma counselor resource queries require active assignment and active resources', async () => {
  const profileQueries: unknown[] = []
  const subjectLists: unknown[] = []
  const subjectFinds: unknown[] = []
  const topicLists: unknown[] = []
  const transaction = {
    studentProfile: {
      async findFirst(query: unknown) {
        profileQueries.push(query)
        return { id: ids.student }
      },
    },
    studySubject: {
      async findMany(query: unknown) {
        subjectLists.push(query)
        return [{ id: ids.subject, name: 'Biology' }]
      },
      async findFirst(query: unknown) {
        subjectFinds.push(query)
        return { id: ids.subject }
      },
    },
    topic: {
      async findMany(query: unknown) {
        topicLists.push(query)
        return [{ id: ids.topic, subjectId: ids.subject, title: 'Genetics' }]
      },
    },
  }
  const prisma = {
    async $transaction<T>(operation: (client: typeof transaction) => Promise<T>) {
      return operation(transaction)
    },
  } as unknown as PrismaClient
  const store = createPrismaCounselorTaskStore(prisma)

  await store.listAssignedStudentSubjects(ids.counselor, ids.student, { limit: 25 })
  await store.listAssignedStudentTopics(ids.counselor, ids.student, ids.subject, { limit: 25 })

  assert.equal(profileQueries.length, 2)
  assert.deepEqual(subjectLists, [{
    cursor: undefined,
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
    select: { id: true, name: true },
    skip: undefined,
    take: 26,
    where: { archivedAt: null, studentProfileId: ids.student },
  }])
  assert.deepEqual(subjectFinds, [{
    select: { id: true },
    where: { archivedAt: null, id: ids.subject, studentProfileId: ids.student },
  }])
  assert.deepEqual(topicLists, [{
    cursor: undefined,
    orderBy: [{ title: 'asc' }, { id: 'asc' }],
    select: { id: true, subjectId: true, title: true },
    skip: undefined,
    take: 26,
    where: { archivedAt: null, subjectId: ids.subject },
  }])
})
