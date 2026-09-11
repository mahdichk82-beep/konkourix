import type {
  DailyTaskRecord,
  DailyTaskView,
} from '../student-core/types.js'

export type CounselorTaskActor = {
  id: string
  role: 'STUDENT' | 'COUNSELOR' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED'
}

export type CounselorStudentSubject = {
  id: string
  name: string
}

export type CounselorStudentTopic = {
  id: string
  subjectId: string
  title: string
}

export type CounselorTaskPageQuery = {
  cursor?: string
  limit?: number
}

export type CounselorTaskListQuery = CounselorTaskPageQuery & {
  scheduledFrom?: string
  scheduledTo?: string
}

export type CounselorTaskStoreQuery = CounselorTaskPageQuery & {
  scheduledFrom?: Date
  scheduledTo?: Date
}

export type CounselorTaskPage<T> = {
  items: T[]
  nextCursor: string | null
}

export type CreateCounselorTaskInput = {
  title: string
  description?: string | null
  scheduledFor: string
  estimatedMinutes: number | null
  subjectId: string | null
  topicId: string | null
}

export type CreateCounselorTaskRecordInput = Omit<
  DailyTaskRecord,
  'id' | 'createdAt' | 'updatedAt'
>

export type AssignedResourceResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: 'STUDENT_NOT_FOUND' }

export type AssignedTaskResult = AssignedResourceResult<CounselorVisibleTaskView[]>

export type AssignedTopicResult =
  | AssignedResourceResult<CounselorStudentTopic[]>
  | { ok: false; reason: 'SUBJECT_NOT_FOUND' }

export type CreateCounselorTaskResult =
  | { ok: true; value: DailyTaskRecord }
  | {
      ok: false
      reason:
        | 'STUDENT_NOT_FOUND'
        | 'SUBJECT_NOT_FOUND'
        | 'SUBJECT_ARCHIVED'
        | 'TOPIC_SUBJECT_REQUIRED'
        | 'TOPIC_NOT_FOUND'
        | 'TOPIC_SUBJECT_MISMATCH'
        | 'TOPIC_ARCHIVED'
    }

export type CounselorTaskView = DailyTaskView

export type CounselorVisibleTaskView = CounselorTaskView & {
  recordedMinutes: number
  studySessionCount: number
}
