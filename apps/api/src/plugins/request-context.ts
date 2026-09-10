import { randomUUID } from 'node:crypto'
import type { IncomingMessage } from 'node:http'
import type { FastifyInstance } from 'fastify'

export type RequestContext = {
  requestId: string
  startedAt: number
}

declare module 'fastify' {
  interface FastifyRequest {
    context: RequestContext
  }
}

const requestIdPattern = /^[A-Za-z0-9._:-]{1,128}$/

export const generateRequestId = (request: IncomingMessage): string => {
  const requestId = request.headers['x-request-id']

  if (typeof requestId === 'string' && requestIdPattern.test(requestId)) {
    return requestId
  }

  return randomUUID()
}

export const registerRequestContext = (app: FastifyInstance): void => {
  app.decorateRequest('context', null as never)

  app.addHook('onRequest', async (request) => {
    request.context = {
      requestId: request.id,
      startedAt: Date.now(),
    }
  })

  app.addHook('onSend', async (request, reply) => {
    reply.header('x-request-id', request.context.requestId)
  })

  app.addHook('onResponse', async (request, reply) => {
    const userId = request.user?.id

    request.log.info(
      {
        durationMs: Date.now() - request.context.startedAt,
        method: request.method,
        requestId: request.context.requestId,
        route: request.routeOptions.url ?? 'unmatched',
        startedAt: new Date(request.context.startedAt).toISOString(),
        statusCode: reply.statusCode,
        ...(userId ? { userId } : {}),
      },
      'Request completed',
    )
  })
}
