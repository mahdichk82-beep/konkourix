import Fastify, { type FastifyInstance } from 'fastify'
import { registerHealthRoutes, type HealthDatabase } from './routes/health.js'

export type BuildAppOptions = {
  environment: string
  logger?: boolean
  prisma: HealthDatabase
}

export const buildApp = ({
  environment,
  logger = true,
  prisma,
}: BuildAppOptions): FastifyInstance => {
  const app = Fastify({ logger })

  registerHealthRoutes(app, {
    environment,
    prisma,
  })

  return app
}
