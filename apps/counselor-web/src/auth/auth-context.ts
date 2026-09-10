import { createContext } from 'react'
import type { AuthUser } from './auth-client'

export type AuthStatus = 'initializing' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  error: string | null
  changePassword(currentPassword: string, newPassword: string): Promise<void>
  login(identifier: string, password: string): Promise<void>
  logout(): Promise<void>
  logoutAll(): Promise<void>
  status: AuthStatus
  user: AuthUser | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
