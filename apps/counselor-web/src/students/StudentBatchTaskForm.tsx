import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AuthApiError } from '../auth/auth-client'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ContentState } from '../components/ui/ContentState'
import {
  addBatchTaskRow,
  createBatchTaskRow,
  removeBatchTaskRow,
  submitBatchTaskRows,
  type BatchTaskRow,
} from './batch-task-form'
import {
  studentTasksClient,
  type CounselorTaskSubject,
  type CounselorTaskTopic,
} from './student-tasks-client'

type StudentBatchTaskFormProps = {
  onTasksCreated?(): void
  studentId: string
}

const localDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const batchError = (error: unknown) => {
  if (error instanceof AuthApiError) {
    if (error.code === 'STUDENT_NOT_FOUND') {
      return 'تخصیص فعال این دانش‌آموز پیدا نشد. صفحه را دوباره بارگذاری کنید.'
    }
    if (error.code === 'SUBJECT_NOT_FOUND' || error.code === 'SUBJECT_ARCHIVED') {
      return 'یکی از درس‌های انتخاب‌شده دیگر در دسترس نیست.'
    }
    if (
      error.code === 'TOPIC_NOT_FOUND'
      || error.code === 'TOPIC_ARCHIVED'
      || error.code === 'TOPIC_SUBJECT_MISMATCH'
      || error.code === 'TOPIC_SUBJECT_REQUIRED'
    ) {
      return 'یکی از مباحث انتخاب‌شده با درس همان ردیف سازگار نیست.'
    }
  }
  if (error instanceof Error && error.message) return error.message
  return 'ثبت گروهی وظایف ممکن نشد. اطلاعات را بررسی و دوباره تلاش کنید.'
}

export function StudentBatchTaskForm({
  onTasksCreated,
  studentId,
}: StudentBatchTaskFormProps) {
  const nextRowId = useRef(2)
  const [rows, setRows] = useState<BatchTaskRow[]>(() => [
    createBatchTaskRow('batch-task-1', localDate()),
  ])
  const [subjects, setSubjects] = useState<CounselorTaskSubject[]>([])
  const [topicsBySubject, setTopicsBySubject] = useState<Record<string, CounselorTaskTopic[]>>({})
  const [loadingTopicSubjects, setLoadingTopicSubjects] = useState<Set<string>>(new Set())
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [subjectsError, setSubjectsError] = useState<string | null>(null)
  const [subjectRefreshKey, setSubjectRefreshKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    studentTasksClient.listSubjects(studentId).then((items) => {
      if (!active) return
      setSubjects(items)
      setSubjectsError(null)
    }).catch(() => {
      if (!active) return
      setSubjects([])
      setSubjectsError('دریافت درس‌های دانش‌آموز ممکن نشد. دوباره تلاش کنید.')
    }).finally(() => {
      if (active) setSubjectsLoading(false)
    })
    return () => {
      active = false
    }
  }, [studentId, subjectRefreshKey])

  const updateRow = <K extends keyof BatchTaskRow>(
    id: string,
    field: K,
    value: BatchTaskRow[K],
  ) => {
    setRows((current) => current.map((row) => (
      row.id === id ? { ...row, [field]: value } : row
    )))
  }

  const loadTopics = async (subjectId: string) => {
    if (!subjectId || topicsBySubject[subjectId] || loadingTopicSubjects.has(subjectId)) return
    setLoadingTopicSubjects((current) => new Set(current).add(subjectId))
    try {
      const topics = await studentTasksClient.listTopics(studentId, subjectId)
      setTopicsBySubject((current) => ({ ...current, [subjectId]: topics }))
    } catch (error) {
      setFormError(batchError(error))
    } finally {
      setLoadingTopicSubjects((current) => {
        const next = new Set(current)
        next.delete(subjectId)
        return next
      })
    }
  }

  const selectSubject = (rowId: string, subjectId: string) => {
    setRows((current) => current.map((row) => (
      row.id === rowId ? { ...row, subjectId, topicId: '' } : row
    )))
    setFormError(null)
    if (subjectId) void loadTopics(subjectId)
  }

  const addRow = () => {
    const id = `batch-task-${nextRowId.current}`
    nextRowId.current += 1
    setRows((current) => addBatchTaskRow(current, createBatchTaskRow(id, localDate())))
    setFormError(null)
    setSuccess(null)
  }

  const removeRow = (id: string) => {
    setRows((current) => removeBatchTaskRow(current, id))
    setFormError(null)
    setSuccess(null)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setFormError(null)
    setSuccess(null)

    const result = await submitBatchTaskRows(
      rows,
      (tasks) => studentTasksClient.createBatch(studentId, tasks),
    )
    if (!result.ok) {
      setFormError(batchError(result.error))
      setSubmitting(false)
      return
    }

    setRows([createBatchTaskRow(`batch-task-${nextRowId.current}`, localDate())])
    nextRowId.current += 1
    setSuccess(`${result.value.created.toLocaleString('fa-IR')} وظیفه با موفقیت ثبت شد.`)
    setSubmitting(false)
    onTasksCreated?.()
  }

  return (
    <Card className="student-task-card student-batch-card" title="ایجاد گروهی وظایف">
      <p className="student-task-card__intro">
        چند وظیفه مستقل با منبع مشاور و وضعیت «در انتظار» را در یک عملیات ثبت کنید.
      </p>

      {subjectsLoading ? (
        <ContentState
          description="درس‌های فعال دانش‌آموز برای ردیف‌های برنامه در حال دریافت است."
          kind="loading"
          title="در حال دریافت درس‌ها"
        />
      ) : subjectsError ? (
        <ContentState
          action={<Button onClick={() => {
            setSubjectsLoading(true)
            setSubjectsError(null)
            setSubjectRefreshKey((value) => value + 1)
          }}>تلاش دوباره</Button>}
          description={subjectsError}
          kind="error"
          title="درس‌ها در دسترس نیستند"
        />
      ) : (
        <form className="student-task-form" onSubmit={(event) => void submit(event)}>
          <div className="student-batch-rows">
            {rows.map((row, index) => {
              const topics = row.subjectId ? topicsBySubject[row.subjectId] ?? [] : []
              const topicsLoading = row.subjectId
                ? loadingTopicSubjects.has(row.subjectId)
                : false
              return (
                <section className="student-batch-row" key={row.id}>
                  <div className="student-batch-row__heading">
                    <h3>وظیفه {Number(index + 1).toLocaleString('fa-IR')}</h3>
                    <Button
                      disabled={submitting || rows.length === 1}
                      onClick={() => removeRow(row.id)}
                      type="button"
                      variant="ghost"
                    >
                      حذف ردیف
                    </Button>
                  </div>
                  <div className="student-batch-row__grid">
                    <label htmlFor={`${row.id}-title`}>
                      عنوان
                      <input
                        id={`${row.id}-title`}
                        maxLength={200}
                        onChange={(event) => updateRow(row.id, 'title', event.target.value)}
                        required
                        value={row.title}
                      />
                    </label>
                    <label htmlFor={`${row.id}-date`}>
                      تاریخ
                      <input
                        id={`${row.id}-date`}
                        onChange={(event) => updateRow(row.id, 'scheduledFor', event.target.value)}
                        required
                        type="date"
                        value={row.scheduledFor}
                      />
                    </label>
                    <label htmlFor={`${row.id}-subject`}>
                      درس
                      <select
                        id={`${row.id}-subject`}
                        onChange={(event) => selectSubject(row.id, event.target.value)}
                        value={row.subjectId}
                      >
                        <option value="">بدون درس</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                    </label>
                    <label htmlFor={`${row.id}-topic`}>
                      مبحث
                      <select
                        disabled={!row.subjectId || topicsLoading}
                        id={`${row.id}-topic`}
                        onChange={(event) => updateRow(row.id, 'topicId', event.target.value)}
                        value={row.topicId}
                      >
                        <option value="">{topicsLoading ? 'در حال دریافت…' : 'بدون مبحث'}</option>
                        {topics.map((topic) => (
                          <option key={topic.id} value={topic.id}>{topic.title}</option>
                        ))}
                      </select>
                    </label>
                    <label htmlFor={`${row.id}-minutes`}>
                      زمان برنامه‌ریزی‌شده (دقیقه)
                      <input
                        id={`${row.id}-minutes`}
                        max={1440}
                        min={0}
                        onChange={(event) => updateRow(row.id, 'plannedMinutes', event.target.value)}
                        required
                        type="number"
                        value={row.plannedMinutes}
                      />
                    </label>
                    <label htmlFor={`${row.id}-tests`}>
                      تعداد تست برنامه‌ریزی‌شده
                      <input
                        id={`${row.id}-tests`}
                        min={0}
                        onChange={(event) => updateRow(row.id, 'plannedTestCount', event.target.value)}
                        required
                        type="number"
                        value={row.plannedTestCount}
                      />
                    </label>
                    <label className="student-batch-row__description" htmlFor={`${row.id}-description`}>
                      توضیحات
                      <textarea
                        id={`${row.id}-description`}
                        maxLength={2000}
                        onChange={(event) => updateRow(row.id, 'description', event.target.value)}
                        rows={2}
                        value={row.description}
                      />
                    </label>
                  </div>
                </section>
              )
            })}
          </div>

          {formError && <p className="form-error" role="alert">{formError}</p>}
          {success && <p className="form-success" role="status">{success}</p>}

          <div className="student-batch-actions">
            <Button
              disabled={submitting || rows.length >= 50}
              onClick={addRow}
              type="button"
              variant="secondary"
            >
              افزودن ردیف
            </Button>
            <Button disabled={submitting} type="submit">
              {submitting ? 'در حال ثبت همه وظایف…' : 'ثبت همه وظایف'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
