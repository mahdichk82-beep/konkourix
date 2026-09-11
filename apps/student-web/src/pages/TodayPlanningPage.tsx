import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

type StatusFilter = DailyTaskStatus | 'ALL'

const statusLabels: Record<DailyTaskStatus, string> = {
  COMPLETED: 'انجام‌شده',
  PENDING: 'در انتظار',
  SKIPPED: 'ردشده',
}

const localDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const planningErrorMessage = (error: unknown): string => {
  if (!(error instanceof AuthApiError)) {
    return 'خطای پیش‌بینی‌نشده‌ای رخ داد. دوباره تلاش کنید.'
  }

  const messages: Record<string, string> = {
    SUBJECT_ARCHIVED: 'این درس بایگانی شده و برای کار جدید قابل استفاده نیست.',
    SUBJECT_CONFLICT: 'درسی با این نام از قبل وجود دارد.',
    SUBJECT_NOT_FOUND: 'درس انتخاب‌شده دیگر در دسترس نیست.',
    TASK_NOT_FOUND: 'این کار دیگر در دسترس نیست. فهرست را تازه‌سازی کنید.',
    TOPIC_ARCHIVED: 'این مبحث بایگانی شده و برای کار جدید قابل استفاده نیست.',
    TOPIC_NOT_FOUND: 'مبحث انتخاب‌شده دیگر در دسترس نیست.',
    TOPIC_SUBJECT_MISMATCH: 'مبحث انتخاب‌شده به این درس تعلق ندارد.',
    TOPIC_SUBJECT_REQUIRED: 'برای انتخاب مبحث، ابتدا درس آن را انتخاب کنید.',
    VALIDATION_ERROR: 'اطلاعات واردشده معتبر نیست. فیلدها را بررسی کنید.',
  }

  return messages[error.code] ?? 'ارتباط با سرور انجام نشد. لطفاً دوباره تلاش کنید.'
}

const mergeTasks = (items: DailyTask[]): DailyTask[] => {
  const unique = new Map<string, DailyTask>()
  for (const item of items) unique.set(item.id, item)
  return [...unique.values()]
}

const mergeSubjects = (items: StudySubject[]): StudySubject[] => {
  const unique = new Map<string, StudySubject>()
  for (const item of items) unique.set(item.id, item)
  return [...unique.values()]
}

const loadSubjects = async (): Promise<StudySubject[]> => {
  const subjects: StudySubject[] = []
  const seenCursors = new Set<string>()
  let cursor: string | undefined

  do {
    const page = await planningClient.listSubjects(cursor)
    subjects.push(...page.items)
    cursor = page.nextCursor ?? undefined
    if (cursor && seenCursors.has(cursor)) break
    if (cursor) seenCursors.add(cursor)
  } while (cursor)

  return mergeSubjects(subjects)
}

const loadTopics = async (subjectId: string): Promise<StudyTopic[]> => {
  const topics: StudyTopic[] = []
  const seenCursors = new Set<string>()
  let cursor: string | undefined

  do {
    const page = await planningClient.listTopics(subjectId, cursor)
    topics.push(...page.items)
    cursor = page.nextCursor ?? undefined
    if (cursor && seenCursors.has(cursor)) break
    if (cursor) seenCursors.add(cursor)
  } while (cursor)

  return topics.filter((topic) => topic.archivedAt === null)
}

export function TodayPlanningPage() {
  const today = new Date()
  const todayKey = localDateKey(today)
  const todayLabel = new Intl.DateTimeFormat('fa-IR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  }).format(today)
  const numberFormatter = useMemo(() => new Intl.NumberFormat('fa-IR'), [])

  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [subjects, setSubjects] = useState<StudySubject[]>([])
  const [topics, setTopics] = useState<StudyTopic[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [subjectFilter, setSubjectFilter] = useState('ALL')
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [subjectError, setSubjectError] = useState<string | null>(null)
  const [topicError, setTopicError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set())

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [taskSubjectId, setTaskSubjectId] = useState('')
  const [taskTopicId, setTaskTopicId] = useState('')
  const [isTopicsLoading, setIsTopicsLoading] = useState(false)
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const [isSubjectCreateOpen, setIsSubjectCreateOpen] = useState(false)
  const [subjectName, setSubjectName] = useState('')
  const [isSubmittingSubject, setIsSubmittingSubject] = useState(false)
  const [subjectFormError, setSubjectFormError] = useState<string | null>(null)

  const currentQueryKey = `${todayKey}:${statusFilter}:${subjectFilter}`
  const currentQueryKeyRef = useRef(currentQueryKey)

  useEffect(() => {
    currentQueryKeyRef.current = currentQueryKey
  }, [currentQueryKey])

  const refreshSubjects = useCallback(async () => {
    setSubjectError(null)
    try {
      setSubjects(await loadSubjects())
    } catch (error) {
      setSubjectError(planningErrorMessage(error))
    }
  }, [])

  useEffect(() => {
    if (!taskSubjectId) return

    let active = true
    const fetchTopics = async () => {
      await Promise.resolve()
      if (!active) return
      setIsTopicsLoading(true)
      setTopicError(null)
      setTopics([])
      try {
        const items = await loadTopics(taskSubjectId)
        if (active) setTopics(items)
      } catch (error) {
        if (active) setTopicError(planningErrorMessage(error))
      } finally {
        if (active) setIsTopicsLoading(false)
      }
    }

    void fetchTopics()
    return () => {
      active = false
    }
  }, [taskSubjectId])

  useEffect(() => {
    let active = true
    void loadSubjects().then((items) => {
      if (active) setSubjects(items)
    }).catch((error: unknown) => {
      if (active) setSubjectError(planningErrorMessage(error))
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const fetchTasks = async () => {
      await Promise.resolve()
      if (!active) return
      setIsInitialLoading(true)
      setIsLoadingMore(false)
      setListError(null)
      setTasks([])
      setNextCursor(null)

      try {
        const page = await planningClient.listTasks({
          date: todayKey,
          limit: 20,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          subjectId: subjectFilter === 'ALL' ? undefined : subjectFilter,
        })
        if (!active) return
        setTasks(mergeTasks(page.items))
        setNextCursor(page.nextCursor)
      } catch (error) {
        if (active) setListError(planningErrorMessage(error))
      } finally {
        if (active) setIsInitialLoading(false)
      }
    }

    void fetchTasks()

    return () => {
      active = false
    }
  }, [refreshKey, statusFilter, subjectFilter, todayKey])

  const activeSubjects = subjects.filter((subject) => subject.archivedAt === null)
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]))
  const summary = tasks.reduce(
    (counts, task) => ({ ...counts, [task.status]: counts[task.status] + 1 }),
    { COMPLETED: 0, PENDING: 0, SKIPPED: 0 },
  )

  const taskMatchesFilters = (task: DailyTask): boolean =>
    (statusFilter === 'ALL' || task.status === statusFilter) &&
    (subjectFilter === 'ALL' || task.subjectId === subjectFilter)

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return
    const queryKey = currentQueryKey
    setIsLoadingMore(true)
    setListError(null)

    try {
      const page = await planningClient.listTasks({
        cursor: nextCursor,
        date: todayKey,
        limit: 20,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        subjectId: subjectFilter === 'ALL' ? undefined : subjectFilter,
      })
      if (currentQueryKeyRef.current !== queryKey) return
      setTasks((current) => mergeTasks([...current, ...page.items]))
      setNextCursor(page.nextCursor)
    } catch (error) {
      if (currentQueryKeyRef.current === queryKey) {
        setListError(planningErrorMessage(error))
      }
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleStatusUpdate = async (task: DailyTask, status: DailyTaskStatus) => {
    setActionError(null)
    setUpdatingTaskIds((current) => new Set(current).add(task.id))

    try {
      const updated = await planningClient.updateTaskStatus(task.id, status)
      setTasks((current) => {
        if (!taskMatchesFilters(updated)) {
          return current.filter((item) => item.id !== updated.id)
        }
        return current.map((item) => item.id === updated.id ? updated : item)
      })
    } catch (error) {
      setActionError(planningErrorMessage(error))
    } finally {
      setUpdatingTaskIds((current) => {
        const next = new Set(current)
        next.delete(task.id)
        return next
      })
    }
  }

  const handleTaskSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const minutes = estimatedMinutes === '' ? null : Number(estimatedMinutes)

    if (!trimmedTitle) {
      setFormError('عنوان کار را وارد کنید.')
      return
    }
    if (trimmedTitle.length > 200 || trimmedDescription.length > 2000) {
      setFormError('عنوان یا توضیحات از طول مجاز بیشتر است.')
      return
    }
    if (minutes !== null && (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440)) {
      setFormError('زمان تخمینی باید عددی صحیح بین ۱ تا ۱۴۴۰ دقیقه باشد.')
      return
    }

    setIsSubmittingTask(true)
    try {
      const created = await planningClient.createTask({
        description: trimmedDescription || null,
        estimatedMinutes: minutes,
        scheduledFor: todayKey,
        subjectId: taskSubjectId || null,
        topicId: taskTopicId || null,
        title: trimmedTitle,
      })
      if (taskMatchesFilters(created)) {
        setTasks((current) => mergeTasks([created, ...current]))
        setFormSuccess('کار تازه به برنامه امروز اضافه شد.')
      } else {
        setFormSuccess('کار ساخته شد و به‌دلیل فیلتر فعلی در فهرست دیده نمی‌شود.')
      }
      setTitle('')
      setDescription('')
      setEstimatedMinutes('')
    } catch (error) {
      setFormError(planningErrorMessage(error))
    } finally {
      setIsSubmittingTask(false)
    }
  }

  const handleSubjectSubmit = async () => {
    setSubjectFormError(null)
    const name = subjectName.trim()

    if (!name) {
      setSubjectFormError('نام درس را وارد کنید.')
      return
    }
    if (name.length > 200) {
      setSubjectFormError('نام درس از طول مجاز بیشتر است.')
      return
    }

    setIsSubmittingSubject(true)
    try {
      const created = await planningClient.createSubject(name)
      setSubjects((current) => mergeSubjects([created, ...current]))
      setTaskTopicId('')
      setTopics([])
      setTaskSubjectId(created.id)
      setSubjectName('')
      setIsSubjectCreateOpen(false)
      setFormSuccess(`درس «${created.name}» ساخته و انتخاب شد.`)
    } catch (error) {
      setSubjectFormError(planningErrorMessage(error))
    } finally {
      setIsSubmittingSubject(false)
    }
  }

  return (
    <div className="page-stack planning-page">
      <Card className="planning-hero">
        <div>
          <p className="eyebrow">برنامه روزانه من</p>
          <h2>امروز چه کاری پیش رو داری؟</h2>
          <p>{todayLabel}</p>
        </div>
        <Button onClick={() => {
          setIsCreateOpen((current) => !current)
          setFormError(null)
          setFormSuccess(null)
        }}>
          {isCreateOpen ? 'بستن فرم' : 'افزودن کار امروز'}
        </Button>
      </Card>

      {isCreateOpen && (
        <Card className="planning-create-card" title="کار شخصی تازه">
          <form className="planning-form" onSubmit={handleTaskSubmit}>
            <label htmlFor="task-title">
              عنوان کار
              <input
                autoFocus
                id="task-title"
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="مثلاً مرور فصل حرکت"
                required
                value={title}
              />
            </label>

            <div className="planning-form__row">
              <label htmlFor="task-subject">
                درس (اختیاری)
                <select
                  id="task-subject"
                  onChange={(event) => {
                    setTaskTopicId('')
                    setTopics([])
                    setTopicError(null)
                    setTaskSubjectId(event.target.value)
                  }}
                  value={taskSubjectId}
                >
                  <option value="">بدون درس</option>
                  {activeSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </label>
              <label htmlFor="task-minutes">
                زمان تخمینی (دقیقه)
                <input
                  id="task-minutes"
                  inputMode="numeric"
                  max={1440}
                  min={1}
                  onChange={(event) => setEstimatedMinutes(event.target.value)}
                  placeholder="مثلاً ۴۵"
                  type="number"
                  value={estimatedMinutes}
                />
              </label>
            </div>

            <label className="planning-topic-field" htmlFor="task-topic">
              مبحث (اختیاری)
              <select
                disabled={!taskSubjectId || isTopicsLoading || topics.length === 0}
                id="task-topic"
                onChange={(event) => setTaskTopicId(event.target.value)}
                value={taskTopicId}
              >
                <option value="">
                  {!taskSubjectId
                    ? 'ابتدا درس را انتخاب کنید'
                    : isTopicsLoading
                      ? 'در حال دریافت مباحث…'
                      : topics.length === 0
                        ? 'برای این درس مبحث فعالی ثبت نشده است'
                        : 'بدون مبحث'}
                </option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.title}</option>
                ))}
              </select>
              {!isTopicsLoading && taskSubjectId && topics.length === 0 && !topicError && (
                <span className="planning-topic-field__state">مباحث این درس را می‌توانید در بخش «درس‌ها و مباحث» مدیریت کنید.</span>
              )}
              {topicError && <span className="planning-topic-field__error" role="alert">{topicError}</span>}
            </label>

            <label htmlFor="task-description">
              توضیحات (اختیاری)
              <textarea
                id="task-description"
                maxLength={2000}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="جزئیات کوتاه این کار"
                rows={3}
                value={description}
              />
            </label>

            <div className="inline-subject">
              <Button
                onClick={() => {
                  setIsSubjectCreateOpen((current) => !current)
                  setSubjectFormError(null)
                }}
                variant="ghost"
              >
                {isSubjectCreateOpen ? 'انصراف از ساخت درس' : 'درس موردنظر در فهرست نیست؟'}
              </Button>
              {isSubjectCreateOpen && (
                <div className="inline-subject__form">
                  <label htmlFor="subject-name">
                    نام درس تازه
                    <input
                      id="subject-name"
                      maxLength={200}
                      onChange={(event) => setSubjectName(event.target.value)}
                      placeholder="نام درس"
                      value={subjectName}
                    />
                  </label>
                  <Button
                    disabled={isSubmittingSubject}
                    onClick={() => void handleSubjectSubmit()}
                    variant="secondary"
                  >
                    {isSubmittingSubject ? 'در حال ساخت…' : 'ساخت و انتخاب درس'}
                  </Button>
                </div>
              )}
              {subjectFormError && <p className="form-error" role="alert">{subjectFormError}</p>}
            </div>

            {formError && <p className="form-error" role="alert">{formError}</p>}
            {formSuccess && <p className="form-success" role="status">{formSuccess}</p>}
            <div className="planning-form__actions">
              <Button disabled={isSubmittingTask} type="submit">
                {isSubmittingTask ? 'در حال افزودن…' : 'افزودن به امروز'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <section aria-labelledby="today-summary-title">
        <div className="section-heading">
          <div>
            <h2 id="today-summary-title">خلاصه کارهای بارگذاری‌شده</h2>
            <p>{numberFormatter.format(tasks.length)} کار مطابق فیلتر فعلی</p>
          </div>
        </div>
        <div className="summary-grid planning-summary">
          {(['PENDING', 'COMPLETED', 'SKIPPED'] as DailyTaskStatus[]).map((status) => (
            <Card className={`summary-card summary-card--${status.toLowerCase()}`} key={status}>
              <span>{statusLabels[status]}</span>
              <strong>{numberFormatter.format(summary[status])}</strong>
              <small>در صفحه‌های بارگذاری‌شده</small>
            </Card>
          ))}
        </div>
      </section>

      <Card className="planning-list-card">
        <div className="planning-toolbar">
          <div>
            <h2>کارهای امروز</h2>
            <p>فهرست بر اساس روز محلی دستگاه شما دریافت می‌شود.</p>
          </div>
          <div className="planning-filters" aria-label="فیلتر کارهای امروز">
            <label htmlFor="status-filter">
              وضعیت
              <select
                id="status-filter"
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                value={statusFilter}
              >
                <option value="ALL">همه وضعیت‌ها</option>
                <option value="PENDING">در انتظار</option>
                <option value="COMPLETED">انجام‌شده</option>
                <option value="SKIPPED">ردشده</option>
              </select>
            </label>
            <label htmlFor="subject-filter">
              درس
              <select
                id="subject-filter"
                onChange={(event) => setSubjectFilter(event.target.value)}
                value={subjectFilter}
              >
                <option value="ALL">همه درس‌ها</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}{subject.archivedAt ? ' (بایگانی‌شده)' : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {subjectError && (
          <div className="planning-alert" role="alert">
            <span>{subjectError}</span>
            <Button onClick={() => void refreshSubjects()} variant="ghost">تلاش دوباره برای درس‌ها</Button>
          </div>
        )}
        {actionError && <div className="planning-alert" role="alert">{actionError}</div>}
        {listError && tasks.length > 0 && <div className="planning-alert" role="alert">{listError}</div>}

        {isInitialLoading ? (
          <ContentState
            description="کارهای امروز از فضای امن شما دریافت می‌شوند."
            kind="loading"
            title="در حال دریافت برنامه امروز"
          />
        ) : listError && tasks.length === 0 ? (
          <ContentState
            action={<Button onClick={() => setRefreshKey((current) => current + 1)}>تلاش دوباره</Button>}
            description={listError}
            kind="error"
            title="برنامه امروز دریافت نشد"
          />
        ) : tasks.length === 0 ? (
          <ContentState
            action={<Button onClick={() => setIsCreateOpen(true)}>ساخت اولین کار امروز</Button>}
            description="برای فیلتر فعلی کاری وجود ندارد. می‌توانید یک کار شخصی برای امروز بسازید."
            kind="empty"
            title="فهرست امروز خالی است"
          />
        ) : (
          <div className="task-list">
            {tasks.map((task) => {
              const subject = task.subjectId ? subjectById.get(task.subjectId) : undefined
              const isUpdating = updatingTaskIds.has(task.id)

              return (
                <article className={`task-item task-item--${task.status.toLowerCase()}`} key={task.id}>
                  <div className="task-item__main">
                    <div className="task-item__heading">
                      <h3>{task.title}</h3>
                      <span className={`task-status task-status--${task.status.toLowerCase()}`}>
                        {statusLabels[task.status]}
                      </span>
                    </div>
                    <div className="task-meta">
                      <span>{subject?.name ?? (task.subjectId ? 'درس نامشخص' : 'بدون درس')}</span>
                      {task.source === 'COUNSELOR' && (
                        <span className="task-source--counselor">تعیین‌شده توسط مشاور</span>
                      )}
                      {task.estimatedMinutes !== null && (
                        <span>{numberFormatter.format(task.estimatedMinutes)} دقیقه</span>
                      )}
                    </div>
                    {task.description && <p className="task-description">{task.description}</p>}
                  </div>
                  {task.status === 'PENDING' && (
                    <div className="task-actions" aria-label={`اقدام‌های ${task.title}`}>
                      <Button
                        disabled={isUpdating}
                        onClick={() => void handleStatusUpdate(task, 'COMPLETED')}
                      >
                        {isUpdating ? 'در حال ثبت…' : 'انجام شد'}
                      </Button>
                      <Button
                        disabled={isUpdating}
                        onClick={() => void handleStatusUpdate(task, 'SKIPPED')}
                        variant="ghost"
                      >
                        رد کردن
                      </Button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {nextCursor && !isInitialLoading && tasks.length > 0 && (
          <div className="load-more">
            <Button disabled={isLoadingMore} onClick={() => void handleLoadMore()} variant="secondary">
              {isLoadingMore ? 'در حال دریافت…' : 'نمایش کارهای بیشتر'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
