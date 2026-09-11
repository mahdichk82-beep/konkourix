import { authClient } from '../auth/auth-client'

export type DailyTaskStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED'
export type DailyTaskSource = 'PERSONAL' | 'COUNSELOR'

export type StudySubject = {
  archivedAt: string | null
  id: string
  name: string
}

export type StudyTopic = {
  archivedAt: string | null
  id: string
  subjectId: string
  title: string
}

export type DailyTask = {
  completedAt: string | null
  createdAt: string
  description: string | null
  estimatedMinutes: number | null
  id: string
  scheduledFor: string
  source: DailyTaskSource
  status: DailyTaskStatus
  subjectId: string | null
  topicId: string | null
  title: string
  updatedAt: string
}

export type StudySession = {
  createdAt: string
  dailyTaskId: string | null
  durationMinutes: number
  endedAt: string
  id: string
  notes: string | null
  startedAt: string
  subjectId: string | null
  updatedAt: string
}

type Page<T> = {
  items: T[]
  nextCursor: string | null
}

export type TaskListQuery = {
  cursor?: string
  date?: string
  from?: string
  limit?: number
  status?: DailyTaskStatus
  subjectId?: string
  to?: string
}

export type CreateTaskInput = {
  description: string | null
  estimatedMinutes: number | null
  scheduledFor: string
  subjectId: string | null
  topicId: string | null
  title: string
}

export type UpdateTaskInput = {
  status?: DailyTaskStatus
  subjectId?: string | null
  topicId?: string | null
}

export type CreateTaskSessionInput = {
  endedAt: string
  notes: string | null
  startedAt: string
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

  listTopics(subjectId: string, cursor?: string): Promise<Page<StudyTopic>> {
    return authClient.authorizedRequest<Page<StudyTopic>>(
      withQuery(`/student/subjects/${encodeURIComponent(subjectId)}/topics`, {
        cursor,
        limit: 100,
      }),
    )
  }

  listTasks(query: TaskListQuery): Promise<Page<DailyTask>> {
    return authClient.authorizedRequest<Page<DailyTask>>(
      withQuery('/student/daily-tasks', {
        cursor: query.cursor,
        date: query.date,
        from: query.from,
        limit: query.limit ?? 20,
        status: query.status,
        subjectId: query.subjectId,
        to: query.to,
      }),
    )
  }

  createTask(input: CreateTaskInput): Promise<DailyTask> {
    return authClient.authorizedRequest<DailyTask>('/student/daily-tasks', {
      body: JSON.stringify(input),
      method: 'POST',
    })
  }

  listTaskSessions(taskId: string, cursor?: string): Promise<Page<StudySession>> {
    return authClient.authorizedRequest<Page<StudySession>>(
      withQuery('/student/study-sessions', {
        cursor,
        dailyTaskId: taskId,
        limit: 100,
      }),
    )
  }

  createTaskSession(
    taskId: string,
    input: CreateTaskSessionInput,
  ): Promise<StudySession> {
    return authClient.authorizedRequest<StudySession>(
      `/student/daily-tasks/${encodeURIComponent(taskId)}/sessions`,
      {
        body: JSON.stringify(input),
        method: 'POST',
      },
    )
  }

  updateTask(id: string, input: UpdateTaskInput): Promise<DailyTask> {
    return authClient.authorizedRequest<DailyTask>(
      `/student/daily-tasks/${encodeURIComponent(id)}`,
      {
        body: JSON.stringify(input),
        method: 'PATCH',
      },
    )
  }

  updateTaskStatus(id: string, status: DailyTaskStatus): Promise<DailyTask> {
    return this.updateTask(id, { status })
  }

  rescheduleTask(id: string, scheduledFor: string): Promise<DailyTask> {
    return authClient.authorizedRequest<DailyTask>(
      `/student/daily-tasks/${encodeURIComponent(id)}/schedule`,
      {
        body: JSON.stringify({ scheduledFor }),
        method: 'PATCH',
      },
    )
  }
}

export const planningClient = new PlanningClient()
