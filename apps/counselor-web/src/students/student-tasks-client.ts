import { authClient } from '../auth/auth-client'

export type CounselorTaskSubject = {
  id: string
  name: string
}

export type CounselorTaskTopic = {
  id: string
  subjectId: string
  title: string
}

type CounselorTask = {
  completedAt: string | null
  createdAt: string
  description: string | null
  estimatedMinutes: number | null
  id: string
  scheduledFor: string
  source: 'PERSONAL' | 'COUNSELOR'
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED'
  studentProfileId: string
  studyPlanId: string | null
  subjectId: string | null
  title: string
  topicId: string | null
  updatedAt: string
}

export type CounselorVisibleTask = CounselorTask & {
  recordedMinutes: number
  studySessionCount: number
}

export type CounselorCreatedTask = CounselorTask & {
  source: 'COUNSELOR'
  status: 'PENDING'
}

export type Page<T> = {
  items: T[]
  nextCursor: string | null
}

export type CreateCounselorTaskInput = {
  description: string | null
  estimatedMinutes: number | null
  scheduledFor: string
  subjectId: string | null
  title: string
  topicId: string | null
}

const resourcePath = (studentProfileId: string, suffix: string) =>
  `/counselor/students/${encodeURIComponent(studentProfileId)}${suffix}`

const withPage = (
  path: string,
  cursor?: string,
  limit = 100,
  range?: { from: string; to: string },
) => {
  const query = new URLSearchParams({ limit: String(limit) })
  if (cursor) query.set('cursor', cursor)
  if (range) {
    query.set('from', range.from)
    query.set('to', range.to)
  }
  return `${path}?${query.toString()}`
}

const listAll = async <T>(path: string): Promise<T[]> => {
  const items: T[] = []
  let cursor: string | undefined

  do {
    const page = await authClient.authorizedRequest<Page<T>>(withPage(path, cursor))
    items.push(...page.items)
    cursor = page.nextCursor ?? undefined
  } while (cursor)

  return items
}

export const studentTasksClient = {
  listTasks(
    studentProfileId: string,
    cursor?: string,
    range?: { from: string; to: string },
  ): Promise<Page<CounselorVisibleTask>> {
    return authClient.authorizedRequest<Page<CounselorVisibleTask>>(
      withPage(resourcePath(studentProfileId, '/tasks'), cursor, range ? 100 : 20, range),
    )
  },

  listSubjects(studentProfileId: string): Promise<CounselorTaskSubject[]> {
    return listAll<CounselorTaskSubject>(resourcePath(studentProfileId, '/subjects'))
  },

  listTopics(
    studentProfileId: string,
    subjectId: string,
  ): Promise<CounselorTaskTopic[]> {
    return listAll<CounselorTaskTopic>(
      resourcePath(
        studentProfileId,
        `/subjects/${encodeURIComponent(subjectId)}/topics`,
      ),
    )
  },

  create(
    studentProfileId: string,
    input: CreateCounselorTaskInput,
  ): Promise<CounselorCreatedTask> {
    return authClient.authorizedRequest<CounselorCreatedTask>(
      resourcePath(studentProfileId, '/tasks'),
      {
        body: JSON.stringify(input),
        method: 'POST',
      },
    )
  },
}
