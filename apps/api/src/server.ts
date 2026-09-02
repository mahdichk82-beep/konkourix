import { buildApp } from './app.js'
import { createAuthService } from './auth/auth-service.js'
import { createPrismaAuthStore } from './auth/prisma-auth-store.js'
import { env } from './config/env.js'
import { closeResources } from './lib/lifecycle.js'
import { prisma } from './lib/prisma.js'

const app = buildApp({
  auth: createAuthService({
    config: {
      accessToken: {
        audience: env.ACCESS_TOKEN_AUDIENCE,
        issuer: env.ACCESS_TOKEN_ISSUER,
        secret: env.ACCESS_TOKEN_SECRET,
        ttlSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
      },
      refreshTokenTtlSeconds: env.REFRESH_TOKEN_TTL_SECONDS,
    },
    store: createPrismaAuthStore(prisma),
  }),
  cookieSecure: env.NODE_ENV === 'production',
  environment: env.NODE_ENV,
  logger: true,
  prisma,
  refreshTokenTtlSeconds: env.REFRESH_TOKEN_TTL_SECONDS,
})

let shutdownPromise: Promise<void> | undefined

const shutdown = (signal: NodeJS.Signals): Promise<void> => {
  shutdownPromise ??= (async () => {
    app.log.info({ signal }, 'Shutting down API')

    try {
      await closeResources(app, prisma)
    } catch (error) {
      app.log.error(error, 'Failed to close API resources')
      process.exitCode = 1
    }
  })()

  return shutdownPromise
}

process.once('SIGINT', () => {
  void shutdown('SIGINT')
})

process.once('SIGTERM', () => {
  void shutdown('SIGTERM')
})

const start = async (): Promise<void> => {
  try {
    await app.listen({
      port: env.PORT,
      host: env.HOST,
    })
  } catch (error) {
    app.log.error(error, 'Failed to start API')

    try {
      await closeResources(app, prisma)
    } catch (closeError) {
      app.log.error(closeError, 'Failed to close API resources after startup failure')
    }

    process.exitCode = 1
  }
}

void start()
