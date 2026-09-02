import type { FastifyRequest, preHandlerHookHandler } from 'fastify'
import { ApiError } from '../errors/api-error.js'
import type { AuthService } from '../auth/auth-service.js'
import type { PublicUser } from '../auth/types.js'

declare module 'fastify' {
  interface FastifyRequest {
    user?: PublicUser
  }
}

export type AuthenticatedRequest = FastifyRequest & {
  user?: PublicUser
}

const bearerTokenFrom = (request: FastifyRequest): string => {
  const authorization = request.headers.authorization

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new ApiError(401, 'TOKEN_MISSING', 'Authentication is required')
  }

  const token = authorization.slice('Bearer '.length).trim()

  if (!token) {
    throw new ApiError(401, 'TOKEN_MISSING', 'Authentication is required')
  }

  return token
}

export const authenticateRequest = (
  auth: AuthService,
): preHandlerHookHandler => async (request) => {
  request.user = await auth.authenticateAccessToken(bearerTokenFrom(request))
}
