import type { FastifyInstance } from 'fastify'
import { successResponse } from '../contracts/api-response.js'
import { ApiError } from '../errors/api-error.js'
import type { AuthService } from '../auth/auth-service.js'
import type { AuthRequestMeta } from '../auth/types.js'
import { authenticateRequest } from '../plugins/authentication.js'
import { loginSchema, registerSchema } from '../schemas/auth.js'

export const refreshCookieName = 'refresh_token'

type AuthRouteOptions = {
  auth: AuthService
  cookieSecure: boolean
  refreshTokenTtlSeconds: number
}

const requestMeta = (request: {
  headers: { 'user-agent'?: string | string[] | undefined }
  ip: string
}): AuthRequestMeta => ({
  ipAddress: request.ip,
  userAgent:
    typeof request.headers['user-agent'] === 'string'
      ? request.headers['user-agent']
      : null,
})

const setRefreshCookie = (
  reply: { setCookie: (name: string, value: string, options: object) => unknown },
  token: string,
  options: AuthRouteOptions,
) => {
  reply.setCookie(refreshCookieName, token, {
    httpOnly: true,
    maxAge: options.refreshTokenTtlSeconds,
    path: '/',
    sameSite: 'lax',
    secure: options.cookieSecure,
  })
}

const parseBody = <T>(result: { success: boolean; data?: T }): T => {
  if (!result.success || !result.data) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed')
  }

  return result.data
}

export const registerAuthRoutes = (
  app: FastifyInstance,
  options: AuthRouteOptions,
): void => {
  app.post('/auth/register', async (request, reply) => {
    const input = parseBody(registerSchema.safeParse(request.body))
    const result = await options.auth.register(
      {
        email: input.email ?? null,
        password: input.password,
        phone: input.phone ?? null,
      },
      requestMeta(request),
    )

    setRefreshCookie(reply, result.refreshToken, options)

    return reply.status(201).send(
      successResponse(
        {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          user: result.user,
        },
        request.context.requestId,
      ),
    )
  })

  app.post('/auth/login', async (request, reply) => {
    const input = parseBody(loginSchema.safeParse(request.body))
    const result = await options.auth.login(
      input.identifier,
      input.password,
      requestMeta(request),
    )

    setRefreshCookie(reply, result.refreshToken, options)

    return successResponse(
      {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        user: result.user,
      },
      request.context.requestId,
    )
  })

  app.post('/auth/refresh', async (request, reply) => {
    const refreshToken = request.cookies[refreshCookieName]

    if (!refreshToken) {
      throw new ApiError(401, 'SESSION_INVALID', 'Refresh session is invalid')
    }

    const result = await options.auth.refresh(refreshToken, requestMeta(request))
    setRefreshCookie(reply, result.refreshToken, options)

    return successResponse(
      {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        user: result.user,
      },
      request.context.requestId,
    )
  })

  app.post('/auth/logout', async (request, reply) => {
    await options.auth.logout(request.cookies[refreshCookieName])
    reply.clearCookie(refreshCookieName, { path: '/' })

    return successResponse(
      { loggedOut: true },
      request.context.requestId,
    )
  })

  app.get(
    '/auth/me',
    { preHandler: authenticateRequest(options.auth) },
    async (request) =>
      successResponse(request.user, request.context.requestId),
  )
}
