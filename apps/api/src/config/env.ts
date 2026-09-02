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

  ACCESS_TOKEN_SECRET: z.string().min(32),

  ACCESS_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(900),

  REFRESH_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(2_592_000),

  ACCESS_TOKEN_ISSUER: z.string().min(1).default('konkourx-api'),

  ACCESS_TOKEN_AUDIENCE: z.string().min(1).default('konkourx-client'),
})

export const parseEnv = (input: NodeJS.ProcessEnv = process.env) =>
  envSchema.parse(input)

export const env = parseEnv()
