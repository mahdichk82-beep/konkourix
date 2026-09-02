import type { FastifyInstance } from 'fastify'

export const registerSecurityHeaders = (app: FastifyInstance): void => {
  app.addHook('onSend', async (_request, reply) => {
    reply
      .header('x-content-type-options', 'nosniff')
      .header('x-frame-options', 'DENY')
      .header('referrer-policy', 'no-referrer')
      .header('permissions-policy', 'geolocation=(), microphone=(), camera=()')
      .header('content-security-policy', "default-src 'none'; frame-ancestors 'none'")
  })
}
