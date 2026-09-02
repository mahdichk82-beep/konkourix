import type { FastifyPluginAsync } from 'fastify'
import {
  registerHealthRoutes,
  type HealthDatabase,
} from './health.js'

type V1RouteOptions = {
  environment: string
  prisma: HealthDatabase
}

export const registerV1Routes: FastifyPluginAsync<V1RouteOptions> = async (
  app,
  options,
) => {
  registerHealthRoutes(app, options)
}
