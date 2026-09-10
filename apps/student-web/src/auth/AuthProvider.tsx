import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authClient, type AuthUser } from './auth-client'
import { AuthContext, type AuthStatus } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('initializing')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void authClient.restoreSession().then(
      (restoredUser) => {
        if (!active) return
        setUser(restoredUser)
        setStatus(restoredUser ? 'authenticated' : 'anonymous')
      },
      () => {
        if (!active) return
        setError('اتصال به سرویس احراز هویت برقرار نشد.')
        setStatus('anonymous')
      },
    )
    return () => { active = false }
  }, [])

  const login = useCallback(async (identifier: string, password: string) => {
    setError(null)
    try {
      const authenticatedUser = await authClient.login(identifier, password)
      setUser(authenticatedUser)
      setStatus('authenticated')
    } catch {
      setUser(null)
      setStatus('anonymous')
      setError('اطلاعات ورود معتبر نیست یا این حساب دانش‌آموزی نیست.')
      throw new Error('Login failed')
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authClient.logout()
    } finally {
      setUser(null)
      setStatus('anonymous')
      setError(null)
    }
  }, [])

  const clearAuthenticatedState = useCallback(() => {
    setUser(null)
    setStatus('anonymous')
    setError(null)
  }, [])

  const logoutAll = useCallback(async () => {
    await authClient.logoutAll()
    clearAuthenticatedState()
  }, [clearAuthenticatedState])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await authClient.changePassword(currentPassword, newPassword)
    clearAuthenticatedState()
  }, [clearAuthenticatedState])

  const value = useMemo(
    () => ({ changePassword, error, login, logout, logoutAll, status, user }),
    [changePassword, error, login, logout, logoutAll, status, user],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
