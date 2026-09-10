import { authClient } from '../auth/auth-client'

export type Topic = {
  archivedAt: string | null
  createdAt: string
  id: string
  subjectId: string
  title: string
  updatedAt: string
}

type Page<T> = {
  items: T[]
  nextCursor: string | null
}

const topicListPath = (subjectId: string, cursor?: string): string => {
  const query = new URLSearchParams({ limit: '100' })
  if (cursor) query.set('cursor', cursor)
  return `/student/subjects/${encodeURIComponent(subjectId)}/topics?${query.toString()}`
}

class TopicClient {
  list(subjectId: string, cursor?: string): Promise<Page<Topic>> {
    return authClient.authorizedRequest<Page<Topic>>(topicListPath(subjectId, cursor))
  }

  create(subjectId: string, title: string): Promise<Topic> {
    return authClient.authorizedRequest<Topic>(
      `/student/subjects/${encodeURIComponent(subjectId)}/topics`,
      {
        body: JSON.stringify({ title }),
        method: 'POST',
      },
    )
  }

  update(id: string, input: { archived?: boolean; title?: string }): Promise<Topic> {
    return authClient.authorizedRequest<Topic>(
      `/student/topics/${encodeURIComponent(id)}`,
      {
        body: JSON.stringify(input),
        method: 'PATCH',
      },
    )
  }
}

export const topicClient = new TopicClient()
