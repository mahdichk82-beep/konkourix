import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { defineConfig, env } from 'prisma/config'

config({
  path: fileURLToPath(new URL('./.env', import.meta.url)),
})

export default defineConfig({
  schema: 'database/prisma/schema.prisma',

  migrations: {
    path: 'database/prisma/migrations',
  },

  datasource: {
    url: env('DATABASE_URL'),
  },
})