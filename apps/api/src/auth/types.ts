import type { AccessTokenConfig, AuthRole } from './access-token.js'

export type AuthStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED'

export type AuthServiceConfig = {
  accessToken: AccessTokenConfig
  refreshTokenTtlSeconds: number
}

export type AuthRequestMeta = {
  ipAddress: string | null
  userAgent: string | null
}

export type PublicUser = {
  id: string
  email: string | null
  phone: string | null
  role: AuthRole
  status: AuthStatus
  createdAt: Date
  updatedAt: Date
}

export type AuthResult = {
  accessToken: string
  expiresIn: number
  refreshToken: string
  user: PublicUser
}
