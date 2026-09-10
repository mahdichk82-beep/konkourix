export type DomainStudent = {
  id: string
  role: 'STUDENT' | 'COUNSELOR' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED'
}

export type StudentProfileRef = { id: string; userId: string }
export type StudyPlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
export type DailyTaskStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED'

export type StudySubjectRecord = {
  id: string
  studentProfileId: string
  name: string
  normalizedName: string
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type TopicRecord = {
  id: string
  subjectId: string
  title: string
  normalizedTitle: string
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type StudyPlanRecord = {
  id: string
  studentProfileId: string
  title: string
  description: string | null
  status: StudyPlanStatus
  startsOn: Date
  endsOn: Date | null
  createdAt: Date
  updatedAt: Date
}

export type DailyTaskRecord = {
  id: string
  studentProfileId: string
  studyPlanId: string | null
  subjectId: string | null
  title: string
  description: string | null
  scheduledFor: Date
  estimatedMinutes: number | null
  status: DailyTaskStatus
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type PageQuery = { cursor?: string; limit?: number }
export type Page<T> = { items: T[]; nextCursor: string | null }
