import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { errorResponse } from '../contracts/api-response.js'
import { ApiError } from './api-error.js'

const requestIdFor = (request: FastifyRequest): string =>
  request.context?.requestId ?? request.id

export const registerErrorHandling = (app: FastifyInstance): void => {
  app.setNotFoundHandler((request, reply) =>
    reply
      .status(404)
      .send(errorResponse('NOT_FOUND', 'Route not found', requestIdFor(request))),
  )

  app.setErrorHandler((error, request, reply: FastifyReply) => {
    const requestId = requestIdFor(request)

    if (error instanceof ApiError) {
      return reply
        .status(error.statusCode)
        .send(errorResponse(error.code, error.message, requestId, error.details))
    }

    const errorCode =
      typeof error === 'object' && error !== null && 'code' in error
        ? error.code
        : undefined

    if (errorCode === 'FST_ERR_VALIDATION') {
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'Request validation failed', requestId))
    }

    request.log.error({ err: error, requestId }, 'Unhandled API error')

    return reply
      .status(500)
      .send(errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', requestId))
  })
}
