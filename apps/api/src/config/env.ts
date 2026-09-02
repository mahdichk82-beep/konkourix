import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

config({
  path: fileURLToPath(new URL('../../../../.env', import.meta.url)),
})

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4000),

  HOST: z
    .string()
    .default('0.0.0.0'),

  DATABASE_URL: z.string().min(1),
})

export const parseEnv = (input: NodeJS.ProcessEnv = process.env) =>
  envSchema.parse(input)

export const env = parseEnv()
