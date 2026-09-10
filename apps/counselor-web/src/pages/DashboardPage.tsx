import type { AuthUser } from '../auth/auth-client'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ContentState } from '../components/ui/ContentState'

export function DashboardPage({ user }: { user: AuthUser }) {
  const identity = user.email ?? user.phone ?? 'مشاور'
  const summaries = [
    { label: 'دانش‌آموزان فعال', value: '—', note: 'پس از اتصال داده نمایش داده می‌شود' },
    { label: 'بررسی‌های امروز', value: '—', note: 'در milestoneهای آینده تکمیل می‌شود' },
    { label: 'موارد در انتظار', value: '—', note: 'هنوز فعالیتی وجود ندارد' },
  ]
  return (
    <div className="page-stack">
      <Card className="greeting-card"><div><p className="eyebrow">مرکز کار مشاور</p><h2>خوش آمدید، {identity}</h2><p>نمای کلی دانش‌آموزان و فعالیت‌های مشاوره پس از فعال‌شدن قابلیت‌های مربوط اینجا قرار می‌گیرد.</p></div><span className="foundation-badge">نسخه پایه داشبورد</span></Card>
      <section aria-labelledby="counselor-summary-title">
        <div className="section-heading"><div><h2 id="counselor-summary-title">خلاصه دانش‌آموزان</h2><p>کارت‌های آماده برای اتصال به اطلاعات واقعی در milestoneهای بعدی</p></div></div>
        <div className="summary-grid">{summaries.map((summary) => <Card className="summary-card" key={summary.label}><span>{summary.label}</span><strong>{summary.value}</strong><small>{summary.note}</small></Card>)}</div>
      </section>
      <div className="dashboard-grid">
        <Card title="مرور فعالیت‌ها"><ContentState kind="empty" title="فعالیتی برای نمایش نیست" description="فعالیت دانش‌آموزان و روند بررسی‌ها در milestone اختصاصی خود اضافه می‌شوند." /></Card>
        <Card title="اقدام‌های در انتظار"><div className="quick-actions"><Button disabled variant="secondary">مشاهده دانش‌آموزان</Button><Button disabled variant="secondary">بررسی برنامه‌ها</Button><Button disabled variant="secondary">مشاهده گزارش‌ها</Button></div><p className="helper-text">این کنترل‌ها فقط جایگاه قابلیت‌های آینده را مشخص می‌کنند.</p></Card>
      </div>
    </div>
  )
}
