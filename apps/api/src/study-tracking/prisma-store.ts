import type { PrismaClient } from '../generated/prisma/client.js'
import type { StudyTrackingStore } from './store.js'

const lockStudentProfileSql =
  'SELECT "id" FROM "student_profiles" WHERE "id" = $1::uuid FOR UPDATE'

const executableTaskSelect = {
  id: true,
  studentProfileId: true,
  subjectId: true,
  status: true,
  subject: { select: { archivedAt: true } },
} as const

export const createPrismaStudyTrackingStore = (prisma: PrismaClient): StudyTrackingStore => ({
  async findStudentProfileByUserId(userId) {
    return prisma.studentProfile.findUnique({ select: { id: true, userId: true }, where: { userId } })
  },

  async findSubjectById(studentProfileId, id) {
    return prisma.studySubject.findFirst({ select: { id: true, studentProfileId: true, archivedAt: true }, where: { id, studentProfileId } })
  },

  async findTaskById(studentProfileId, id) {
    return prisma.dailyTask.findFirst({ select: { id: true, studentProfileId: true, subjectId: true, status: true }, where: { id, studentProfileId } })
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

  async findActiveSession(studentProfileId) {
    return prisma.studySession.findFirst({
      orderBy: [{ startedAt: 'asc' }, { id: 'asc' }],
      where: { endedAt: null, studentProfileId },
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

  async startTaskSession(studentProfileId, taskId, startedAt) {
    return prisma.$transaction(async (transaction) => {
      await transaction.$queryRawUnsafe(lockStudentProfileSql, studentProfileId)

      const task = await transaction.dailyTask.findFirst({
        select: executableTaskSelect,
        where: { id: taskId, studentProfileId },
      })
      if (!task) return { ok: false, reason: 'TASK_NOT_FOUND' as const }
      if (task.status !== 'PENDING') {
        return { ok: false, reason: 'TASK_NOT_EXECUTABLE' as const }
      }
      if (task.subjectId && !task.subject) {
        return { ok: false, reason: 'SUBJECT_NOT_FOUND' as const }
      }
      if (task.subject?.archivedAt) {
        return { ok: false, reason: 'SUBJECT_ARCHIVED' as const }
      }

      const active = await transaction.studySession.findFirst({
        orderBy: [{ startedAt: 'asc' }, { id: 'asc' }],
        where: { endedAt: null, studentProfileId },
      })
      if (active) {
        if (active.dailyTaskId === task.id) {
          return { ok: true, value: active, reused: true }
        }
        return { ok: false, reason: 'ACTIVE_STUDY_SESSION_EXISTS' as const }
      }

      const session = await transaction.studySession.create({
        data: {
          dailyTaskId: task.id,
          endedAt: null,
          notes: null,
          startedAt,
          studentProfileId,
          subjectId: task.subjectId,
        },
      })
      return { ok: true, value: session, reused: false }
    })
  },

  async switchTaskSession(studentProfileId, taskId, transitionAt) {
    return prisma.$transaction(async (transaction) => {
      await transaction.$queryRawUnsafe(lockStudentProfileSql, studentProfileId)

      const task = await transaction.dailyTask.findFirst({
        select: executableTaskSelect,
        where: { id: taskId, studentProfileId },
      })
      if (!task) return { ok: false, reason: 'TASK_NOT_FOUND' as const }
      if (task.status !== 'PENDING') {
        return { ok: false, reason: 'TASK_NOT_EXECUTABLE' as const }
      }
      if (task.subjectId && !task.subject) {
        return { ok: false, reason: 'SUBJECT_NOT_FOUND' as const }
      }
      if (task.subject?.archivedAt) {
        return { ok: false, reason: 'SUBJECT_ARCHIVED' as const }
      }

      const active = await transaction.studySession.findFirst({
        orderBy: [{ startedAt: 'asc' }, { id: 'asc' }],
        where: { endedAt: null, studentProfileId },
      })
      if (active?.dailyTaskId === task.id) {
        return {
          ok: true,
          value: { activeSession: active, finishedSession: null },
        }
      }

      let finishedSession = null
      if (active) {
        if (transitionAt <= active.startedAt) {
          return { ok: false, reason: 'SESSION_TIME_INVALID' as const }
        }
        const finished = await transaction.studySession.updateMany({
          data: { endedAt: transitionAt },
          where: {
            endedAt: null,
            id: active.id,
            startedAt: { lt: transitionAt },
            studentProfileId,
          },
        })
        if (finished.count !== 1) {
          return { ok: false, reason: 'LIVE_SESSION_CONFLICT' as const }
        }
        finishedSession = await transaction.studySession.findFirst({
          where: { id: active.id, studentProfileId },
        })
        if (!finishedSession) {
          return { ok: false, reason: 'LIVE_SESSION_CONFLICT' as const }
        }
      }

      const nextSession = await transaction.studySession.create({
        data: {
          dailyTaskId: task.id,
          endedAt: null,
          notes: null,
          startedAt: transitionAt,
          studentProfileId,
          subjectId: task.subjectId,
        },
      })
      return {
        ok: true,
        value: { activeSession: nextSession, finishedSession },
      }
    })
  },

  async finishSession(studentProfileId, id, endedAt, notes) {
    return prisma.$transaction(async (transaction) => {
      await transaction.$queryRawUnsafe(lockStudentProfileSql, studentProfileId)
      const current = await transaction.studySession.findFirst({
        where: { id, studentProfileId },
      })
      if (!current) return { ok: false, reason: 'SESSION_NOT_FOUND' as const }
      if (current.endedAt) {
        return { ok: false, reason: 'SESSION_ALREADY_FINISHED' as const }
      }
      if (endedAt <= current.startedAt) {
        return { ok: false, reason: 'SESSION_TIME_INVALID' as const }
      }
      const updated = await transaction.studySession.updateMany({
        data: { endedAt, ...(notes === undefined ? {} : { notes }) },
        where: { endedAt: null, id, startedAt: { lt: endedAt }, studentProfileId },
      })
      if (updated.count !== 1) {
        return { ok: false, reason: 'SESSION_ALREADY_FINISHED' as const }
      }
      const session = await transaction.studySession.findFirst({
        where: { id, studentProfileId },
      })
      if (!session) return { ok: false, reason: 'SESSION_NOT_FOUND' as const }
      return { ok: true, value: session }
    })
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
