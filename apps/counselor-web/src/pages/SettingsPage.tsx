import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ContentState } from '../components/ui/ContentState'
import type { Theme } from '../theme/useTheme'

export function SettingsPage({ onThemeChange, theme }: { onThemeChange(theme: Theme): void; theme: Theme }) {
  return (
    <div className="settings-grid">
      <Card title="نمایش"><p className="helper-text">حالت نمایش این مرورگر را انتخاب کنید.</p><div className="theme-options" role="group" aria-label="انتخاب حالت نمایش"><Button variant={theme === 'light' ? 'primary' : 'secondary'} onClick={() => onThemeChange('light')}>حالت روشن</Button><Button variant={theme === 'dark' ? 'primary' : 'secondary'} onClick={() => onThemeChange('dark')}>حالت تاریک</Button></div></Card>
      <Card title="تنظیمات حساب"><ContentState kind="empty" title="تنظیمات بیشتری وجود ندارد" description="تنظیمات حساب مشاور در milestone اختصاصی خودش اضافه می‌شود." /></Card>
    </div>
  )
}
