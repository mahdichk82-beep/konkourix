import { randomUUID } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'

export type AuthRole = 'STUDENT' | 'COUNSELOR' | 'ADMIN'

export type AccessTokenConfig = {
  audience: string
  issuer: string
  secret: string
  ttlSeconds: number
}

export type AccessTokenInput = {
  role: AuthRole
  userId: string
}

const roles = new Set<AuthRole>(['STUDENT', 'COUNSELOR', 'ADMIN'])

const keyFor = (config: AccessTokenConfig): Uint8Array =>
  new TextEncoder().encode(config.secret)

export const signAccessToken = async (
  input: AccessTokenInput,
  config: AccessTokenConfig,
  now = new Date(),
): Promise<string> => {
  const issuedAt = Math.floor(now.getTime() / 1000)

  return new SignJWT({ role: input.role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(input.userId)
    .setJti(randomUUID())
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + config.ttlSeconds)
    .sign(keyFor(config))
}

export const verifyAccessToken = async (
  token: string,
  config: AccessTokenConfig,
  now = new Date(),
): Promise<AccessTokenInput | null> => {
  try {
    const { payload } = await jwtVerify(token, keyFor(config), {
      algorithms: ['HS256'],
      audience: config.audience,
      currentDate: now,
      issuer: config.issuer,
    })

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.role !== 'string' ||
      !roles.has(payload.role as AuthRole)
    ) {
      return null
    }

    return {
      role: payload.role as AuthRole,
      userId: payload.sub,
    }
  } catch {
    return null
  }
}
