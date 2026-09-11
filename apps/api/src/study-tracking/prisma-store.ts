import type { PrismaClient } from '../generated/prisma/client.js'
import type { StudyTrackingStore } from './store.js'

export const createPrismaStudyTrackingStore = (prisma: PrismaClient): StudyTrackingStore => ({
  async findStudentProfileByUserId(userId) {
    return prisma.studentProfile.findUnique({ select: { id: true, userId: true }, where: { userId } })
  },

  async findSubjectById(studentProfileId, id) {
    return prisma.studySubject.findFirst({ select: { id: true, studentProfileId: true, archivedAt: true }, where: { id, studentProfileId } })
  },

  async findTaskById(studentProfileId, id) {
    return prisma.dailyTask.findFirst({ select: { id: true, studentProfileId: true, subjectId: true }, where: { id, studentProfileId } })
  },

  async listSessions(studentProfileId, query) {
    return prisma.studySession.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: { startedAt: 'desc' },
      skip: query?.cursor ? 1 : undefined,
      take: query?.limit ? query.limit + 1 : undefined,
      where: {
        dailyTaskId: query?.dailyTaskId,
        startedAt: query?.from || query?.to ? { gte: query.from, lte: query.to } : undefined,
        studentProfileId,
        subjectId: query?.subjectId,
      },
    })
  },

  async findSessionById(studentProfileId, id) {
    return prisma.studySession.findFirst({ where: { id, studentProfileId } })
  },

  async createSession(input) {
    return prisma.studySession.create({ data: input })
  },

  async updateSession(studentProfileId, id, input) {
    const result = await prisma.studySession.updateMany({ data: input, where: { id, studentProfileId } })
    if (result.count !== 1) return null
    return prisma.studySession.findFirst({ where: { id, studentProfileId } })
  },

  async listGoals(studentProfileId, query) {
    return prisma.studentGoal.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      skip: query?.cursor ? 1 : undefined,
      take: query?.limit ? query.limit + 1 : undefined,
      where: { status: query?.status, studentProfileId, subjectId: query?.subjectId },
    })
  },

  async findGoalById(studentProfileId, id) {
    return prisma.studentGoal.findFirst({ where: { id, studentProfileId } })
  },

  async createGoal(input) {
    return prisma.studentGoal.create({ data: input })
  },

  async updateGoal(studentProfileId, id, input) {
    const result = await prisma.studentGoal.updateMany({ data: input, where: { id, studentProfileId } })
    if (result.count !== 1) return null
    return prisma.studentGoal.findFirst({ where: { id, studentProfileId } })
  },
})
