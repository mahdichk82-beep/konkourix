import type { AuthUser } from '../auth/auth-client'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ContentState } from '../components/ui/ContentState'

export function DashboardPage({ user }: { user: AuthUser }) {
  const identity = user.email ?? user.phone ?? 'دانش‌آموز'
  const summaries = [
    { label: 'برنامه امروز', value: '—', note: 'هنوز داده‌ای ثبت نشده' },
    { label: 'زمان مطالعه', value: '—', note: 'پس از شروع مطالعه نمایش داده می‌شود' },
    { label: 'پیشرفت هفتگی', value: '—', note: 'در گزارش‌های آینده تکمیل می‌شود' },
  ]

  return (
    <div className="page-stack">
      <Card className="greeting-card">
        <div><p className="eyebrow">امروز یک شروع تازه است</p><h2>سلام، {identity}</h2><p>نمای کلی روزت بعد از فعال‌شدن قابلیت‌های برنامه‌ریزی اینجا قرار می‌گیرد.</p></div>
        <span className="foundation-badge">نسخه پایه داشبورد</span>
      </Card>

      <section aria-labelledby="student-summary-title">
        <div className="section-heading"><div><h2 id="student-summary-title">خلاصه وضعیت</h2><p>کارت‌های آماده برای اتصال به داده‌های واقعی در milestoneهای بعدی</p></div></div>
        <div className="summary-grid">
          {summaries.map((summary) => (
            <Card className="summary-card" key={summary.label}>
              <span>{summary.label}</span><strong>{summary.value}</strong><small>{summary.note}</small>
            </Card>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        <Card title="نمای امروز">
          <ContentState kind="empty" title="امروز هنوز خالی است" description="برنامه و فعالیت‌های امروز در milestone مربوط به برنامه‌ریزی اضافه می‌شوند." />
        </Card>
        <Card title="دسترسی سریع">
          <div className="quick-actions">
            <Button disabled variant="secondary">افزودن برنامه</Button>
            <Button disabled variant="secondary">شروع مطالعه</Button>
            <Button disabled variant="secondary">مشاهده گزارش</Button>
          </div>
          <p className="helper-text">این کنترل‌ها فقط جایگاه قابلیت‌های آینده را مشخص می‌کنند.</p>
        </Card>
      </div>
    </div>
  )
}
