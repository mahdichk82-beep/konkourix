export type AssessmentAttemptActor = {
  id: string
  role: 'STUDENT' | 'COUNSELOR' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED'
}

export type AssessmentStudentProfileRef = { id: string; userId: string }
export type AssessmentSubjectRef = {
  archivedAt: Date | null
  id: string
  studentProfileId: string
}
export type AssessmentTopicRef = {
  archivedAt: Date | null
  id: string
  subjectId: string
}
export type AssessmentTaskRef = {
  id: string
  studentProfileId: string
  subjectId: string | null
  topicId: string | null
}

export type AssessmentAttemptRecord = {
  id: string
  studentProfileId: string
  dailyTaskId: string | null
  subjectId: string | null
  topicId: string | null
  title: string
  startedAt: Date
  endedAt: Date
  correctCount: number
  incorrectCount: number
  blankCount: number
  invalidatedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type AssessmentAttemptView = Omit<AssessmentAttemptRecord, 'studentProfileId'> & {
  durationMinutes: number
  questionCount: number
}

export type AssessmentAttemptPageQuery = {
  cursor?: string
  dailyTaskId?: string
  limit?: number
}
export type AssessmentAttemptPage<T> = { items: T[]; nextCursor: string | null }

export type AssessmentAttemptMutableInput = Partial<Pick<
  AssessmentAttemptRecord,
  'blankCount' | 'correctCount' | 'endedAt' | 'incorrectCount' | 'startedAt'
>>

export type UpdateAssessmentAttemptResult =
  | { ok: true; value: AssessmentAttemptRecord }
  | { ok: false; reason: 'ATTEMPT_NOT_FOUND' | 'ATTEMPT_INVALIDATED' }

export type InvalidateAssessmentAttemptResult =
  | { ok: true; value: AssessmentAttemptRecord }
  | { ok: false; reason: 'ATTEMPT_NOT_FOUND' | 'ATTEMPT_ALREADY_INVALIDATED' }
