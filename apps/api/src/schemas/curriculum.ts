import { z } from 'zod'

export const curriculumVersionIdSchema = z.object({ versionId: z.string().uuid() }).strict()
export const curriculumNodeParamsSchema = z.object({
  nodeId: z.string().uuid(),
  versionId: z.string().uuid(),
}).strict()

export const curriculumPageSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
}).strict()

export const curriculumSearchSchema = curriculumPageSchema.extend({
  q: z.string().trim().min(1).max(200),
}).strict()
