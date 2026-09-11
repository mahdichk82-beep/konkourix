import { useEffect, useMemo, useState } from 'react'
import { AuthApiError } from '../auth/auth-client'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ContentState } from '../components/ui/ContentState'
import {
  planningClient,
  type DailyTask,
  type DailyTaskStatus,
  type StudySubject,
  type StudyTopic,
} from '../planning/planning-client'
import { addLocalDays, buildWeek, localDateKey, saturdayWeekStart } from '../planning/week'

type WeeklyPlanningPageProps = {
  navigate(path: string): void
}

const statusLabels: Record<DailyTaskStatus, string> = {
  COMPLETED: 'انجام‌شده',
  PENDING: 'در انتظار',
  SKIPPED: 'ردشده',
}

const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  day: 'numeric',
  month: 'long',
})

const weekFormatter = new Intl.DateTimeFormat('fa-IR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const errorMessage = (error: unknown): string => {
  if (error instanceof AuthApiError && error.code === 'TASK_DATE_RANGE_INVALID') {
    return 'بازه زمانی هفته معتبر نیست.'
  }
  return 'دریافت برنامه هفتگی ممکن نشد. دوباره تلاش کنید.'
}

const loadTasks = async (from: string, to: string): Promise<DailyTask[]> => {
  const tasks: DailyTask[] = []
  const seenCursors = new Set<string>()
  let cursor: string | undefined

  do {
    const page = await planningClient.listTasks({ cursor, from, limit: 100, to })
    tasks.push(...page.items)
    cursor = page.nextCursor ?? undefined
    if (cursor && seenCursors.has(cursor)) break
    if (cursor) seenCursors.add(cursor)
  } while (cursor)

  return tasks
}

const loadSubjects = async (): Promise<StudySubject[]> => {
  const subjects: StudySubject[] = []
  let cursor: string | undefined
  do {
    const page = await planningClient.listSubjects(cursor)
    subjects.push(...page.items)
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  return subjects
}

const loadTopics = async (subjectId: string): Promise<StudyTopic[]> => {
  const topics: StudyTopic[] = []
  let cursor: string | undefined
  do {
    const page = await planningClient.listTopics(subjectId, cursor)
    topics.push(...page.items)
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  return topics
}

export function WeeklyPlanningPage({ navigate }: WeeklyPlanningPageProps) {
  const [weekStart, setWeekStart] = useState(() => saturdayWeekStart(new Date()))
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [subjects, setSubjects] = useState<StudySubject[]>([])
  const [topics, setTopics] = useState<StudyTopic[]>([])
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const days = useMemo(() => buildWeek(weekStart), [weekStart])
  const from = days[0]?.key ?? localDateKey(weekStart)
  const to = days[6]?.key ?? from
  const todayKey = localDateKey(new Date())
  const queryKey = `${from}:${to}:${retryKey}`
  const loading = loadedKey !== queryKey

  useEffect(() => {
    let active = true

    Promise.all([loadTasks(from, to), loadSubjects()]).then(async ([taskItems, subjectItems]) => {
      const subjectIds = [...new Set(
        taskItems.flatMap((task) => task.subjectId ? [task.subjectId] : []),
      )]
      const topicGroups = await Promise.all(subjectIds.map((subjectId) => loadTopics(subjectId)))
      if (!active) return
      setTasks(taskItems)
      setSubjects(subjectItems)
      setTopics(topicGroups.flat())
      setError(null)
    }).catch((loadError: unknown) => {
      if (!active) return
      setTasks([])
      setSubjects([])
      setTopics([])
      setError(errorMessage(loadError))
    }).finally(() => {
      if (active) setLoadedKey(queryKey)
    })

    return () => {
      active = false
    }
  }, [from, queryKey, to])

  const subjectNames = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject.name])),
    [subjects],
  )
  const topicNames = useMemo(
    () => new Map(topics.map((topic) => [topic.id, topic.title])),
    [topics],
  )
  const tasksByDay = useMemo(() => {
    const grouped = new Map(days.map((day) => [day.key, [] as DailyTask[]]))
    for (const task of tasks) grouped.get(task.scheduledFor.slice(0, 10))?.push(task)
    return grouped
  }, [days, tasks])
  const plannedMinutes = tasks.reduce(
    (total, task) => total + (task.estimatedMinutes ?? 0),
    0,
  )

  return (
    <div className="page-stack weekly-planning-page">
      <Card className="weekly-planning-toolbar">
        <div>
          <p className="eyebrow">نمای شنبه تا جمعه</p>
          <h2>{weekFormatter.format(days[0]!.date)} تا {weekFormatter.format(days[6]!.date)}</h2>
          <p>این نما مستقیماً از تاریخ وظایف روزانه ساخته می‌شود.</p>
        </div>
        <div className="weekly-planning-toolbar__actions">
          <Button onClick={() => setWeekStart(addLocalDays(weekStart, 7))} variant="secondary">هفته بعد</Button>
          <Button onClick={() => setWeekStart(saturdayWeekStart(new Date()))} variant="ghost">هفته جاری</Button>
          <Button onClick={() => setWeekStart(addLocalDays(weekStart, -7))} variant="secondary">هفته قبل</Button>
          <Button onClick={() => navigate('/planning')} variant="ghost">برنامه امروز</Button>
        </div>
      </Card>

      {!loading && !error && (
        <div className="weekly-workload" aria-label="خلاصه بار هفتگی">
          <span><strong>{tasks.length.toLocaleString('fa-IR')}</strong> وظیفه</span>
          <span><strong>{plannedMinutes.toLocaleString('fa-IR')}</strong> دقیقه برنامه‌ریزی‌شده</span>
        </div>
      )}

      {loading ? (
        <ContentState kind="loading" title="در حال دریافت برنامه هفتگی" description="وظایف این هفته در حال بارگذاری هستند." />
      ) : error ? (
        <ContentState
          action={<Button onClick={() => setRetryKey((value) => value + 1)}>تلاش دوباره</Button>}
          description={error}
          kind="error"
          title="برنامه هفتگی در دسترس نیست"
        />
      ) : tasks.length === 0 ? (
        <ContentState kind="empty" title="این هفته وظیفه‌ای ندارد" description="برای این بازه هفت‌روزه هنوز کاری برنامه‌ریزی نشده است." />
      ) : (
        <section className="weekly-days" aria-label="روزهای برنامه هفتگی">
          {days.map((day) => {
            const dayTasks = tasksByDay.get(day.key) ?? []
            return (
              <article className={`weekly-day${day.key === todayKey ? ' weekly-day--today' : ''}`} key={day.key}>
                <header className="weekly-day__header">
                  <div>
                    <strong>{new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(day.date)}</strong>
                    <span>{dateFormatter.format(day.date)}</span>
                  </div>
                  <small>{dayTasks.length.toLocaleString('fa-IR')} کار</small>
                </header>
                {dayTasks.length === 0 ? (
                  <p className="weekly-day__empty">کاری ثبت نشده است.</p>
                ) : (
                  <div className="weekly-day__tasks">
                    {dayTasks.map((task) => (
                      <div className={`weekly-task weekly-task--${task.status.toLowerCase()}`} key={task.id}>
                        <div className="weekly-task__heading">
                          <h3>{task.title}</h3>
                          <span>{statusLabels[task.status]}</span>
                        </div>
                        {(task.subjectId || task.topicId) && (
                          <p>
                            {task.subjectId ? subjectNames.get(task.subjectId) ?? 'درس ثبت‌شده' : ''}
                            {task.topicId ? ` · ${topicNames.get(task.topicId) ?? 'مبحث ثبت‌شده'}` : ''}
                          </p>
                        )}
                        <div className="weekly-task__meta">
                          {task.estimatedMinutes !== null && <span>{task.estimatedMinutes.toLocaleString('fa-IR')} دقیقه</span>}
                          {task.source === 'COUNSELOR' && <span>تعیین‌شده توسط مشاور</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
