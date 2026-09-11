import { useEffect, useState } from 'react'
import { AuthApiError } from '../auth/auth-client'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ContentState } from '../components/ui/ContentState'
import {
  studentTasksClient,
  type CounselorVisibleTask,
} from './student-tasks-client'

type StudentTaskListProps = {
  refreshKey: number
  studentId: string
}

const statusLabels: Record<CounselorVisibleTask['status'], string> = {
  COMPLETED: 'انجام‌شده',
  PENDING: 'در انتظار',
  SKIPPED: 'ردشده',
}

const sourceLabels: Record<CounselorVisibleTask['source'], string> = {
  COUNSELOR: 'تعیین‌شده توسط مشاور',
  PERSONAL: 'برنامه شخصی دانش‌آموز',
}

const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const completionFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatScheduledFor = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

const completionLabel = (task: CounselorVisibleTask) => {
  if (task.completedAt) {
    const completedAt = new Date(task.completedAt)
    if (!Number.isNaN(completedAt.getTime())) {
      return `تکمیل در ${completionFormatter.format(completedAt)}`
    }
  }
  if (task.status === 'COMPLETED') return 'انجام‌شده'
  if (task.status === 'SKIPPED') return 'بدون ثبت تکمیل'
  return 'در انتظار انجام'
}

const listError = (error: unknown) => {
  if (error instanceof AuthApiError && error.status === 404) {
    return 'تخصیص فعال این دانش‌آموز پیدا نشد یا دسترسی شما تغییر کرده است.'
  }
  return 'دریافت وظایف دانش‌آموز ممکن نشد. دوباره تلاش کنید.'
}

export function StudentTaskList({ refreshKey, studentId }: StudentTaskListProps) {
  const [tasks, setTasks] = useState<CounselorVisibleTask[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true
    studentTasksClient.listTasks(studentId).then((page) => {
      if (!active) return
      setTasks(page.items)
      setNextCursor(page.nextCursor)
      setError(null)
    }).catch((loadError: unknown) => {
      if (!active) return
      setTasks([])
      setNextCursor(null)
      setError(listError(loadError))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [refreshKey, retryKey, studentId])

  const retry = () => {
    setLoading(true)
    setError(null)
    setRetryKey((value) => value + 1)
  }

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    setError(null)
    try {
      const page = await studentTasksClient.listTasks(studentId, nextCursor)
      setTasks((current) => {
        const knownIds = new Set(current.map(({ id }) => id))
        return [...current, ...page.items.filter(({ id }) => !knownIds.has(id))]
      })
      setNextCursor(page.nextCursor)
    } catch (loadError) {
      setError(listError(loadError))
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <Card className="student-task-list-card" title="وظایف و وضعیت اجرا">
      <p className="student-task-card__intro">
        وظایف شخصی و وظایف تعیین‌شده توسط مشاور در این بخش فقط برای مشاهده نمایش داده می‌شوند.
      </p>

      {loading ? (
        <ContentState
          description="برنامه ثبت‌شده دانش‌آموز در حال بارگذاری است."
          kind="loading"
          title="در حال دریافت وظایف"
        />
      ) : error && tasks.length === 0 ? (
        <ContentState
          action={<Button onClick={retry}>تلاش دوباره</Button>}
          description={error}
          kind="error"
          title="وظایف در دسترس نیستند"
        />
      ) : tasks.length === 0 ? (
        <ContentState
          description="هنوز وظیفه‌ای در برنامه این دانش‌آموز ثبت نشده است."
          kind="empty"
          title="فهرست وظایف خالی است"
        />
      ) : (
        <>
          <div className="counselor-task-list">
            {tasks.map((task) => (
              <article className={`counselor-task counselor-task--${task.status.toLowerCase()}`} key={task.id}>
                <div className="counselor-task__heading">
                  <h3>{task.title}</h3>
                  <span className={`counselor-task__status counselor-task__status--${task.status.toLowerCase()}`}>
                    {statusLabels[task.status]}
                  </span>
                </div>
                {task.description && <p className="counselor-task__description">{task.description}</p>}
                <div className="counselor-task__meta">
                  <span>{formatScheduledFor(task.scheduledFor)}</span>
                  <span>{sourceLabels[task.source]}</span>
                  <span>{completionLabel(task)}</span>
                  {task.estimatedMinutes !== null && (
                    <span>{task.estimatedMinutes.toLocaleString('fa-IR')} دقیقه</span>
                  )}
                </div>
              </article>
            ))}
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          {nextCursor && (
            <div className="student-task-list__actions">
              <Button disabled={loadingMore} onClick={() => void loadMore()} variant="secondary">
                {loadingMore ? 'در حال دریافت…' : 'نمایش وظایف بیشتر'}
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
