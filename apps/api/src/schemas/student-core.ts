import { z } from 'zod'

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
const optionalText = (max: number) => z.string().trim().max(max).nullable().optional()
const pagination = {
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
}

export const listSubjectsSchema = z.object(pagination).strict()
export const createSubjectSchema = z.object({ name: z.string().trim().min(1).max(200) }).strict()
export const updateSubjectSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  archived: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export const listPlansSchema = z.object({ ...pagination, status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional() }).strict()
export const createPlanSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: optionalText(2000),
  startsOn: dateOnly,
  endsOn: dateOnly.nullable().optional().default(null),
}).strict()
export const updatePlanSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: optionalText(2000),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
  startsOn: dateOnly.optional(),
  endsOn: dateOnly.nullable().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export const listTasksSchema = z.object({
  ...pagination,
  date: dateOnly.optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'SKIPPED']).optional(),
  studyPlanId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
}).strict()
export const createTaskSchema = z.object({
  studyPlanId: z.string().uuid().nullable().optional().default(null),
  subjectId: z.string().uuid().nullable().optional().default(null),
  title: z.string().trim().min(1).max(200),
  description: optionalText(2000),
  scheduledFor: dateOnly,
  estimatedMinutes: z.number().int().min(1).max(1440).nullable().optional().default(null),
  status: z.enum(['PENDING', 'COMPLETED', 'SKIPPED']).optional().default('PENDING'),
}).strict()
export const updateTaskSchema = z.object({
  studyPlanId: z.string().uuid().nullable().optional(),
  subjectId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(200).optional(),
  description: optionalText(2000),
  scheduledFor: dateOnly.optional(),
  estimatedMinutes: z.number().int().min(1).max(1440).nullable().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'SKIPPED']).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export const uuidParamSchema = z.object({ id: z.string().uuid() }).strict()
