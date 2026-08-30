import Fastify from 'fastify'
import { env } from './config/env.js'

const app = Fastify({
  logger: true,
})

app.get('/health', async () => {
  return {
    success: true,
    data: {
      status: 'healthy',
      environment: env.NODE_ENV,
    },
  }
})

const start = async () => {
  try {
    await app.listen({
      port: env.PORT,
      host: env.HOST,
    })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()