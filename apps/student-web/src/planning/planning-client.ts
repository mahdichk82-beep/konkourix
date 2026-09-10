import { authClient } from '../auth/auth-client'

export type DailyTaskStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED'

export type StudySubject = {
  archivedAt: string | null
  id: string
  name: string
}

export type DailyTask = {
  completedAt: string | null
  createdAt: string
  description: string | null
  estimatedMinutes: number | null
  id: string
  scheduledFor: string
  status: DailyTaskStatus
  subjectId: string | null
  title: string
  updatedAt: string
}

type Page<T> = {
  items: T[]
  nextCursor: string | null
}

export type TaskListQuery = {
  cursor?: string
  date: string
  limit?: number
  status?: DailyTaskStatus
  subjectId?: string
}

export type CreateTaskInput = {
  description: string | null
  estimatedMinutes: number | null
  scheduledFor: string
  subjectId: string | null
  title: string
}

const withQuery = (
  path: string,
  values: Record<string, number | string | undefined>,
): string => {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) query.set(key, String(value))
  }

  const serialized = query.toString()
  return serialized ? `${path}?${serialized}` : path
}

class PlanningClient {
  listSubjects(cursor?: string): Promise<Page<StudySubject>> {
    return authClient.authorizedRequest<Page<StudySubject>>(
      withQuery('/student/subjects', { cursor, limit: 100 }),
    )
  }

  createSubject(name: string): Promise<StudySubject> {
    return authClient.authorizedRequest<StudySubject>('/student/subjects', {
      body: JSON.stringify({ name }),
      method: 'POST',
    })
  }

  listTasks(query: TaskListQuery): Promise<Page<DailyTask>> {
    return authClient.authorizedRequest<Page<DailyTask>>(
      withQuery('/student/daily-tasks', {
        cursor: query.cursor,
        date: query.date,
        limit: query.limit ?? 20,
        status: query.status,
        subjectId: query.subjectId,
      }),
    )
  }

  createTask(input: CreateTaskInput): Promise<DailyTask> {
    return authClient.authorizedRequest<DailyTask>('/student/daily-tasks', {
      body: JSON.stringify(input),
      method: 'POST',
    })
  }

  updateTaskStatus(id: string, status: DailyTaskStatus): Promise<DailyTask> {
    return authClient.authorizedRequest<DailyTask>(
      `/student/daily-tasks/${encodeURIComponent(id)}`,
      {
        body: JSON.stringify({ status }),
        method: 'PATCH',
      },
    )
  }
}

export const planningClient = new PlanningClient()
