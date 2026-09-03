import type { PrismaClient } from '../generated/prisma/client.js'
import type { StudentCoreStore } from './store.js'
import type {
  DailyTaskStatus,
  StudyPlanStatus,
} from './types.js'

export const createPrismaStudentCoreStore = (prisma: PrismaClient): StudentCoreStore => ({
  async findStudentProfileByUserId(userId) {
    return prisma.studentProfile.findUnique({
      select: { id: true, userId: true },
      where: { userId },
    })
  },

  async listSubjects(studentProfileId, query) {
    return prisma.studySubject.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      skip: query?.cursor ? 1 : undefined,
      take: query?.limit ? query.limit + 1 : undefined,
      where: { studentProfileId },
    })
  },

  async findSubjectById(studentProfileId, id) {
    return prisma.studySubject.findFirst({ where: { id, studentProfileId } })
  },

  async createSubject(input) {
    return prisma.studySubject.create({ data: input })
  },

  async updateSubject(studentProfileId, id, input) {
    const result = await prisma.studySubject.updateMany({
      data: input,
      where: { id, studentProfileId },
    })
    if (result.count !== 1) return null
    return prisma.studySubject.findFirst({ where: { id, studentProfileId } })
  },

  async listPlans(studentProfileId, query) {
    return prisma.studyPlan.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: { startsOn: 'desc' },
      take: query?.limit ? query.limit + 1 : undefined,
      where: { studentProfileId, status: query?.status },
    })
  },

  async findPlanById(studentProfileId, id) {
    return prisma.studyPlan.findFirst({ where: { id, studentProfileId } })
  },

  async createPlan(input) {
    return prisma.studyPlan.create({ data: input })
  },

  async updatePlan(studentProfileId, id, input) {
    const result = await prisma.studyPlan.updateMany({
      data: input,
      where: { id, studentProfileId },
    })
    if (result.count !== 1) return null
    return prisma.studyPlan.findFirst({ where: { id, studentProfileId } })
  },

  async listTasks(studentProfileId, query) {
    return prisma.dailyTask.findMany({
      cursor: query?.cursor ? { id: query.cursor } : undefined,
      orderBy: [{ scheduledFor: 'desc' }, { createdAt: 'desc' }],
      take: query?.limit ? query.limit + 1 : undefined,
      where: {
        scheduledFor: query?.scheduledFor,
        status: query?.status,
        studentProfileId,
        studyPlanId: query?.studyPlanId,
        subjectId: query?.subjectId,
      },
    })
  },

  async findTaskById(studentProfileId, id) {
    return prisma.dailyTask.findFirst({ where: { id, studentProfileId } })
  },

  async createTask(input) {
    return prisma.dailyTask.create({ data: input })
  },

  async updateTask(studentProfileId, id, input) {
    const result = await prisma.dailyTask.updateMany({
      data: input,
      where: { id, studentProfileId },
    })
    if (result.count !== 1) return null
    return prisma.dailyTask.findFirst({ where: { id, studentProfileId } })
  },
})

export type { DailyTaskStatus, StudyPlanStatus }
