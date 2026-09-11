import { z } from 'zod'

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
const pagination = {
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
}

export const counselorStudentTaskParamSchema = z.object({
  studentProfileId: z.string().uuid(),
}).strict()

export const counselorStudentTaskScheduleParamSchema = z.object({
  studentProfileId: z.string().uuid(),
  taskId: z.string().uuid(),
}).strict()

export const counselorStudentTopicParamSchema = z.object({
  studentProfileId: z.string().uuid(),
  subjectId: z.string().uuid(),
}).strict()

export const listCounselorTaskResourcesSchema = z.object(pagination).strict()

export const listCounselorTasksSchema = z.object({
  ...pagination,
  from: dateOnly.optional(),
  to: dateOnly.optional(),
}).strict().refine(
  (value) => (value.from === undefined) === (value.to === undefined),
  'Both range dates are required',
)

export const createCounselorTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  scheduledFor: dateOnly,
  estimatedMinutes: z.number().int().min(1).max(1440).nullable().optional().default(null),
  subjectId: z.string().uuid().nullable().optional().default(null),
  topicId: z.string().uuid().nullable().optional().default(null),
}).strict()

export const rescheduleCounselorTaskSchema = z.object({ scheduledFor: dateOnly }).strict()
