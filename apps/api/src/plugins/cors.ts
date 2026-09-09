import type { FastifyInstance } from 'fastify'
import { parseOrigin } from '../config/runtime.js'
import { ApiError } from '../errors/api-error.js'

const allowedMethods = 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS'
const allowedHeaders = 'Authorization, Content-Type, X-Request-Id'

export const registerCors = (
  app: FastifyInstance,
  configuredOrigins: readonly string[],
): void => {
  const allowedOrigins = new Set(configuredOrigins)

  app.addHook('onRequest', async (request, reply) => {
    const originHeader = request.headers.origin
    if (!originHeader) return

    let origin: string
    try {
      origin = parseOrigin(originHeader, 'Origin header')
    } catch {
      throw new ApiError(403, 'ORIGIN_NOT_ALLOWED', 'Browser origin is not allowed')
    }

    if (!allowedOrigins.has(origin)) {
      throw new ApiError(403, 'ORIGIN_NOT_ALLOWED', 'Browser origin is not allowed')
    }

    reply
      .header('access-control-allow-origin', origin)
      .header('access-control-allow-credentials', 'true')
      .header('access-control-expose-headers', 'X-Request-Id')
      .header('vary', 'Origin')

    if (request.method === 'OPTIONS') {
      return reply
        .header('access-control-allow-methods', allowedMethods)
        .header('access-control-allow-headers', allowedHeaders)
        .status(204)
        .send()
    }
  })
}
