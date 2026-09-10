import { useEffect, useState, type FormEvent } from 'react'
import { AuthApiError, authClient, type StudentProfile } from '../auth/auth-client'
import { useAuth } from '../auth/useAuth'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ContentState } from '../components/ui/ContentState'
import type { Theme } from '../theme/useTheme'

const nullableText = (value: string): string | null => value.trim() || null

export function SettingsPage({ onThemeChange, theme }: { onThemeChange(theme: Theme): void; theme: Theme }) {
  const { changePassword, logout, logoutAll, user } = useAuth()
  const [profile, setProfile] = useState<StudentProfile | null>()
  const [educationLevel, setEducationLevel] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileSubmitting, setProfileSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [sessionSubmitting, setSessionSubmitting] = useState<'current' | 'all' | null>(null)

  const retryProfile = () => {
    setProfileError(null)
    void authClient.getStudentProfile().then((nextProfile) => {
      setProfile(nextProfile)
      setEducationLevel(nextProfile?.educationLevel ?? '')
      setSchoolName(nextProfile?.schoolName ?? '')
    }, () => {
      setProfileError('اطلاعات پروفایل دریافت نشد. اتصال خود را بررسی و دوباره تلاش کن.')
    })
  }

  useEffect(() => {
    let active = true
    void authClient.getStudentProfile().then((nextProfile) => {
      if (!active) return
      setProfile(nextProfile)
      setEducationLevel(nextProfile?.educationLevel ?? '')
      setSchoolName(nextProfile?.schoolName ?? '')
    }, () => {
      if (active) setProfileError('اطلاعات پروفایل دریافت نشد. اتصال خود را بررسی و دوباره تلاش کن.')
    })
    return () => { active = false }
  }, [])

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileSubmitting(true)
    setProfileError(null)
    setProfileMessage(null)
    try {
      const updated = await authClient.updateStudentProfile({
        educationLevel: nullableText(educationLevel),
        schoolName: nullableText(schoolName),
      })
      setProfile(updated)
      setEducationLevel(updated.educationLevel ?? '')
      setSchoolName(updated.schoolName ?? '')
      setProfileMessage('اطلاعات پروفایل با موفقیت ذخیره شد.')
    } catch {
      setProfileError('ذخیره اطلاعات انجام نشد. مقدارهای واردشده را بررسی کن.')
    } finally {
      setProfileSubmitting(false)
    }
  }

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const currentPassword = String(data.get('currentPassword') ?? '')
    const newPassword = String(data.get('newPassword') ?? '')
    const confirmation = String(data.get('passwordConfirmation') ?? '')
    setPasswordError(null)

    if (newPassword !== confirmation) {
      setPasswordError('تکرار رمز عبور با رمز جدید یکسان نیست.')
      return
    }

    setPasswordSubmitting(true)
    try {
      await changePassword(currentPassword, newPassword)
    } catch (error) {
      setPasswordError(
        error instanceof AuthApiError && error.code === 'CURRENT_PASSWORD_INVALID'
          ? 'رمز عبور فعلی درست نیست.'
          : 'تغییر رمز عبور انجام نشد. دوباره تلاش کن.',
      )
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const endCurrentSession = async () => {
    setSessionSubmitting('current')
    setSessionError(null)
    try {
      await logout()
    } catch {
      setSessionError('خروج از حساب انجام نشد. دوباره تلاش کن.')
    } finally {
      setSessionSubmitting(null)
    }
  }

  const endAllSessions = async () => {
    if (!window.confirm('همه نشست‌ها در تمام دستگاه‌ها بسته شوند؟ برای ادامه باید دوباره وارد شوی.')) return
    setSessionSubmitting('all')
    setSessionError(null)
    try {
      await logoutAll()
    } catch {
      setSessionError('بستن همه نشست‌ها انجام نشد. دوباره تلاش کن.')
      setSessionSubmitting(null)
    }
  }

  if (!user) return null

  return (
    <div className="settings-stack">
      <Card title="حساب دانش‌آموز">
        <dl className="account-summary">
          <div><dt>شناسه ورود</dt><dd dir="ltr">{user.email ?? user.phone ?? 'ثبت نشده'}</dd></div>
          <div><dt>نقش حساب</dt><dd>دانش‌آموز</dd></div>
          <div><dt>وضعیت</dt><dd>{user.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}</dd></div>
        </dl>
        {profile === undefined && !profileError ? (
          <ContentState kind="loading" title="در حال دریافت پروفایل" description="اطلاعات حساب دانش‌آموزی در حال بارگذاری است." />
        ) : profileError && profile === undefined ? (
          <ContentState kind="error" title="دریافت پروفایل ناموفق بود" description={profileError} action={<Button onClick={retryProfile}>تلاش دوباره</Button>} />
        ) : (
          <form className="settings-form" onSubmit={saveProfile}>
            <label htmlFor="student-education-level">پایه یا مقطع تحصیلی<input id="student-education-level" maxLength={100} value={educationLevel} onChange={(event) => setEducationLevel(event.target.value)} /></label>
            <label htmlFor="student-school-name">نام مدرسه<input id="student-school-name" maxLength={200} value={schoolName} onChange={(event) => setSchoolName(event.target.value)} /></label>
            {profileError && <p className="form-error" role="alert">{profileError}</p>}
            {profileMessage && <p className="form-success" role="status">{profileMessage}</p>}
            <Button type="submit" disabled={profileSubmitting}>{profileSubmitting ? 'در حال ذخیره…' : 'ذخیره اطلاعات حساب'}</Button>
          </form>
        )}
      </Card>

      <Card title="نمایش">
        <p className="helper-text">حالت نمایش فقط برای همین مرورگر ذخیره می‌شود و به نشست ورود وابسته نیست.</p>
        <div className="theme-options" role="group" aria-label="انتخاب حالت نمایش">
          <Button variant={theme === 'light' ? 'primary' : 'secondary'} onClick={() => onThemeChange('light')}>حالت روشن</Button>
          <Button variant={theme === 'dark' ? 'primary' : 'secondary'} onClick={() => onThemeChange('dark')}>حالت تاریک</Button>
        </div>
      </Card>

      <Card title="تغییر رمز عبور">
        <p className="helper-text">رمز جدید باید دست‌کم ۱۲ نویسه باشد. پس از تغییر، همه نشست‌ها بسته می‌شوند.</p>
        <form className="settings-form" onSubmit={submitPassword}>
          <label htmlFor="student-current-password">رمز عبور فعلی<input id="student-current-password" name="currentPassword" type="password" autoComplete="current-password" required /></label>
          <label htmlFor="student-new-password">رمز عبور جدید<input id="student-new-password" name="newPassword" type="password" autoComplete="new-password" minLength={12} required /></label>
          <label htmlFor="student-password-confirmation">تکرار رمز عبور جدید<input id="student-password-confirmation" name="passwordConfirmation" type="password" autoComplete="new-password" minLength={12} required /></label>
          {passwordError && <p className="form-error" role="alert">{passwordError}</p>}
          <Button type="submit" disabled={passwordSubmitting}>{passwordSubmitting ? 'در حال تغییر…' : 'تغییر رمز عبور'}</Button>
        </form>
      </Card>

      <Card title="نشست‌های ورود" className="security-card">
        <p className="helper-text">می‌توانی از همین دستگاه خارج شوی یا همه refresh sessionهای حسابت را در تمام دستگاه‌ها ببندی.</p>
        {sessionError && <p className="form-error" role="alert">{sessionError}</p>}
        <div className="security-actions">
          <Button variant="secondary" disabled={sessionSubmitting !== null} onClick={() => void endCurrentSession()}>{sessionSubmitting === 'current' ? 'در حال خروج…' : 'خروج از این نشست'}</Button>
          <Button variant="danger" disabled={sessionSubmitting !== null} onClick={() => void endAllSessions()}>{sessionSubmitting === 'all' ? 'در حال بستن نشست‌ها…' : 'خروج از همه دستگاه‌ها'}</Button>
        </div>
      </Card>
    </div>
  )
}
