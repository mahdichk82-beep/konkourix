import { createContext } from 'react'
import type { AuthUser } from './auth-client'

export type AuthStatus = 'initializing' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  error: string | null
  login(identifier: string, password: string): Promise<void>
  logout(): Promise<void>
  status: AuthStatus
  user: AuthUser | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
