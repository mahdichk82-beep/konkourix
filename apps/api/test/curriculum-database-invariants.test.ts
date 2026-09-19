import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { prisma } from '../src/lib/prisma.js'

const enabled = process.env.RUN_CURRICULUM_DATABASE_TESTS === '1'

const frozenCounts = async () => ({
  assessmentAttempts: await prisma.assessmentAttempt.count(),
  authSessions: await prisma.authSession.count(),
  counselorProfiles: await prisma.counselorProfile.count(),
  dailyTasks: await prisma.dailyTask.count(),
  relationships: await prisma.studentCounselor.count(),
  studentGoals: await prisma.studentGoal.count(),
  studentProfiles: await prisma.studentProfile.count(),
  studyPlans: await prisma.studyPlan.count(),
  studySessions: await prisma.studySession.count(),
  studySubjects: await prisma.studySubject.count(),
  topics: await prisma.topic.count(),
  users: await prisma.user.count(),
})

test('database enforces published curriculum immutability without changing M19 rows', { skip: !enabled }, async () => {
  const before = await frozenCounts()
  await assert.rejects(prisma.$transaction(async (transaction) => {
    const admin = await transaction.user.create({
      data: { email: `${randomUUID()}@example.test`, passwordHash: 'test-only', role: 'ADMIN' },
    })
    const version = await transaction.curriculumVersion.create({
      data: { createdById: admin.id, versionLabel: `test-${randomUUID()}` },
    })
    const node = await transaction.curriculumNode.create({ data: { createdById: admin.id } })
    const nodeType = await transaction.curriculumNodeType.findUniqueOrThrow({ where: { code: 'CURRICULUM_ROOT' } })
    await transaction.curriculumNodeRevision.create({
      data: {
        curriculumNodeId: node.id, curriculumVersionId: version.id,
        displayName: 'ریشه آزمایشی', nodeTypeId: nodeType.id,
        searchName: 'ریشه آزمایشی', siblingPosition: 0,
        sourceDisplayName: 'ریشه آزمایشی',
      },
    })
    await transaction.curriculumVersion.update({
      data: { publishedAt: new Date(), publishedById: admin.id, status: 'PUBLISHED' },
      where: { id: version.id },
    })
    await transaction.curriculumNodeRevision.update({
      data: { displayName: 'بازنویسی ممنوع' },
      where: { curriculumVersionId_curriculumNodeId: { curriculumNodeId: node.id, curriculumVersionId: version.id } },
    })
  }), /published curriculum content is immutable/)
  assert.deepEqual(await frozenCounts(), before)
})

test('database enforces append-only curriculum audit history', { skip: !enabled }, async () => {
  const before = await frozenCounts()
  await assert.rejects(prisma.$transaction(async (transaction) => {
    const admin = await transaction.user.create({
      data: { email: `${randomUUID()}@example.test`, passwordHash: 'test-only', role: 'ADMIN' },
    })
    const event = await transaction.curriculumAuditLog.create({
      data: {
        action: 'TEST_EVENT', actorUserId: admin.id, outcome: 'SUCCEEDED',
        targetKind: 'TEST', targetId: randomUUID(),
      },
    })
    await transaction.curriculumAuditLog.update({
      data: { action: 'REWRITTEN_EVENT' }, where: { id: event.id },
    })
  }), /append-only/)
  assert.deepEqual(await frozenCounts(), before)
})

test('database permits one audited revocation but rejects capability grant rewriting', { skip: !enabled }, async () => {
  const before = await frozenCounts()
  await assert.rejects(prisma.$transaction(async (transaction) => {
    const operator = await transaction.user.create({
      data: { email: `${randomUUID()}@example.test`, passwordHash: 'test-only', role: 'ADMIN' },
    })
    const grantee = await transaction.user.create({
      data: { email: `${randomUUID()}@example.test`, passwordHash: 'test-only', role: 'ADMIN' },
    })
    const grant = await transaction.curriculumCapabilityGrant.create({
      data: {
        capability: 'CURRICULUM_DRAFT_READ', grantedById: operator.id,
        grantReason: 'Database invariant test', userId: grantee.id,
      },
    })
    await transaction.curriculumCapabilityGrant.update({
      data: {
        revokeReason: 'End temporary access', revokedAt: new Date(), revokedById: operator.id,
      },
      where: { id: grant.id },
    })
    await transaction.curriculumCapabilityGrant.update({
      data: { revokeReason: 'Rewritten revocation' }, where: { id: grant.id },
    })
  }), /capability grant facts are immutable/)
  assert.deepEqual(await frozenCounts(), before)
})

test.after(async () => {
  if (enabled) await prisma.$disconnect()
})
