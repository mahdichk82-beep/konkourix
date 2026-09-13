import type { PrismaClient } from '../generated/prisma/client.js'
import { calculateStudySessionDurationMinutes } from '../study-tracking/duration.js'
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
          plannedTestCount: true,
          scheduledFor: true,
          skipReason: true,
          skippedAt: true,
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
        skip: query.cursor ? 1 : undefined,
        take: (query.limit ?? 50) + 1,
        where: {
          ...(query.scheduledFrom && query.scheduledTo
            ? { scheduledFor: { gte: query.scheduledFrom, lte: query.scheduledTo } }
            : {}),
          studentProfileId,
        },
      })
      return {
        ok: true,
        value: tasks.map(({ studySessions, ...task }) => {
          const completedSessions = studySessions.filter(
            (session) => session.endedAt !== null,
          )
          return {
            ...task,
            completedStudySessionCount: completedSessions.length,
            hasActiveStudySession: studySessions.some(
              (session) => session.endedAt === null,
            ),
            recordedMinutes: completedSessions.reduce(
              (total, session) => total + calculateStudySessionDurationMinutes(
                session.startedAt,
                session.endedAt!,
              ),
              0,
            ),
            studySessionCount: studySessions.length,
          }
        }),
      }
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

  async createAssignedStudentTasksBatch(counselorUserId, studentProfileId, inputs) {
    return prisma.$transaction(async (transaction) => {
      const counselor = await transaction.counselorProfile.findUnique({
        select: { id: true },
        where: { userId: counselorUserId },
      })
      if (!counselor) {
        return { ok: false, reason: 'COUNSELOR_PROFILE_NOT_FOUND' as const }
      }

      const student = await transaction.studentProfile.findFirst({
        select: { id: true },
        where: assignedStudentWhere(counselorUserId, studentProfileId),
      })
      if (!student) return { ok: false, reason: 'STUDENT_NOT_FOUND' as const }

      for (const input of inputs) {
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
      }

      const tasks = await transaction.dailyTask.createManyAndReturn({ data: inputs })
      return { ok: true, value: tasks }
    })
  },

  async rescheduleAssignedStudentTask(
    counselorUserId,
    studentProfileId,
    taskId,
    scheduledFor,
  ) {
    return prisma.$transaction(async (transaction) => {
      const student = await transaction.studentProfile.findFirst({
        select: { id: true },
        where: assignedStudentWhere(counselorUserId, studentProfileId),
      })
      if (!student) return { ok: false, reason: 'STUDENT_NOT_FOUND' as const }

      const current = await transaction.dailyTask.findFirst({
        where: { id: taskId, studentProfileId },
      })
      if (!current) return { ok: false, reason: 'TASK_NOT_FOUND' as const }
      if (current.source !== 'COUNSELOR') {
        return { ok: false, reason: 'TASK_SOURCE_FORBIDDEN' as const }
      }

      const updated = await transaction.dailyTask.updateMany({
        data: { scheduledFor },
        where: {
          id: taskId,
          source: 'COUNSELOR',
          studentProfileId,
          studySessions: { none: {} },
        },
      })
      if (updated.count !== 1) {
        return { ok: false, reason: 'TASK_EXECUTED' as const }
      }

      const task = await transaction.dailyTask.findFirst({
        where: { id: taskId, studentProfileId },
      })
      if (!task) return { ok: false, reason: 'TASK_NOT_FOUND' as const }
      return { ok: true, value: task }
    })
  },
})
