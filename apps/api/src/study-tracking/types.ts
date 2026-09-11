export type StudyTrackingActor = {
  id: string
  role: 'STUDENT' | 'COUNSELOR' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED'
}

export type StudentProfileRef = { id: string; userId: string }
export type StudySubjectRef = { id: string; studentProfileId: string; archivedAt: Date | null }
export type DailyTaskRef = { id: string; studentProfileId: string; subjectId: string | null }
export type StudentGoalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export type StudySessionRecord = {
  id: string
  studentProfileId: string
  subjectId: string | null
  dailyTaskId: string | null
  startedAt: Date
  endedAt: Date
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export type StudySessionView = StudySessionRecord & { durationMinutes: number }

export type StudentGoalRecord = {
  id: string
  studentProfileId: string
  subjectId: string | null
  title: string
  description: string | null
  targetDate: Date | null
  status: StudentGoalStatus
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type TrackingPageQuery = { cursor?: string; limit?: number }
export type SessionListQuery = TrackingPageQuery & {
  dailyTaskId?: string
  from?: Date
  to?: Date
  subjectId?: string
}
export type GoalListQuery = TrackingPageQuery & { status?: StudentGoalStatus; subjectId?: string }
export type TrackingPage<T> = { items: T[]; nextCursor: string | null }
