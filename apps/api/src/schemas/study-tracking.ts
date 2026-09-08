import { z } from 'zod'

const dateTime = z.string().datetime({ offset: true })
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
const pagination = {
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
}

export const createStudySessionSchema = z.object({
  subjectId: z.string().uuid(),
  dailyTaskId: z.string().uuid().nullable().optional().default(null),
  startedAt: dateTime,
  endedAt: dateTime,
  notes: z.string().trim().max(4000).nullable().optional().default(null),
}).strict()

export const updateStudySessionSchema = z.object({
  subjectId: z.string().uuid().optional(),
  dailyTaskId: z.string().uuid().nullable().optional(),
  startedAt: dateTime.optional(),
  endedAt: dateTime.optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export const listStudySessionsSchema = z.object({
  ...pagination,
  from: dateTime.optional(),
  to: dateTime.optional(),
  subjectId: z.string().uuid().optional(),
}).strict()

export const createStudentGoalSchema = z.object({
  subjectId: z.string().uuid().nullable().optional().default(null),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).nullable().optional().default(null),
  targetDate: dateOnly.nullable().optional().default(null),
}).strict()

export const updateStudentGoalSchema = z.object({
  subjectId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  targetDate: dateOnly.nullable().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export const listStudentGoalsSchema = z.object({
  ...pagination,
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  subjectId: z.string().uuid().optional(),
}).strict()

export const trackingIdParamSchema = z.object({ id: z.string().uuid() }).strict()
