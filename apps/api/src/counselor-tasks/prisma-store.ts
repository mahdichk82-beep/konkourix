import type { PrismaClient } from '../generated/prisma/client.js'
import type { CounselorTaskStore } from './store.js'

const assignedStudentWhere = (counselorUserId: string, studentProfileId: string) => ({
  id: studentProfileId,
  user: {
    studentRelationships: {
      some: { counselorId: counselorUserId, status: 'ACTIVE' as const },
    },
  },
})

export const createPrismaCounselorTaskStore = (
  prisma: PrismaClient,
): CounselorTaskStore => ({
  async listAssignedStudentTasks(counselorUserId, studentProfileId, query) {
    return prisma.$transaction(async (transaction) => {
      const student = await transaction.studentProfile.findFirst({
        select: { id: true },
        where: assignedStudentWhere(counselorUserId, studentProfileId),
      })
      if (!student) return { ok: false, reason: 'STUDENT_NOT_FOUND' as const }

      const tasks = await transaction.dailyTask.findMany({
        cursor: query.cursor ? { id: query.cursor } : undefined,
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
          studentProfileId: true,
          studyPlanId: true,
          subjectId: true,
          title: true,
          topicId: true,
          updatedAt: true,
        },
        skip: query.cursor ? 1 : undefined,
        take: (query.limit ?? 50) + 1,
        where: { studentProfileId },
      })
      return { ok: true, value: tasks }
    })
  },

  async listAssignedStudentSubjects(counselorUserId, studentProfileId, query) {
    return prisma.$transaction(async (transaction) => {
      const student = await transaction.studentProfile.findFirst({
        select: { id: true },
        where: assignedStudentWhere(counselorUserId, studentProfileId),
      })
      if (!student) return { ok: false, reason: 'STUDENT_NOT_FOUND' as const }

      const subjects = await transaction.studySubject.findMany({
        cursor: query.cursor ? { id: query.cursor } : undefined,
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        select: { id: true, name: true },
        skip: query.cursor ? 1 : undefined,
        take: (query.limit ?? 50) + 1,
        where: { archivedAt: null, studentProfileId },
      })
      return { ok: true, value: subjects }
    })
  },

  async listAssignedStudentTopics(
    counselorUserId,
    studentProfileId,
    subjectId,
    query,
  ) {
    return prisma.$transaction(async (transaction) => {
      const student = await transaction.studentProfile.findFirst({
        select: { id: true },
        where: assignedStudentWhere(counselorUserId, studentProfileId),
      })
      if (!student) return { ok: false, reason: 'STUDENT_NOT_FOUND' as const }

      const subject = await transaction.studySubject.findFirst({
        select: { id: true },
        where: { archivedAt: null, id: subjectId, studentProfileId },
      })
      if (!subject) return { ok: false, reason: 'SUBJECT_NOT_FOUND' as const }

      const topics = await transaction.topic.findMany({
        cursor: query.cursor ? { id: query.cursor } : undefined,
        orderBy: [{ title: 'asc' }, { id: 'asc' }],
        select: { id: true, subjectId: true, title: true },
        skip: query.cursor ? 1 : undefined,
        take: (query.limit ?? 50) + 1,
        where: { archivedAt: null, subjectId },
      })
      return { ok: true, value: topics }
    })
  },

  async createAssignedStudentTask(counselorUserId, studentProfileId, input) {
    return prisma.$transaction(async (transaction) => {
      const student = await transaction.studentProfile.findFirst({
        select: { id: true },
        where: assignedStudentWhere(counselorUserId, studentProfileId),
      })
      if (!student) return { ok: false, reason: 'STUDENT_NOT_FOUND' as const }

      if (input.subjectId) {
        const subject = await transaction.studySubject.findFirst({
          where: { id: input.subjectId, studentProfileId },
        })
        if (!subject) return { ok: false, reason: 'SUBJECT_NOT_FOUND' as const }
        if (subject.archivedAt) {
          return { ok: false, reason: 'SUBJECT_ARCHIVED' as const }
        }
      }

      if (input.topicId) {
        if (!input.subjectId) {
          return { ok: false, reason: 'TOPIC_SUBJECT_REQUIRED' as const }
        }
        const topic = await transaction.topic.findFirst({
          where: { id: input.topicId, subject: { studentProfileId } },
        })
        if (!topic) return { ok: false, reason: 'TOPIC_NOT_FOUND' as const }
        if (topic.subjectId !== input.subjectId) {
          return { ok: false, reason: 'TOPIC_SUBJECT_MISMATCH' as const }
        }
        if (topic.archivedAt) {
          return { ok: false, reason: 'TOPIC_ARCHIVED' as const }
        }
      }

      const task = await transaction.dailyTask.create({ data: input })
      return { ok: true, value: task }
    })
  },
})
