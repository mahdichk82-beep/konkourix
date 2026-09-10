import { useEffect, type ReactNode } from 'react'
import { useAuth } from './useAuth'
import { ContentState } from '../components/ui/ContentState'

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
    return <main className="status-page" dir="rtl"><ContentState kind="loading" title="در حال آماده‌سازی پنل" description="نشست امن شما در حال بررسی است." /></main>
  }

  return status === 'authenticated' ? children : null
}
