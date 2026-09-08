import { ApiError } from '../errors/api-error.js'
import type { StudyTrackingStore } from './store.js'
import type {
  GoalListQuery,
  SessionListQuery,
  StudentGoalRecord,
  StudySessionRecord,
  StudySessionView,
  StudyTrackingActor,
  TrackingPage,
  TrackingPageQuery,
} from './types.js'

const requireProfile = async (store: StudyTrackingStore, actor: StudyTrackingActor) => {
  if (actor.role !== 'STUDENT') throw new ApiError(403, 'ROLE_FORBIDDEN', 'Student access is required')
  if (actor.status !== 'ACTIVE') throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Account is inactive')
  const profile = await store.findStudentProfileByUserId(actor.id)
  if (!profile) throw new ApiError(409, 'STUDENT_PROFILE_REQUIRED', 'Student profile is required')
  return profile
}

const page = <T extends { id: string }>(items: T[], query: TrackingPageQuery = {}): TrackingPage<T> => {
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 100)
  const start = query.cursor ? Math.max(items.findIndex((item) => item.id === query.cursor) + 1, 0) : 0
  const selected = items.slice(start, start + limit)
  return { items: selected, nextCursor: items.length > start + limit ? selected.at(-1)?.id ?? null : null }
}

const parseDateTime = (value: string): Date => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) throw new ApiError(400, 'SESSION_TIME_INVALID', 'Study session timestamp is invalid')
  return parsed
}

const parseGoalDate = (value: string): Date => {
  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new ApiError(400, 'GOAL_DATE_INVALID', 'Goal target date is invalid')
  }
  return parsed
}

const toSessionView = (record: StudySessionRecord): StudySessionView => ({
  ...record,
  durationMinutes: Math.round((record.endedAt.getTime() - record.startedAt.getTime()) / 60_000),
})

const conflict = (error: unknown, code: string, message: string): never => {
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') throw new ApiError(409, code, message)
  throw error
}

export const createStudyTrackingServices = (store: StudyTrackingStore, now = () => new Date()) => {
  const sessions = {
    async list(actor: StudyTrackingActor, query?: SessionListQuery): Promise<TrackingPage<StudySessionView>> {
      const profile = await requireProfile(store, actor)
      const records = await store.listSessions(profile.id, query)
      return page(records.map(toSessionView), query)
    },
    async get(actor: StudyTrackingActor, id: string): Promise<StudySessionView> {
      const profile = await requireProfile(store, actor)
      const record = await store.findSessionById(profile.id, id)
      if (!record) throw new ApiError(404, 'SESSION_NOT_FOUND', 'Study session not found')
      return toSessionView(record)
    },
    async create(actor: StudyTrackingActor, input: { subjectId: string; dailyTaskId?: string | null; startedAt: string; endedAt: string; notes?: string | null }): Promise<StudySessionView> {
      const profile = await requireProfile(store, actor)
      const subject = await store.findSubjectById(profile.id, input.subjectId)
      if (!subject) throw new ApiError(404, 'SUBJECT_NOT_FOUND', 'Study subject not found')
      if (subject.archivedAt) throw new ApiError(409, 'SUBJECT_ARCHIVED', 'Archived subjects cannot be used for new sessions')
      const dailyTaskId = input.dailyTaskId ?? null
      if (dailyTaskId) {
        const task = await store.findTaskById(profile.id, dailyTaskId)
        if (!task) throw new ApiError(404, 'TASK_NOT_FOUND', 'Daily task not found')
        if (task.subjectId && task.subjectId !== input.subjectId) throw new ApiError(400, 'TASK_SUBJECT_MISMATCH', 'Task subject does not match session subject')
      }
      const startedAt = parseDateTime(input.startedAt)
      const endedAt = parseDateTime(input.endedAt)
      if (endedAt <= startedAt) throw new ApiError(400, 'SESSION_TIME_INVALID', 'Study session must end after it starts')
      try {
        const record = await store.createSession({ studentProfileId: profile.id, subjectId: input.subjectId, dailyTaskId, startedAt, endedAt, notes: input.notes ?? null })
        return toSessionView(record)
      } catch (error) {
        return conflict(error, 'SESSION_CONFLICT', 'Study session could not be created')
      }
    },
    async update(actor: StudyTrackingActor, id: string, input: { subjectId?: string; dailyTaskId?: string | null; startedAt?: string; endedAt?: string; notes?: string | null }): Promise<StudySessionView> {
      const profile = await requireProfile(store, actor)
      const current = await store.findSessionById(profile.id, id)
      if (!current) throw new ApiError(404, 'SESSION_NOT_FOUND', 'Study session not found')
      const subjectId = input.subjectId ?? current.subjectId
      if (subjectId) {
        const subject = await store.findSubjectById(profile.id, subjectId)
        if (!subject) throw new ApiError(404, 'SUBJECT_NOT_FOUND', 'Study subject not found')
        if (subject.archivedAt) throw new ApiError(409, 'SUBJECT_ARCHIVED', 'Archived subjects cannot be used for sessions')
      }
      const dailyTaskId = input.dailyTaskId === undefined ? current.dailyTaskId : input.dailyTaskId
      if (dailyTaskId) {
        const task = await store.findTaskById(profile.id, dailyTaskId)
        if (!task) throw new ApiError(404, 'TASK_NOT_FOUND', 'Daily task not found')
        if (task.subjectId && task.subjectId !== subjectId) throw new ApiError(400, 'TASK_SUBJECT_MISMATCH', 'Task subject does not match session subject')
      }
      const startedAt = input.startedAt === undefined ? current.startedAt : parseDateTime(input.startedAt)
      const endedAt = input.endedAt === undefined ? current.endedAt : parseDateTime(input.endedAt)
      if (endedAt <= startedAt) throw new ApiError(400, 'SESSION_TIME_INVALID', 'Study session must end after it starts')
      const record = await store.updateSession(profile.id, id, {
        ...(input.subjectId === undefined ? {} : { subjectId }),
        ...(input.dailyTaskId === undefined ? {} : { dailyTaskId }),
        ...(input.startedAt === undefined ? {} : { startedAt }),
        ...(input.endedAt === undefined ? {} : { endedAt }),
        ...(input.notes === undefined ? {} : { notes: input.notes }),
      })
      if (!record) throw new ApiError(404, 'SESSION_NOT_FOUND', 'Study session not found')
      return toSessionView(record)
    },
  }

  const goals = {
    async list(actor: StudyTrackingActor, query?: GoalListQuery): Promise<TrackingPage<StudentGoalRecord>> {
      const profile = await requireProfile(store, actor)
      return page(await store.listGoals(profile.id, query), query)
    },
    async get(actor: StudyTrackingActor, id: string): Promise<StudentGoalRecord> {
      const profile = await requireProfile(store, actor)
      const record = await store.findGoalById(profile.id, id)
      if (!record) throw new ApiError(404, 'GOAL_NOT_FOUND', 'Student goal not found')
      return record
    },
    async create(actor: StudyTrackingActor, input: { subjectId?: string | null; title: string; description?: string | null; targetDate?: string | null }): Promise<StudentGoalRecord> {
      const profile = await requireProfile(store, actor)
      const subjectId = input.subjectId ?? null
      if (subjectId) {
        const subject = await store.findSubjectById(profile.id, subjectId)
        if (!subject) throw new ApiError(404, 'SUBJECT_NOT_FOUND', 'Study subject not found')
        if (subject.archivedAt) throw new ApiError(409, 'SUBJECT_ARCHIVED', 'Archived subjects cannot be used for new goals')
      }
      const targetDate = input.targetDate ? parseGoalDate(input.targetDate) : null
      return store.createGoal({ studentProfileId: profile.id, subjectId, title: input.title.trim(), description: input.description ?? null, targetDate, status: 'ACTIVE', completedAt: null })
    },
    async update(actor: StudyTrackingActor, id: string, input: { subjectId?: string | null; title?: string; description?: string | null; targetDate?: string | null; status?: StudentGoalRecord['status'] }): Promise<StudentGoalRecord> {
      const profile = await requireProfile(store, actor)
      const current = await store.findGoalById(profile.id, id)
      if (!current) throw new ApiError(404, 'GOAL_NOT_FOUND', 'Student goal not found')
      if (input.subjectId) {
        const subject = await store.findSubjectById(profile.id, input.subjectId)
        if (!subject) throw new ApiError(404, 'SUBJECT_NOT_FOUND', 'Study subject not found')
        if (subject.archivedAt) throw new ApiError(409, 'SUBJECT_ARCHIVED', 'Archived subjects cannot be used for goals')
      }
      const targetDate = input.targetDate === undefined ? current.targetDate : input.targetDate === null ? null : parseGoalDate(input.targetDate)
      const status = input.status ?? current.status
      const record = await store.updateGoal(profile.id, id, {
        ...(input.subjectId === undefined ? {} : { subjectId: input.subjectId }),
        ...(input.title === undefined ? {} : { title: input.title.trim() }),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.targetDate === undefined ? {} : { targetDate }),
        ...(input.status === undefined ? {} : { status, completedAt: status === 'COMPLETED' ? now() : null }),
      })
      if (!record) throw new ApiError(404, 'GOAL_NOT_FOUND', 'Student goal not found')
      return record
    },
  }

  return { sessions, goals }
}

export type StudyTrackingServices = ReturnType<typeof createStudyTrackingServices>
export type { StudyTrackingStore } from './store.js'
