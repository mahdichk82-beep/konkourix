import { buildApp } from './app.js'
import { env } from './config/env.js'
import { closeResources } from './lib/lifecycle.js'
import { prisma } from './lib/prisma.js'

const app = buildApp({
  environment: env.NODE_ENV,
  logger: true,
  prisma,
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
