import type { FastifyInstance } from 'fastify'

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
  app.get('/health/live', async () => ({
    success: true,
    data: {
      status: 'healthy',
    },
  }))

  app.get('/health', async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`

      return {
        success: true,
        data: {
          status: 'healthy',
          environment,
          database: 'connected',
        },
      }
    } catch (error) {
      request.log.warn({ err: error }, 'Database readiness check failed')

      return reply.status(503).send({
        success: false,
        data: {
          status: 'unhealthy',
          database: 'disconnected',
        },
      })
    }
  })
}
