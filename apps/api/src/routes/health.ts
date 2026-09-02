import type { FastifyInstance } from 'fastify'
import { successResponse } from '../contracts/api-response.js'
import { ApiError } from '../errors/api-error.js'

export type HealthDatabase = {
  $queryRaw: (
    query: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<unknown>
}

type HealthRouteOptions = {
  environment: string
  prisma: HealthDatabase
}

export const registerHealthRoutes = (
  app: FastifyInstance,
  { environment, prisma }: HealthRouteOptions,
) => {
  app.get('/health/live', async (request) =>
    successResponse(
      {
        status: 'healthy',
      },
      request.context.requestId,
    ),
  )

  app.get('/health', async (request) => {
    try {
      await prisma.$queryRaw`SELECT 1`

      return successResponse(
        {
          status: 'healthy',
          environment,
          database: 'connected',
        },
        request.context.requestId,
      )
    } catch {
      throw new ApiError(503, 'DATABASE_UNAVAILABLE', 'Database is unavailable')
    }
  })
}
