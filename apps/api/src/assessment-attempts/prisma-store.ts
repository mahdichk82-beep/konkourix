import type { PrismaClient } from '../generated/prisma/client.js'
import type { AssessmentAttemptStore } from './store.js'

const lockStudentProfileSql =
  'SELECT "id" FROM "student_profiles" WHERE "id" = $1::uuid FOR UPDATE'

export const createPrismaAssessmentAttemptStore = (
  prisma: PrismaClient,
): AssessmentAttemptStore => ({
  async findStudentProfileByUserId(userId) {
    return prisma.studentProfile.findUnique({
      select: { id: true, userId: true },
      where: { userId },
    })
  },

  async findTaskById(studentProfileId, id) {
    return prisma.dailyTask.findFirst({
      select: { id: true, studentProfileId: true, subjectId: true, topicId: true },
      where: { id, studentProfileId },
    })
  },

  async findSubjectById(studentProfileId, id) {
    return prisma.studySubject.findFirst({
      select: { archivedAt: true, id: true, studentProfileId: true },
      where: { id, studentProfileId },
    })
  },

  async findTopicById(studentProfileId, id) {
    return prisma.topic.findFirst({
      select: { archivedAt: true, id: true, subjectId: true },
      where: { id, subject: { studentProfileId } },
    })
  },

  async listAttempts(studentProfileId, query) {
    return prisma.assessmentAttempt.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: [{ endedAt: 'desc' }, { id: 'desc' }],
      skip: query?.cursor ? 1 : undefined,
      take: query?.limit ? query.limit + 1 : undefined,
      where: { dailyTaskId: query?.dailyTaskId, studentProfileId },
    })
  },

  async findAttemptById(studentProfileId, id) {
    return prisma.assessmentAttempt.findFirst({ where: { id, studentProfileId } })
  },

  async createAttempt(input) {
    return prisma.$transaction(async (transaction) => {
      await transaction.$queryRawUnsafe(lockStudentProfileSql, input.studentProfileId)
      return transaction.assessmentAttempt.create({ data: input })
    })
  },

  async updateAttempt(studentProfileId, id, input) {
    const updated = await prisma.assessmentAttempt.updateMany({
      data: input,
      where: { id, invalidatedAt: null, studentProfileId },
    })
    if (updated.count === 1) {
      const value = await prisma.assessmentAttempt.findFirst({
        where: { id, studentProfileId },
      })
      if (value) return { ok: true, value }
    }
    const current = await prisma.assessmentAttempt.findFirst({
      select: { invalidatedAt: true },
      where: { id, studentProfileId },
    })
    return current
      ? { ok: false, reason: 'ATTEMPT_INVALIDATED' }
      : { ok: false, reason: 'ATTEMPT_NOT_FOUND' }
  },

  async invalidateAttempt(studentProfileId, id, invalidatedAt) {
    return prisma.$transaction(async (transaction) => {
      await transaction.$queryRawUnsafe(lockStudentProfileSql, studentProfileId)
      const updated = await transaction.assessmentAttempt.updateMany({
        data: { invalidatedAt },
        where: { id, invalidatedAt: null, studentProfileId },
      })
      if (updated.count === 1) {
        const value = await transaction.assessmentAttempt.findFirst({
          where: { id, studentProfileId },
        })
        if (value) return { ok: true, value }
      }
      const current = await transaction.assessmentAttempt.findFirst({
        select: { invalidatedAt: true },
        where: { id, studentProfileId },
      })
      return current
        ? { ok: false, reason: 'ATTEMPT_ALREADY_INVALIDATED' }
        : { ok: false, reason: 'ATTEMPT_NOT_FOUND' }
    })
  },
})
