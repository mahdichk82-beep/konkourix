import { useMemo, useState } from 'react'
import { AuthApiError } from '../auth/auth-client'
import { Button } from '../components/ui/Button'
import {
  planningClient,
  type StudySession,
} from './planning-client'

type TaskExecutionPanelProps = {
  taskId: string
  taskTitle: string
}

const dateTimeFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const executionErrorMessage = (error: unknown) => {
  if (error instanceof AuthApiError) {
    if (error.code === 'TASK_NOT_FOUND') return 'این کار دیگر در دسترس نیست.'
    if (error.code === 'SUBJECT_ARCHIVED') {
      return 'درس این کار بایگانی شده و ثبت مطالعه تازه برای آن ممکن نیست.'
    }
    if (error.code === 'SESSION_TIME_INVALID') {
      return 'زمان پایان باید بعد از زمان شروع باشد.'
    }
  }
  return 'ثبت یا دریافت مطالعه ممکن نشد. دوباره تلاش کنید.'
}

const loadTaskSessions = async (taskId: string): Promise<StudySession[]> => {
  const sessions: StudySession[] = []
  const seenCursors = new Set<string>()
  let cursor: string | undefined

  do {
    const page = await planningClient.listTaskSessions(taskId, cursor)
    sessions.push(...page.items)
    cursor = page.nextCursor ?? undefined
    if (cursor && seenCursors.has(cursor)) break
    if (cursor) seenCursors.add(cursor)
  } while (cursor)

  return sessions
}

export function TaskExecutionPanel({ taskId, taskTitle }: TaskExecutionPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const recordedMinutes = useMemo(
    () => sessions.reduce((total, session) => total + session.durationMinutes, 0),
    [sessions],
  )

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      setSessions(await loadTaskSessions(taskId))
      setLoaded(true)
    } catch (loadError) {
      setError(executionErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  const toggle = () => {
    const nextExpanded = !expanded
    setExpanded(nextExpanded)
    setSuccess(null)
    if (nextExpanded && !loaded && !loading) void refresh()
  }

  const start = () => {
    setStartedAt(new Date())
    setError(null)
    setSuccess(null)
  }

  const finish = async () => {
    if (!startedAt || submitting) return
    const endedAt = new Date()
    if (endedAt <= startedAt) {
      setError('برای ثبت مطالعه، لحظه‌ای بعد از شروع آن را پایان دهید.')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const session = await planningClient.createTaskSession(taskId, {
        endedAt: endedAt.toISOString(),
        notes: notes.trim() || null,
        startedAt: startedAt.toISOString(),
      })
      setSessions((current) => [session, ...current.filter(({ id }) => id !== session.id)])
      setLoaded(true)
      setStartedAt(null)
      setNotes('')
      setSuccess(`مطالعه «${taskTitle}» با ${session.durationMinutes.toLocaleString('fa-IR')} دقیقه ثبت شد. وضعیت کار جداگانه باقی ماند.`)
    } catch (submitError) {
      setError(executionErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="task-execution">
      <Button onClick={toggle} variant="secondary">
        {expanded ? 'بستن ثبت مطالعه' : 'ثبت و مشاهده مطالعه'}
      </Button>

      {expanded && (
        <div className="task-execution__panel">
          {loading ? (
            <p className="task-execution__state" role="status">در حال دریافت مطالعه‌های ثبت‌شده…</p>
          ) : error && !loaded ? (
            <div className="task-execution__state task-execution__state--error" role="alert">
              <span>{error}</span>
              <Button onClick={() => void refresh()} variant="ghost">تلاش دوباره</Button>
            </div>
          ) : (
            <>
              <div className="task-execution__summary">
                <strong>{recordedMinutes.toLocaleString('fa-IR')} دقیقه</strong>
                <span>مطالعه ثبت‌شده در {sessions.length.toLocaleString('fa-IR')} جلسه</span>
                {sessions[0] && (
                  <small>آخرین ثبت: {dateTimeFormatter.format(new Date(sessions[0].endedAt))}</small>
                )}
              </div>

              {startedAt ? (
                <div className="task-execution__active">
                  <p>شروع مطالعه: {dateTimeFormatter.format(startedAt)}</p>
                  <label htmlFor={`session-notes-${taskId}`}>
                    یادداشت (اختیاری)
                    <textarea
                      id={`session-notes-${taskId}`}
                      maxLength={4000}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="مثلاً فصل‌ها یا تمرین‌های مطالعه‌شده"
                      rows={2}
                      value={notes}
                    />
                  </label>
                  <div className="task-execution__actions">
                    <Button disabled={submitting} onClick={() => void finish()}>
                      {submitting ? 'در حال ثبت…' : 'پایان و ثبت مطالعه'}
                    </Button>
                    <Button
                      disabled={submitting}
                      onClick={() => {
                        setStartedAt(null)
                        setNotes('')
                        setError(null)
                      }}
                      variant="ghost"
                    >
                      انصراف
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="task-execution__start">
                  <p>شروع و پایان مطالعه فقط برای ساخت یک جلسه واقعی ثبت می‌شوند و وضعیت کار را تغییر نمی‌دهند.</p>
                  <Button onClick={start}>شروع مطالعه</Button>
                </div>
              )}

              {error && <p className="form-error" role="alert">{error}</p>}
              {success && <p className="form-success" role="status">{success}</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
