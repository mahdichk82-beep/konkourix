import { useEffect, type ReactNode } from 'react'
import { useAuth } from './useAuth'

export function ProtectedRoute({
  children,
  navigate,
}: {
  children: ReactNode
  navigate(path: string, replace?: boolean): void
}) {
  const { status } = useAuth()

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', true)
  }, [navigate, status])

  if (status === 'initializing') {
    return <main className="status-page">در حال بررسی نشست امن…</main>
  }

  return status === 'authenticated' ? children : null
}
