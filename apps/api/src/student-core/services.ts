import { ApiError } from '../errors/api-error.js'
import type { StudentCoreStore } from './store.js'
import type {
  DailyTaskRecord,
  DailyTaskStatus,
  DomainStudent,
  Page,
  PageQuery,
  StudyPlanRecord,
  StudyPlanStatus,
  StudySubjectRecord,
} from './types.js'

const requireProfile = async (store: StudentCoreStore, actor: DomainStudent) => {
  if (actor.role !== 'STUDENT') throw new ApiError(403, 'ROLE_FORBIDDEN', 'Student access is required')
  if (actor.status !== 'ACTIVE') throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Account is inactive')
  const profile = await store.findStudentProfileByUserId(actor.id)
  if (!profile) throw new ApiError(409, 'STUDENT_PROFILE_REQUIRED', 'Student profile is required')
  return profile
}

const page = <T extends { id: string }>(items: T[], query: PageQuery = {}): Page<T> => {
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 100)
  const start = query.cursor ? Math.max(items.findIndex((item) => item.id === query.cursor) + 1, 0) : 0
  const selected = items.slice(start, start + limit)
  return { items: selected, nextCursor: items.length > start + limit ? selected.at(-1)?.id ?? null : null }
}

const dateOnly = (value: string): Date => new Date(`${value}T00:00:00.000Z`)
const validDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = dateOnly(value)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}
const conflict = (error: unknown, code: string, message: string): never => {
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') throw new ApiError(409, code, message)
  throw error
}

export const createStudentCoreServices = (store: StudentCoreStore, now = () => new Date()) => {
  const subjects = {
    async list(actor: DomainStudent, query?: PageQuery): Promise<Page<StudySubjectRecord>> {
      const profile = await requireProfile(store, actor)
      return page(await store.listSubjects(profile.id, query), query)
    },
    async get(actor: DomainStudent, id: string) {
      const profile = await requireProfile(store, actor)
      const result = await store.findSubjectById(profile.id, id)
      if (!result) throw new ApiError(404, 'SUBJECT_NOT_FOUND', 'Study subject not found')
      return result
    },
    async create(actor: DomainStudent, input: { name: string }) {
      const profile = await requireProfile(store, actor)
      const name = input.name.trim()
      if (!name) throw new ApiError(400, 'VALIDATION_ERROR', 'Subject name is required')
      try {
        return await store.createSubject({ studentProfileId: profile.id, name, normalizedName: name.toLocaleLowerCase() })
      } catch (error) {
        return conflict(error, 'SUBJECT_CONFLICT', 'Study subject already exists')
      }
    },
    async update(actor: DomainStudent, id: string, input: { name?: string; archived?: boolean }) {
      const profile = await requireProfile(store, actor)
      if (!await store.findSubjectById(profile.id, id)) throw new ApiError(404, 'SUBJECT_NOT_FOUND', 'Study subject not found')
      const data = input.name === undefined ? {} : { name: input.name.trim(), normalizedName: input.name.trim().toLocaleLowerCase() }
      try {
        const result = await store.updateSubject(profile.id, id, { ...data, ...(input.archived === undefined ? {} : { archivedAt: input.archived ? now() : null }) })
        if (!result) throw new ApiError(404, 'SUBJECT_NOT_FOUND', 'Study subject not found')
        return result
      } catch (error) {
        return conflict(error, 'SUBJECT_CONFLICT', 'Study subject already exists')
      }
    },
  }

  const plans = {
    async list(actor: DomainStudent, query?: PageQuery & { status?: StudyPlanStatus }) {
      const profile = await requireProfile(store, actor)
      return page(await store.listPlans(profile.id, query), query)
    },
    async get(actor: DomainStudent, id: string) {
      const profile = await requireProfile(store, actor)
      const result = await store.findPlanById(profile.id, id)
      if (!result) throw new ApiError(404, 'PLAN_NOT_FOUND', 'Study plan not found')
      return result
    },
    async create(actor: DomainStudent, input: { title: string; description?: string | null; startsOn: string; endsOn: string | null }) {
      const profile = await requireProfile(store, actor)
      if (!validDate(input.startsOn) || (input.endsOn !== null && !validDate(input.endsOn))) throw new ApiError(400, 'PLAN_DATE_INVALID', 'Study plan dates are invalid')
      const startsOn = dateOnly(input.startsOn)
      const endsOn = input.endsOn === null ? null : dateOnly(input.endsOn)
      if (endsOn && endsOn < startsOn) throw new ApiError(400, 'PLAN_DATE_INVALID', 'Study plan end date precedes start date')
      return store.createPlan({ studentProfileId: profile.id, title: input.title.trim(), description: input.description ?? null, status: 'DRAFT', startsOn, endsOn })
    },
    async update(actor: DomainStudent, id: string, input: { title?: string; description?: string | null; status?: StudyPlanStatus; startsOn?: string; endsOn?: string | null }) {
      const profile = await requireProfile(store, actor)
      const current = await store.findPlanById(profile.id, id)
      if (!current) throw new ApiError(404, 'PLAN_NOT_FOUND', 'Study plan not found')
      if (input.startsOn !== undefined && !validDate(input.startsOn)) throw new ApiError(400, 'PLAN_DATE_INVALID', 'Study plan dates are invalid')
      if (input.endsOn !== undefined && input.endsOn !== null && !validDate(input.endsOn)) throw new ApiError(400, 'PLAN_DATE_INVALID', 'Study plan dates are invalid')
      const startsOn = input.startsOn === undefined ? current.startsOn : dateOnly(input.startsOn)
      const endsOn = input.endsOn === undefined ? current.endsOn : input.endsOn === null ? null : dateOnly(input.endsOn)
      if (endsOn && endsOn < startsOn) throw new ApiError(400, 'PLAN_DATE_INVALID', 'Study plan end date precedes start date')
      const result = await store.updatePlan(profile.id, id, {
        ...(input.title === undefined ? {} : { title: input.title.trim() }),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.status === undefined ? {} : { status: input.status }),
        ...(input.startsOn === undefined ? {} : { startsOn }),
        ...(input.endsOn === undefined ? {} : { endsOn }),
      })
      if (!result) throw new ApiError(404, 'PLAN_NOT_FOUND', 'Study plan not found')
      return result
    },
  }

  const tasks = {
    async list(actor: DomainStudent, query?: PageQuery & { scheduledFor?: string; status?: DailyTaskStatus; studyPlanId?: string; subjectId?: string }) {
      const profile = await requireProfile(store, actor)
      return page(await store.listTasks(profile.id, { ...query, scheduledFor: query?.scheduledFor ? dateOnly(query.scheduledFor) : undefined }), query)
    },
    async get(actor: DomainStudent, id: string) {
      const profile = await requireProfile(store, actor)
      const result = await store.findTaskById(profile.id, id)
      if (!result) throw new ApiError(404, 'TASK_NOT_FOUND', 'Daily task not found')
      return result
    },
    async create(actor: DomainStudent, input: { studyPlanId: string | null; subjectId: string | null; title: string; description?: string | null; scheduledFor: string; estimatedMinutes: number | null; status: DailyTaskStatus }) {
      const profile = await requireProfile(store, actor)
      if (!validDate(input.scheduledFor)) throw new ApiError(400, 'TASK_DATE_INVALID', 'Task date is invalid')
      if (input.studyPlanId && !await store.findPlanById(profile.id, input.studyPlanId)) throw new ApiError(404, 'PLAN_NOT_FOUND', 'Study plan not found')
      if (input.subjectId) {
        const subject = await store.findSubjectById(profile.id, input.subjectId)
        if (!subject) throw new ApiError(404, 'SUBJECT_NOT_FOUND', 'Study subject not found')
        if (subject.archivedAt) throw new ApiError(409, 'SUBJECT_ARCHIVED', 'Archived subjects cannot be assigned to new tasks')
      }
      return store.createTask({ ...input, description: input.description ?? null, studentProfileId: profile.id, scheduledFor: dateOnly(input.scheduledFor), completedAt: input.status === 'COMPLETED' ? now() : null })
    },
    async update(actor: DomainStudent, id: string, input: { studyPlanId?: string | null; subjectId?: string | null; title?: string; description?: string | null; scheduledFor?: string; estimatedMinutes?: number | null; status?: DailyTaskStatus }) {
      const profile = await requireProfile(store, actor)
      const current = await store.findTaskById(profile.id, id)
      if (!current) throw new ApiError(404, 'TASK_NOT_FOUND', 'Daily task not found')
      if (input.scheduledFor !== undefined && !validDate(input.scheduledFor)) throw new ApiError(400, 'TASK_DATE_INVALID', 'Task date is invalid')
      if (input.studyPlanId && !await store.findPlanById(profile.id, input.studyPlanId)) throw new ApiError(404, 'PLAN_NOT_FOUND', 'Study plan not found')
      if (input.subjectId) {
        const subject = await store.findSubjectById(profile.id, input.subjectId)
        if (!subject) throw new ApiError(404, 'SUBJECT_NOT_FOUND', 'Study subject not found')
        if (subject.archivedAt) throw new ApiError(409, 'SUBJECT_ARCHIVED', 'Archived subjects cannot be assigned to new tasks')
      }
      const result = await store.updateTask(profile.id, id, {
        ...(input.studyPlanId === undefined ? {} : { studyPlanId: input.studyPlanId }),
        ...(input.subjectId === undefined ? {} : { subjectId: input.subjectId }),
        ...(input.title === undefined ? {} : { title: input.title.trim() }),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.scheduledFor === undefined ? {} : { scheduledFor: dateOnly(input.scheduledFor) }),
        ...(input.estimatedMinutes === undefined ? {} : { estimatedMinutes: input.estimatedMinutes }),
        ...(input.status === undefined ? {} : { status: input.status }),
        ...(input.status === undefined ? {} : { completedAt: input.status === 'COMPLETED' ? now() : null }),
      })
      if (!result) throw new ApiError(404, 'TASK_NOT_FOUND', 'Daily task not found')
      return result
    },
  }

  return { subjects, plans, tasks }
}

export type StudentCoreServices = ReturnType<typeof createStudentCoreServices>
export type { StudentCoreStore } from './store.js'
