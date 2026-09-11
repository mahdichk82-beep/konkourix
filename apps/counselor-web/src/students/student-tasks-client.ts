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

export type CounselorCreatedTask = {
  completedAt: string | null
  createdAt: string
  description: string | null
  estimatedMinutes: number | null
  id: string
  scheduledFor: string
  source: 'COUNSELOR'
  status: 'PENDING'
  studentProfileId: string
  studyPlanId: null
  subjectId: string | null
  title: string
  topicId: string | null
  updatedAt: string
}

type Page<T> = {
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

const withPage = (path: string, cursor?: string) => {
  const query = new URLSearchParams({ limit: '100' })
  if (cursor) query.set('cursor', cursor)
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
