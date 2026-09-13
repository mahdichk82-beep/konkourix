import type {
  DailyTaskStatus,
  StudySession,
  SwitchStudySessionResult,
} from './planning-client'

export type TaskExecutionAction = 'START' | 'FINISH' | 'NONE'

export const taskExecutionAction = (
  taskStatus: DailyTaskStatus,
  taskId: string,
  activeSession: StudySession | null,
): TaskExecutionAction => {
  if (activeSession?.dailyTaskId === taskId) return 'FINISH'
  return taskStatus === 'PENDING' ? 'START' : 'NONE'
}

export type ExecutionStartDecision = 'START' | 'CONTINUE' | 'SWITCH'

export const executionStartDecision = (
  taskId: string,
  activeSession: StudySession | null,
): ExecutionStartDecision => {
  if (!activeSession) return 'START'
  return activeSession.dailyTaskId === taskId ? 'CONTINUE' : 'SWITCH'
}

export const elapsedStudyMilliseconds = (
  startedAt: string,
  currentTimeMs: number,
): number => {
  const startTimeMs = new Date(startedAt).getTime()
  if (!Number.isFinite(startTimeMs)) return 0
  return Math.max(0, currentTimeMs - startTimeMs)
}

export const formatElapsedStudyTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

export const completedStudySummary = (sessions: StudySession[]) => {
  const completedSessions = sessions.filter((session) => session.endedAt !== null)
  return {
    completedSessions,
    recordedMinutes: completedSessions.reduce(
      (total, session) => total + (session.durationMinutes ?? 0),
      0,
    ),
  }
}

export const upsertStudySession = (
  sessions: StudySession[],
  session: StudySession,
): StudySession[] => [session, ...sessions.filter(({ id }) => id !== session.id)]

export const executeStart = (
  taskId: string,
  request: (id: string) => Promise<StudySession>,
): Promise<StudySession> => request(taskId)

export const executeActiveRestore = (
  request: () => Promise<StudySession | null>,
): Promise<StudySession | null> => request()

export const executeFinish = (
  sessionId: string,
  notes: string | null,
  request: (id: string, value: string | null) => Promise<StudySession>,
): Promise<StudySession> => request(sessionId, notes)

export const executeSwitch = (
  taskId: string,
  request: (id: string) => Promise<SwitchStudySessionResult>,
): Promise<SwitchStudySessionResult> => request(taskId)

export const activeSessionAfterFinish = (
  current: StudySession | null,
  finished: StudySession,
): StudySession | null => current?.id === finished.id ? null : current

export const activeSessionAfterSwitch = (
  result: SwitchStudySessionResult,
): StudySession => result.activeSession

export const executionErrorCodeMessage = (code: string): string | null => {
  if (code === 'TASK_NOT_FOUND') return 'این کار دیگر در دسترس نیست.'
  if (code === 'SUBJECT_ARCHIVED') {
    return 'درس این کار بایگانی شده و ثبت مطالعه تازه برای آن ممکن نیست.'
  }
  if (code === 'SESSION_TIME_INVALID') return 'زمان پایان باید بعد از زمان شروع باشد.'
  if (code === 'SESSION_ALREADY_FINISHED') return 'این جلسه قبلاً پایان یافته است.'
  if (code === 'TASK_NOT_EXECUTABLE') return 'فقط کارهای در انتظار قابل شروع هستند.'
  if (code === 'SESSION_NOT_FOUND') return 'این جلسه دیگر در دسترس نیست.'
  if (code === 'ACTIVE_STUDY_SESSION_EXISTS') {
    return 'یک مطالعه دیگر در حال اجراست. وضعیت فعال دوباره دریافت شد؛ برای جابه‌جایی از گزینه تغییر مطالعه استفاده کنید.'
  }
  if (code === 'LIVE_SESSION_CONFLICT') {
    return 'وضعیت مطالعه هم‌زمان تغییر کرد. وضعیت تازه را بررسی و دوباره تلاش کنید.'
  }
  if (code === 'SESSION_ACTIVE_UPDATE_FORBIDDEN') {
    return 'جلسه فعال فقط از مسیر پایان مطالعه قابل تغییر است.'
  }
  return null
}
