import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { useAuth } from './auth/useAuth'
import './App.css'

function LoginPage({ onSuccess }: { onSuccess(): void }) {
  const { error, login, status } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') onSuccess()
  }, [onSuccess, status])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    try {
      await login(String(form.get('identifier') ?? ''), String(form.get('password') ?? ''))
      onSuccess()
    } catch {
      // The provider exposes a safe, localized error.
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-layout" dir="rtl">
      <section className="brand-panel" aria-label="کنکوریکس مشاور">
        <span className="brand-mark">ک</span>
        <p className="eyebrow">Konkourix Counselor</p>
        <h1>راهنمایی دقیق، برای مسیرهای متفاوت.</h1>
        <p>فضای حرفه‌ای و مستقل مشاور برای همراهی دانش‌آموزان.</p>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div>
            <p className="eyebrow">ورود مشاور</p>
            <h2>به پنل مشاور وارد شوید</h2>
            <p className="muted">ایمیل یا شماره موبایل و رمز عبور حساب مشاور را وارد کنید.</p>
          </div>
          <label>
            ایمیل یا شماره موبایل
            <input name="identifier" autoComplete="username" required />
          </label>
          <label>
            رمز عبور
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={submitting || status === 'initializing'}>
            {submitting ? 'در حال ورود…' : 'ورود به پنل مشاور'}
          </button>
          <p className="security-note">دسترسی مشاور در سرور بررسی می‌شود.</p>
        </form>
      </section>
    </main>
  )
}

function Dashboard({ onLogout }: { onLogout(): Promise<void> }) {
  const { user } = useAuth()
  const identity = user?.email ?? user?.phone ?? 'مشاور'

  return (
    <main className="dashboard" dir="rtl">
      <header>
        <div className="brand-inline"><span className="brand-mark small">ک</span><strong>کنکوریکس مشاور</strong></div>
        <button className="secondary" type="button" onClick={() => void onLogout()}>خروج امن</button>
      </header>
      <section className="welcome-card">
        <p className="eyebrow">پنل مشاور</p>
        <h1>خوش آمدید، {identity}</h1>
        <p>احراز هویت و مرز محافظت‌شده مشاور آماده است. ابزارهای مشاوره در milestoneهای بعدی روی همین پایه افزوده می‌شوند.</p>
        <span className="role-badge">COUNSELOR</span>
      </section>
    </main>
  )
}

function App() {
  const { logout } = useAuth()
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname)
    window.addEventListener('popstate', updatePath)
    return () => window.removeEventListener('popstate', updatePath)
  }, [])

  const navigate = useCallback((nextPath: string, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', nextPath)
    setPath(nextPath)
  }, [])

  const signOut = async () => {
    await logout()
    navigate('/login', true)
  }

  if (path === '/login') return <LoginPage onSuccess={() => navigate('/', true)} />

  return (
    <ProtectedRoute navigate={navigate}>
      <Dashboard onLogout={signOut} />
    </ProtectedRoute>
  )
}

export default App
