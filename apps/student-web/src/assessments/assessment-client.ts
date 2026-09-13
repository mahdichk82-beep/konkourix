import { authClient } from '../auth/auth-client'

export type AssessmentAttempt = {
  blankCount: number
  correctCount: number
  createdAt: string
  dailyTaskId: string | null
  durationMinutes: number
  endedAt: string
  id: string
  incorrectCount: number
  invalidatedAt: string | null
  questionCount: number
  startedAt: string
  subjectId: string | null
  title: string
  topicId: string | null
  updatedAt: string
}

export type CreateAssessmentAttemptInput = {
  blankCount: number
  correctCount: number
  dailyTaskId: string | null
  endedAt: string
  incorrectCount: number
  startedAt: string
  subjectId: string | null
  title: string
  topicId: string | null
}

export type AssessmentAttemptPage = {
  items: AssessmentAttempt[]
  nextCursor: string | null
}

const listPath = (cursor?: string, dailyTaskId?: string): string => {
  const query = new URLSearchParams({ limit: '50' })
  if (cursor) query.set('cursor', cursor)
  if (dailyTaskId) query.set('dailyTaskId', dailyTaskId)
  return `/student/assessment-attempts?${query.toString()}`
}

class AssessmentClient {
  list(cursor?: string, dailyTaskId?: string): Promise<AssessmentAttemptPage> {
    return authClient.authorizedRequest<AssessmentAttemptPage>(listPath(cursor, dailyTaskId))
  }

  async hasValidTaskAttempt(dailyTaskId: string): Promise<boolean> {
    const seen = new Set<string>()
    let cursor: string | undefined
    do {
      const page = await this.list(cursor, dailyTaskId)
      if (page.items.some((attempt) => attempt.invalidatedAt === null)) return true
      cursor = page.nextCursor ?? undefined
      if (cursor && seen.has(cursor)) return false
      if (cursor) seen.add(cursor)
    } while (cursor)
    return false
  }

  create(input: CreateAssessmentAttemptInput): Promise<AssessmentAttempt> {
    return authClient.authorizedRequest<AssessmentAttempt>('/student/assessment-attempts', {
      body: JSON.stringify(input),
      method: 'POST',
    })
  }

  update(
    id: string,
    input: Partial<Pick<CreateAssessmentAttemptInput, 'blankCount' | 'correctCount' | 'endedAt' | 'incorrectCount' | 'startedAt'>>,
  ): Promise<AssessmentAttempt> {
    return authClient.authorizedRequest<AssessmentAttempt>(
      `/student/assessment-attempts/${encodeURIComponent(id)}`,
      { body: JSON.stringify(input), method: 'PATCH' },
    )
  }

  invalidate(id: string): Promise<AssessmentAttempt> {
    return authClient.authorizedRequest<AssessmentAttempt>(
      `/student/assessment-attempts/${encodeURIComponent(id)}/invalidate`,
      { body: JSON.stringify({}), method: 'PATCH' },
    )
  }
}

export const assessmentClient = new AssessmentClient()
