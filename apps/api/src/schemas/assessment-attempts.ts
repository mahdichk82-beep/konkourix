import { z } from 'zod'

const dateTime = z.string().datetime({ offset: true })
const count = z.number().int().min(0)

export const createAssessmentAttemptSchema = z.object({
  blankCount: count,
  correctCount: count,
  dailyTaskId: z.string().uuid().nullable().optional().default(null),
  endedAt: dateTime,
  incorrectCount: count,
  startedAt: dateTime,
  subjectId: z.string().uuid().nullable().optional().default(null),
  title: z.string().trim().min(1).max(200),
  topicId: z.string().uuid().nullable().optional().default(null),
}).strict().refine(
  (value) => value.correctCount + value.incorrectCount + value.blankCount > 0,
  { message: 'At least one question is required' },
)

export const updateAssessmentAttemptSchema = z.object({
  blankCount: count.optional(),
  correctCount: count.optional(),
  endedAt: dateTime.optional(),
  incorrectCount: count.optional(),
  startedAt: dateTime.optional(),
}).strict().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
)

export const listAssessmentAttemptsSchema = z.object({
  cursor: z.string().uuid().optional(),
  dailyTaskId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
}).strict()

export const assessmentAttemptIdSchema = z.object({ id: z.string().uuid() }).strict()
export const invalidateAssessmentAttemptSchema = z.object({}).strict()
