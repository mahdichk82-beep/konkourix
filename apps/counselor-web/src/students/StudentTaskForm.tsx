import { useEffect, useState, type FormEvent } from 'react'
import { AuthApiError } from '../auth/auth-client'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ContentState } from '../components/ui/ContentState'
import {
  studentTasksClient,
  type CounselorTaskSubject,
  type CounselorTaskTopic,
} from './student-tasks-client'

type StudentTaskFormProps = {
  onTaskCreated?(): void
  studentId: string
}

const localDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const resourceError = (error: unknown) => {
  if (error instanceof AuthApiError && error.status === 404) {
    return 'تخصیص فعال این دانش‌آموز پیدا نشد یا دسترسی شما تغییر کرده است.'
  }
  return 'دریافت درس‌های دانش‌آموز ممکن نشد. دوباره تلاش کنید.'
}

const createError = (error: unknown) => {
  if (error instanceof AuthApiError) {
    if (error.code === 'STUDENT_NOT_FOUND') {
      return 'تخصیص فعال این دانش‌آموز پیدا نشد. صفحه را دوباره بارگذاری کنید.'
    }
    if (error.code === 'SUBJECT_NOT_FOUND' || error.code === 'SUBJECT_ARCHIVED') {
      return 'درس انتخاب‌شده دیگر در دسترس نیست. فهرست درس‌ها را تازه کنید.'
    }
    if (
      error.code === 'TOPIC_NOT_FOUND'
      || error.code === 'TOPIC_ARCHIVED'
      || error.code === 'TOPIC_SUBJECT_MISMATCH'
    ) {
      return 'مبحث انتخاب‌شده دیگر برای این درس در دسترس نیست.'
    }
  }
  return 'ثبت وظیفه ممکن نشد. اطلاعات را بررسی و دوباره تلاش کنید.'
}

export function StudentTaskForm({ onTaskCreated, studentId }: StudentTaskFormProps) {
  const [subjects, setSubjects] = useState<CounselorTaskSubject[]>([])
  const [topics, setTopics] = useState<CounselorTaskTopic[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [topicsLoading, setTopicsLoading] = useState(false)
  const [subjectsError, setSubjectsError] = useState<string | null>(null)
  const [topicsError, setTopicsError] = useState<string | null>(null)
  const [refreshSubjects, setRefreshSubjects] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledFor, setScheduledFor] = useState(localDate)
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    studentTasksClient.listSubjects(studentId).then((items) => {
      if (!active) return
      setSubjects(items)
      setSubjectId((current) => (
        current && items.some(({ id }) => id === current) ? current : ''
      ))
    }).catch((error: unknown) => {
      if (!active) return
      setSubjects([])
      setSubjectId('')
      setSubjectsError(resourceError(error))
    }).finally(() => {
      if (active) setSubjectsLoading(false)
    })
    return () => {
      active = false
    }
  }, [refreshSubjects, studentId])

  useEffect(() => {
    if (!subjectId) return

    let active = true
    studentTasksClient.listTopics(studentId, subjectId).then((items) => {
      if (active) setTopics(items)
    }).catch((error: unknown) => {
      if (!active) return
      setTopics([])
      setTopicsError(resourceError(error))
    }).finally(() => {
      if (active) setTopicsLoading(false)
    })
    return () => {
      active = false
    }
  }, [studentId, subjectId])

  const selectSubject = (nextSubjectId: string) => {
    setSubjectId(nextSubjectId)
    setTopicId('')
    setTopics([])
    setTopicsError(null)
    setTopicsLoading(Boolean(nextSubjectId))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedTitle = title.trim()
    if (!normalizedTitle || !scheduledFor) {
      setFormError('عنوان و تاریخ وظیفه الزامی است.')
      return
    }

    setSubmitting(true)
    setFormError(null)
    setSuccess(null)
    try {
      const task = await studentTasksClient.create(studentId, {
        title: normalizedTitle,
        description: description.trim() || null,
        scheduledFor,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
        subjectId: subjectId || null,
        topicId: topicId || null,
      })
      setTitle('')
      setDescription('')
      setEstimatedMinutes('')
      setSuccess(`وظیفه «${task.title}» برای دانش‌آموز ثبت شد.`)
      onTaskCreated?.()
    } catch (error) {
      setFormError(createError(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="student-task-card" title="ایجاد وظیفه برای دانش‌آموز">
      <p className="student-task-card__intro">
        وظیفه با منبع مشاور و در وضعیت «در انتظار» ثبت می‌شود و دانش‌آموز آن را در برنامه روز انتخاب‌شده می‌بیند.
      </p>

      {subjectsLoading ? (
        <ContentState
          description="درس‌های فعال دانش‌آموز برای انتخاب امن در حال دریافت است."
          kind="loading"
          title="در حال دریافت درس‌ها"
        />
      ) : subjectsError ? (
        <ContentState
          action={<Button onClick={() => {
            setSubjectsLoading(true)
            setSubjectsError(null)
            setRefreshSubjects((value) => value + 1)
          }}>تلاش دوباره</Button>}
          description={subjectsError}
          kind="error"
          title="درس‌ها در دسترس نیستند"
        />
      ) : (
        <form className="student-task-form" onSubmit={(event) => void submit(event)}>
          <div className="student-task-form__grid">
            <label htmlFor="counselor-task-title">
              عنوان وظیفه
              <input
                id="counselor-task-title"
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="مثلاً مرور فصل ژنتیک"
                required
                value={title}
              />
            </label>
            <label htmlFor="counselor-task-date">
              تاریخ انجام
              <input
                id="counselor-task-date"
                onChange={(event) => setScheduledFor(event.target.value)}
                required
                type="date"
                value={scheduledFor}
              />
            </label>
            <label htmlFor="counselor-task-minutes">
              زمان تخمینی (دقیقه)
              <input
                id="counselor-task-minutes"
                max={1440}
                min={1}
                onChange={(event) => setEstimatedMinutes(event.target.value)}
                placeholder="اختیاری"
                type="number"
                value={estimatedMinutes}
              />
            </label>
            <label htmlFor="counselor-task-subject">
              درس
              <select
                id="counselor-task-subject"
                onChange={(event) => selectSubject(event.target.value)}
                value={subjectId}
              >
                <option value="">بدون درس</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </label>
            <label htmlFor="counselor-task-topic">
              مبحث
              <select
                disabled={!subjectId || topicsLoading || Boolean(topicsError)}
                id="counselor-task-topic"
                onChange={(event) => setTopicId(event.target.value)}
                value={topicId}
              >
                <option value="">
                  {topicsLoading ? 'در حال دریافت مباحث…' : 'بدون مبحث'}
                </option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.title}</option>
                ))}
              </select>
            </label>
          </div>

          <label htmlFor="counselor-task-description">
            توضیحات
            <textarea
              id="counselor-task-description"
              maxLength={2000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="توضیح تکمیلی برای دانش‌آموز (اختیاری)"
              rows={4}
              value={description}
            />
          </label>

          {subjects.length === 0 && (
            <p className="student-task-form__hint" role="status">
              این دانش‌آموز درس فعالی ندارد؛ وظیفه را می‌توانید بدون درس ثبت کنید.
            </p>
          )}
          {subjectId && !topicsLoading && !topicsError && topics.length === 0 && (
            <p className="student-task-form__hint" role="status">
              برای درس انتخاب‌شده مبحث فعالی وجود ندارد؛ انتخاب مبحث اختیاری است.
            </p>
          )}
          {topicsError && <p className="form-error" role="alert">{topicsError}</p>}
          {formError && <p className="form-error" role="alert">{formError}</p>}
          {success && <p className="form-success" role="status">{success}</p>}

          <div className="student-task-form__actions">
            <Button disabled={submitting} type="submit">
              {submitting ? 'در حال ثبت…' : 'ثبت وظیفه برای دانش‌آموز'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
