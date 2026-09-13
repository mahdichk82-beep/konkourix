import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AuthApiError } from '../auth/auth-client'
import {
  assessmentClient,
  type AssessmentAttempt,
} from '../assessments/assessment-client'
import {
  buildAssessmentAttemptPayload,
  formQuestionCount,
  invalidateAssessmentAttempt,
  type AssessmentAttemptForm,
} from '../assessments/assessment-attempts'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ContentState } from '../components/ui/ContentState'
import {
  planningClient,
  type DailyTask,
  type StudySubject,
  type StudyTopic,
} from '../planning/planning-client'
import '../assessments/assessments.css'

const numberFormatter = new Intl.NumberFormat('fa-IR')
const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const emptyForm: AssessmentAttemptForm = {
  blankCount: '0',
  correctCount: '0',
  dailyTaskId: '',
  endedAt: '',
  incorrectCount: '0',
  startedAt: '',
  subjectId: '',
  title: '',
  topicId: '',
}

const errorMessage = (error: unknown): string => {
  if (error instanceof AuthApiError) {
    if (error.code === 'TASK_NOT_FOUND') return 'کار انتخاب‌شده پیدا نشد یا متعلق به شما نیست.'
    if (error.code === 'SUBJECT_NOT_FOUND') return 'درس انتخاب‌شده پیدا نشد یا متعلق به شما نیست.'
    if (error.code === 'TOPIC_NOT_FOUND') return 'مبحث انتخاب‌شده پیدا نشد یا متعلق به شما نیست.'
    if (error.code === 'ATTEMPT_INVALIDATED') return 'رکورد باطل‌شده قابل ویرایش نیست.'
    if (error.code === 'ATTEMPT_ALREADY_INVALIDATED') return 'این رکورد قبلاً باطل شده است.'
  }
  return 'ثبت اطلاعات انجام نشد. دوباره تلاش کنید.'
}

const loadAllAttempts = async (): Promise<AssessmentAttempt[]> => {
  const attempts: AssessmentAttempt[] = []
  let cursor: string | undefined
  do {
    const page = await assessmentClient.list(cursor)
    attempts.push(...page.items)
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  return attempts
}

const loadAllTasks = async (): Promise<DailyTask[]> => {
  const tasks: DailyTask[] = []
  let cursor: string | undefined
  do {
    const page = await planningClient.listTasks({ cursor, limit: 100 })
    tasks.push(...page.items)
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  return tasks
}

const loadAllSubjects = async (): Promise<StudySubject[]> => {
  const subjects: StudySubject[] = []
  let cursor: string | undefined
  do {
    const page = await planningClient.listSubjects(cursor)
    subjects.push(...page.items)
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  return subjects.filter((subject) => subject.archivedAt === null)
}

export function AssessmentAttemptsPage() {
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([])
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [subjects, setSubjects] = useState<StudySubject[]>([])
  const [topics, setTopics] = useState<StudyTopic[]>([])
  const [form, setForm] = useState<AssessmentAttemptForm>(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [invalidatingId, setInvalidatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === form.dailyTaskId) ?? null,
    [form.dailyTaskId, tasks],
  )
  const questionCount = formQuestionCount(form)

  useEffect(() => {
    let active = true
    void Promise.all([loadAllAttempts(), loadAllTasks(), loadAllSubjects()])
      .then(([loadedAttempts, loadedTasks, loadedSubjects]) => {
        if (!active) return
        setAttempts(loadedAttempts)
        setTasks(loadedTasks)
        setSubjects(loadedSubjects)
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!form.subjectId) return
    let active = true
    void planningClient.listTopics(form.subjectId).then((page) => {
      if (active) setTopics(page.items.filter((topic) => topic.archivedAt === null))
    }).catch((reason: unknown) => {
      if (active) setError(errorMessage(reason))
    })
    return () => { active = false }
  }, [form.subjectId])

  const change = (field: keyof AssessmentAttemptForm, value: string) => {
    if (field === 'subjectId') {
      setTopics([])
      setForm((current) => ({ ...current, subjectId: value, topicId: '' }))
      return
    }
    setForm((current) => ({ ...current, [field]: value }))
  }

  const selectTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId)
    setForm((current) => ({
      ...current,
      dailyTaskId: taskId,
      subjectId: taskId ? task?.subjectId ?? '' : current.subjectId,
      topicId: taskId ? task?.topicId ?? '' : current.topicId,
      title: current.title || task?.title || '',
    }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    const payload = buildAssessmentAttemptPayload(form)
    if (!payload) {
      setError('عنوان، بازه زمانی معتبر و حداقل یک سؤال را وارد کنید.')
      return
    }
    setIsSaving(true)
    try {
      const created = await assessmentClient.create(payload)
      setAttempts((current) => [created, ...current])
      setForm(emptyForm)
      setSuccess('نتیجه آزمون ثبت شد. وضعیت کار برنامه‌ریزی‌شده تغییر نکرد.')
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setIsSaving(false)
    }
  }

  const invalidate = async (attempt: AssessmentAttempt) => {
    if (!window.confirm(`رکورد «${attempt.title}» باطل شود؟ این نتیجه در شمارش اجرا لحاظ نخواهد شد.`)) return
    setInvalidatingId(attempt.id)
    setError(null)
    setSuccess(null)
    try {
      const updated = await invalidateAssessmentAttempt(
        attempts,
        attempt.id,
        (id) => assessmentClient.invalidate(id),
      )
      setAttempts(updated)
      setSuccess('رکورد آزمون باطل شد و دیگر در اجرای معتبر شمرده نمی‌شود.')
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setInvalidatingId(null)
    }
  }

  if (isLoading) {
    return <ContentState kind="loading" title="در حال دریافت آزمون‌ها" description="تاریخچه امن آزمون‌های شما دریافت می‌شود." />
  }

  return (
    <div className="page-stack assessment-page">
      <Card className="assessment-hero">
        <div>
          <p className="eyebrow">اجرای ارزیابی</p>
          <h2>نتیجه یک آزمون پایان‌یافته را ثبت کنید</h2>
          <p>تعداد پاسخ‌های درست، نادرست و سفید به‌عنوان واقعیت خام نگهداری می‌شود؛ امتیاز یا درصد محاسبه نمی‌شود.</p>
        </div>
        <span className="assessment-total">{numberFormatter.format(attempts.length)} رکورد</span>
      </Card>

      {error && <p className="form-error" role="alert">{error}</p>}
      {success && <p className="form-success" role="status">{success}</p>}

      <Card title="ثبت نتیجه آزمون">
        <form className="assessment-form" onSubmit={(event) => void submit(event)}>
          <label>عنوان آزمون
            <input maxLength={200} onChange={(event) => change('title', event.target.value)} value={form.title} />
          </label>
          <label>کار برنامه‌ریزی‌شده (اختیاری)
            <select onChange={(event) => selectTask(event.target.value)} value={form.dailyTaskId}>
              <option value="">بدون اتصال به کار روزانه</option>
              {tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
            </select>
          </label>
          <div className="assessment-form__row">
            <label>درس (اختیاری)
              <select disabled={selectedTask !== null} onChange={(event) => change('subjectId', event.target.value)} value={form.subjectId}>
                <option value="">بدون درس مشخص</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <label>مبحث (اختیاری)
              <select disabled={!form.subjectId || selectedTask !== null} onChange={(event) => change('topicId', event.target.value)} value={form.topicId}>
                <option value="">بدون مبحث مشخص</option>
                {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
              </select>
            </label>
          </div>
          <div className="assessment-form__row">
            <label>زمان شروع
              <input dir="ltr" onChange={(event) => change('startedAt', event.target.value)} type="datetime-local" value={form.startedAt} />
            </label>
            <label>زمان پایان
              <input dir="ltr" onChange={(event) => change('endedAt', event.target.value)} type="datetime-local" value={form.endedAt} />
            </label>
          </div>
          <div className="assessment-counts">
            <label>درست<input inputMode="numeric" min="0" onChange={(event) => change('correctCount', event.target.value)} type="number" value={form.correctCount} /></label>
            <label>نادرست<input inputMode="numeric" min="0" onChange={(event) => change('incorrectCount', event.target.value)} type="number" value={form.incorrectCount} /></label>
            <label>سفید<input inputMode="numeric" min="0" onChange={(event) => change('blankCount', event.target.value)} type="number" value={form.blankCount} /></label>
          </div>
          <div className="assessment-form__footer">
            <strong>مجموع: {numberFormatter.format(questionCount)} سؤال</strong>
            <Button disabled={isSaving} type="submit">{isSaving ? 'در حال ثبت…' : 'ثبت نتیجه'}</Button>
          </div>
        </form>
      </Card>

      <Card title="تاریخچه آزمون‌ها">
        {attempts.length === 0 ? (
          <ContentState kind="empty" title="هنوز نتیجه‌ای ثبت نشده" description="اولین آزمون پایان‌یافته را با فرم بالا ثبت کنید." />
        ) : (
          <div className="assessment-history">
            {attempts.map((attempt) => (
              <article className={`assessment-row${attempt.invalidatedAt ? ' assessment-row--invalidated' : ''}`} key={attempt.id}>
                <div className="assessment-row__main">
                  <div className="assessment-row__title">
                    <h3>{attempt.title}</h3>
                    {attempt.invalidatedAt && <span>باطل‌شده</span>}
                  </div>
                  <p>{dateFormatter.format(new Date(attempt.startedAt))} تا {dateFormatter.format(new Date(attempt.endedAt))}</p>
                  <div className="assessment-facts">
                    <span>درست: {numberFormatter.format(attempt.correctCount)}</span>
                    <span>نادرست: {numberFormatter.format(attempt.incorrectCount)}</span>
                    <span>سفید: {numberFormatter.format(attempt.blankCount)}</span>
                    <span>مجموع: {numberFormatter.format(attempt.questionCount)}</span>
                    <span>مدت: {numberFormatter.format(attempt.durationMinutes)} دقیقه</span>
                  </div>
                </div>
                {!attempt.invalidatedAt && (
                  <Button disabled={invalidatingId === attempt.id} onClick={() => void invalidate(attempt)} variant="danger">
                    {invalidatingId === attempt.id ? 'در حال ابطال…' : 'باطل‌کردن رکورد'}
                  </Button>
                )}
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
