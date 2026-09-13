import { ApiError } from '../errors/api-error.js'
import type { AssessmentAttemptStore } from './store.js'
import type {
  AssessmentAttemptActor,
  AssessmentAttemptMutableInput,
  AssessmentAttemptPage,
  AssessmentAttemptPageQuery,
  AssessmentAttemptRecord,
  AssessmentAttemptView,
} from './types.js'

type CreateAssessmentAttemptInput = {
  blankCount: number
  correctCount: number
  dailyTaskId?: string | null
  endedAt: string
  incorrectCount: number
  startedAt: string
  subjectId?: string | null
  title: string
  topicId?: string | null
}

type UpdateAssessmentAttemptInput = Partial<Pick<
  CreateAssessmentAttemptInput,
  'blankCount' | 'correctCount' | 'endedAt' | 'incorrectCount' | 'startedAt'
>>

const requireProfile = async (store: AssessmentAttemptStore, actor: AssessmentAttemptActor) => {
  if (actor.role !== 'STUDENT') {
    throw new ApiError(403, 'ROLE_FORBIDDEN', 'Student access is required')
  }
  if (actor.status !== 'ACTIVE') {
    throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Account is inactive')
  }
  const profile = await store.findStudentProfileByUserId(actor.id)
  if (!profile) {
    throw new ApiError(409, 'STUDENT_PROFILE_REQUIRED', 'Student profile is required')
  }
  return profile
}

const dateTime = (value: string): Date => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, 'ATTEMPT_TIME_INVALID', 'Assessment attempt timestamps are invalid')
  }
  return parsed
}

const validateFacts = (
  startedAt: Date,
  endedAt: Date,
  correctCount: number,
  incorrectCount: number,
  blankCount: number,
): void => {
  if (endedAt <= startedAt) {
    throw new ApiError(400, 'ATTEMPT_TIME_INVALID', 'Assessment attempt must end after it starts')
  }
  const counts = [correctCount, incorrectCount, blankCount]
  if (counts.some((count) => !Number.isInteger(count) || count < 0)) {
    throw new ApiError(400, 'ATTEMPT_COUNTS_INVALID', 'Assessment attempt counts must be non-negative integers')
  }
  if (correctCount + incorrectCount + blankCount <= 0) {
    throw new ApiError(400, 'ATTEMPT_COUNTS_INVALID', 'Assessment attempt must contain at least one question')
  }
}

const toView = ({ studentProfileId: _studentProfileId, ...attempt }: AssessmentAttemptRecord): AssessmentAttemptView => ({
  ...attempt,
  durationMinutes: Math.round((attempt.endedAt.getTime() - attempt.startedAt.getTime()) / 60_000),
  questionCount: attempt.correctCount + attempt.incorrectCount + attempt.blankCount,
})

const page = (
  records: AssessmentAttemptRecord[],
  query: AssessmentAttemptPageQuery = {},
): AssessmentAttemptPage<AssessmentAttemptView> => {
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 100)
  const selected = records.slice(0, limit)
  return {
    items: selected.map(toView),
    nextCursor: records.length > limit ? selected.at(-1)?.id ?? null : null,
  }
}

const resolveProvenance = async (
  store: AssessmentAttemptStore,
  profileId: string,
  input: CreateAssessmentAttemptInput,
): Promise<{ dailyTaskId: string | null; subjectId: string | null; topicId: string | null }> => {
  const dailyTaskId = input.dailyTaskId ?? null
  const task = dailyTaskId ? await store.findTaskById(profileId, dailyTaskId) : null
  if (dailyTaskId && !task) {
    throw new ApiError(404, 'TASK_NOT_FOUND', 'Daily task not found')
  }

  if (task?.subjectId && input.subjectId && task.subjectId !== input.subjectId) {
    throw new ApiError(409, 'TASK_SUBJECT_MISMATCH', 'Task subject does not match assessment subject')
  }
  if (task?.topicId && input.topicId && task.topicId !== input.topicId) {
    throw new ApiError(409, 'TASK_TOPIC_MISMATCH', 'Task topic does not match assessment topic')
  }

  const subjectId = input.subjectId ?? task?.subjectId ?? null
  const topicId = input.topicId ?? task?.topicId ?? null

  if (subjectId) {
    const subject = await store.findSubjectById(profileId, subjectId)
    if (!subject) throw new ApiError(404, 'SUBJECT_NOT_FOUND', 'Study subject not found')
    if (subject.archivedAt) {
      throw new ApiError(409, 'SUBJECT_ARCHIVED', 'Archived subjects cannot receive new assessment attempts')
    }
  }

  if (topicId) {
    if (!subjectId) {
      throw new ApiError(400, 'TOPIC_SUBJECT_REQUIRED', 'A topic requires its subject')
    }
    const topic = await store.findTopicById(profileId, topicId)
    if (!topic) throw new ApiError(404, 'TOPIC_NOT_FOUND', 'Topic not found')
    if (topic.subjectId !== subjectId) {
      throw new ApiError(409, 'TOPIC_SUBJECT_MISMATCH', 'Topic does not belong to the selected subject')
    }
    if (topic.archivedAt) {
      throw new ApiError(409, 'TOPIC_ARCHIVED', 'Archived topics cannot receive new assessment attempts')
    }
  }

  return { dailyTaskId, subjectId, topicId }
}

export const createAssessmentAttemptServices = (
  store: AssessmentAttemptStore,
  now = () => new Date(),
) => ({
  async list(
    actor: AssessmentAttemptActor,
    query: AssessmentAttemptPageQuery = {},
  ): Promise<AssessmentAttemptPage<AssessmentAttemptView>> {
    const profile = await requireProfile(store, actor)
    return page(await store.listAttempts(profile.id, query), query)
  },

  async get(actor: AssessmentAttemptActor, id: string): Promise<AssessmentAttemptView> {
    const profile = await requireProfile(store, actor)
    const attempt = await store.findAttemptById(profile.id, id)
    if (!attempt) throw new ApiError(404, 'ATTEMPT_NOT_FOUND', 'Assessment attempt not found')
    return toView(attempt)
  },

  async create(
    actor: AssessmentAttemptActor,
    input: CreateAssessmentAttemptInput,
  ): Promise<AssessmentAttemptView> {
    const profile = await requireProfile(store, actor)
    const title = input.title.trim()
    if (!title) throw new ApiError(400, 'VALIDATION_ERROR', 'Assessment title is required')
    const startedAt = dateTime(input.startedAt)
    const endedAt = dateTime(input.endedAt)
    validateFacts(startedAt, endedAt, input.correctCount, input.incorrectCount, input.blankCount)
    const provenance = await resolveProvenance(store, profile.id, input)
    return toView(await store.createAttempt({
      ...provenance,
      blankCount: input.blankCount,
      correctCount: input.correctCount,
      endedAt,
      incorrectCount: input.incorrectCount,
      invalidatedAt: null,
      startedAt,
      studentProfileId: profile.id,
      title,
    }))
  },

  async update(
    actor: AssessmentAttemptActor,
    id: string,
    input: UpdateAssessmentAttemptInput,
  ): Promise<AssessmentAttemptView> {
    const profile = await requireProfile(store, actor)
    const current = await store.findAttemptById(profile.id, id)
    if (!current) throw new ApiError(404, 'ATTEMPT_NOT_FOUND', 'Assessment attempt not found')
    if (current.invalidatedAt) {
      throw new ApiError(409, 'ATTEMPT_INVALIDATED', 'Invalidated assessment attempts cannot be edited')
    }
    const startedAt = input.startedAt === undefined ? current.startedAt : dateTime(input.startedAt)
    const endedAt = input.endedAt === undefined ? current.endedAt : dateTime(input.endedAt)
    const correctCount = input.correctCount ?? current.correctCount
    const incorrectCount = input.incorrectCount ?? current.incorrectCount
    const blankCount = input.blankCount ?? current.blankCount
    validateFacts(startedAt, endedAt, correctCount, incorrectCount, blankCount)

    const update: AssessmentAttemptMutableInput = {
      ...(input.blankCount === undefined ? {} : { blankCount }),
      ...(input.correctCount === undefined ? {} : { correctCount }),
      ...(input.endedAt === undefined ? {} : { endedAt }),
      ...(input.incorrectCount === undefined ? {} : { incorrectCount }),
      ...(input.startedAt === undefined ? {} : { startedAt }),
    }
    const result = await store.updateAttempt(profile.id, id, update)
    if (!result.ok) {
      if (result.reason === 'ATTEMPT_INVALIDATED') {
        throw new ApiError(409, result.reason, 'Invalidated assessment attempts cannot be edited')
      }
      throw new ApiError(404, result.reason, 'Assessment attempt not found')
    }
    return toView(result.value)
  },

  async invalidate(actor: AssessmentAttemptActor, id: string): Promise<AssessmentAttemptView> {
    const profile = await requireProfile(store, actor)
    const result = await store.invalidateAttempt(profile.id, id, now())
    if (!result.ok) {
      if (result.reason === 'ATTEMPT_ALREADY_INVALIDATED') {
        throw new ApiError(409, result.reason, 'Assessment attempt is already invalidated')
      }
      throw new ApiError(404, result.reason, 'Assessment attempt not found')
    }
    return toView(result.value)
  },
})

export type AssessmentAttemptServices = ReturnType<typeof createAssessmentAttemptServices>
export type { AssessmentAttemptStore } from './store.js'
