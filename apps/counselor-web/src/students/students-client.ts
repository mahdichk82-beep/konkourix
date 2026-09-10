import { authClient } from '../auth/auth-client'

export type CounselorStudent = {
  id: string
  displayName: string | null
  educationLevel: string | null
  schoolName: string | null
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED'
}

export type CounselorStudentPage = {
  items: CounselorStudent[]
  nextCursor: string | null
}

export const studentsClient = {
  list(cursor?: string): Promise<CounselorStudentPage> {
    const query = new URLSearchParams({ limit: '24' })
    if (cursor) query.set('cursor', cursor)
    return authClient.authorizedRequest<CounselorStudentPage>(
      `/counselor/students?${query.toString()}`,
    )
  },

  get(id: string): Promise<CounselorStudent> {
    return authClient.authorizedRequest<CounselorStudent>(
      `/counselor/students/${encodeURIComponent(id)}`,
    )
  },
}
