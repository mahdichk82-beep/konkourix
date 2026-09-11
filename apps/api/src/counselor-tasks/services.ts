import { ApiError } from '../errors/api-error.js'
import type { DailyTaskRecord } from '../student-core/types.js'
import type { CounselorTaskStore } from './store.js'
import type {
  CounselorStudentSubject,
  CounselorStudentTopic,
  CounselorTaskActor,
  CounselorTaskListQuery,
  CounselorTaskPage,
  CounselorTaskPageQuery,
  CounselorTaskView,
  CounselorVisibleTaskView,
  CreateCounselorTaskInput,
  CreateCounselorTaskResult,
  RescheduleCounselorTaskResult,
} from './types.js'

const ensureCounselor = (actor: CounselorTaskActor): void => {
  if (actor.role !== 'COUNSELOR') {
    throw new ApiError(403, 'ROLE_FORBIDDEN', 'Counselor access is required')
  }
  if (actor.status !== 'ACTIVE') {
    throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Account is inactive')
  }
}

const dateOnly = (value: string): Date => new Date(`${value}T00:00:00.000Z`)
const validDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = dateOnly(value)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

const page = <T extends { id: string }>(
  items: T[],
  query: CounselorTaskPageQuery,
): CounselorTaskPage<T> => {
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 100)
  const selected = items.slice(0, limit)
  return {
    items: selected,
    nextCursor: items.length > limit ? selected.at(-1)?.id ?? null : null,
  }
}

const toTaskView = ({ createdByUserId: _createdByUserId, ...task }: DailyTaskRecord): CounselorTaskView => task

const throwCreateFailure = (
  result: Exclude<CreateCounselorTaskResult, { ok: true }>,
): never => {
  switch (result.reason) {
    case 'STUDENT_NOT_FOUND':
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found')
    case 'SUBJECT_NOT_FOUND':
      throw new ApiError(404, 'SUBJECT_NOT_FOUND', 'Study subject not found')
    case 'SUBJECT_ARCHIVED':
      throw new ApiError(409, 'SUBJECT_ARCHIVED', 'Archived subjects cannot be assigned to new tasks')
    case 'TOPIC_SUBJECT_REQUIRED':
      throw new ApiError(400, 'TOPIC_SUBJECT_REQUIRED', 'A topic requires its subject')
    case 'TOPIC_NOT_FOUND':
      throw new ApiError(404, 'TOPIC_NOT_FOUND', 'Topic not found')
    case 'TOPIC_SUBJECT_MISMATCH':
      throw new ApiError(409, 'TOPIC_SUBJECT_MISMATCH', 'Topic does not belong to the selected subject')
    case 'TOPIC_ARCHIVED':
      throw new ApiError(409, 'TOPIC_ARCHIVED', 'Archived topics cannot be assigned to tasks')
  }
}

const throwRescheduleFailure = (
  result: Exclude<RescheduleCounselorTaskResult, { ok: true }>,
): never => {
  switch (result.reason) {
    case 'STUDENT_NOT_FOUND':
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found')
    case 'TASK_NOT_FOUND':
      throw new ApiError(404, 'TASK_NOT_FOUND', 'Daily task not found')
    case 'TASK_SOURCE_FORBIDDEN':
      throw new ApiError(403, 'TASK_RESCHEDULE_FORBIDDEN', 'Personal student tasks cannot be rescheduled by counselors')
    case 'TASK_EXECUTED':
      throw new ApiError(409, 'TASK_ALREADY_EXECUTED', 'Tasks with recorded study sessions cannot be rescheduled')
  }
}

export const createCounselorTaskServices = (store: CounselorTaskStore) => ({
  async list(
    actor: CounselorTaskActor,
    studentProfileId: string,
    query: CounselorTaskListQuery,
  ): Promise<CounselorTaskPage<CounselorVisibleTaskView>> {
    ensureCounselor(actor)
    if (query.scheduledFrom && !validDate(query.scheduledFrom)) {
      throw new ApiError(400, 'TASK_DATE_INVALID', 'Task date range is invalid')
    }
    if (query.scheduledTo && !validDate(query.scheduledTo)) {
      throw new ApiError(400, 'TASK_DATE_INVALID', 'Task date range is invalid')
    }
    if ((query.scheduledFrom === undefined) !== (query.scheduledTo === undefined)) {
      throw new ApiError(400, 'TASK_DATE_RANGE_INVALID', 'Task date range is invalid')
    }
    const scheduledFrom = query.scheduledFrom ? dateOnly(query.scheduledFrom) : undefined
    const scheduledTo = query.scheduledTo ? dateOnly(query.scheduledTo) : undefined
    if (scheduledFrom && scheduledTo && scheduledTo < scheduledFrom) {
      throw new ApiError(400, 'TASK_DATE_RANGE_INVALID', 'Task date range is invalid')
    }
    const {
      scheduledFrom: _scheduledFromInput,
      scheduledTo: _scheduledToInput,
      ...storeQuery
    } = query
    const result = await store.listAssignedStudentTasks(actor.id, studentProfileId, {
      ...storeQuery,
      ...(scheduledFrom ? { scheduledFrom } : {}),
      ...(scheduledTo ? { scheduledTo } : {}),
    })
    if (!result.ok) {
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found')
    }
    return page(result.value, query)
  },

  async listSubjects(
    actor: CounselorTaskActor,
    studentProfileId: string,
    query: CounselorTaskPageQuery,
  ): Promise<CounselorTaskPage<CounselorStudentSubject>> {
    ensureCounselor(actor)
    const result = await store.listAssignedStudentSubjects(actor.id, studentProfileId, query)
    if (!result.ok) {
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found')
    }
    return page(result.value, query)
  },

  async listTopics(
    actor: CounselorTaskActor,
    studentProfileId: string,
    subjectId: string,
    query: CounselorTaskPageQuery,
  ): Promise<CounselorTaskPage<CounselorStudentTopic>> {
    ensureCounselor(actor)
    const result = await store.listAssignedStudentTopics(
      actor.id,
      studentProfileId,
      subjectId,
      query,
    )
    if (!result.ok) {
      if (result.reason === 'STUDENT_NOT_FOUND') {
        throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found')
      }
      throw new ApiError(404, 'SUBJECT_NOT_FOUND', 'Study subject not found')
    }
    return page(result.value, query)
  },

  async create(
    actor: CounselorTaskActor,
    studentProfileId: string,
    input: CreateCounselorTaskInput,
  ): Promise<CounselorTaskView> {
    ensureCounselor(actor)
    if (!validDate(input.scheduledFor)) {
      throw new ApiError(400, 'TASK_DATE_INVALID', 'Task date is invalid')
    }
    if (input.topicId && !input.subjectId) {
      throw new ApiError(400, 'TOPIC_SUBJECT_REQUIRED', 'A topic requires its subject')
    }

    const result = await store.createAssignedStudentTask(actor.id, studentProfileId, {
      completedAt: null,
      createdByUserId: actor.id,
      description: input.description ?? null,
      estimatedMinutes: input.estimatedMinutes,
      scheduledFor: dateOnly(input.scheduledFor),
      source: 'COUNSELOR',
      status: 'PENDING',
      studentProfileId,
      studyPlanId: null,
      subjectId: input.subjectId,
      title: input.title.trim(),
      topicId: input.topicId,
    })

    if (!result.ok) return throwCreateFailure(result)
    return toTaskView(result.value)
  },

  async reschedule(
    actor: CounselorTaskActor,
    studentProfileId: string,
    taskId: string,
    input: { scheduledFor: string },
  ): Promise<CounselorTaskView> {
    ensureCounselor(actor)
    if (!validDate(input.scheduledFor)) {
      throw new ApiError(400, 'TASK_DATE_INVALID', 'Task date is invalid')
    }
    const result = await store.rescheduleAssignedStudentTask(
      actor.id,
      studentProfileId,
      taskId,
      dateOnly(input.scheduledFor),
    )
    if (!result.ok) return throwRescheduleFailure(result)
    return toTaskView(result.value)
  },
})

export type CounselorTaskServices = ReturnType<typeof createCounselorTaskServices>
export type { CounselorTaskStore } from './store.js'
