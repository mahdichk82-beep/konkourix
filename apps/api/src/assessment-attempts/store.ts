import type {
  AssessmentAttemptMutableInput,
  AssessmentAttemptPageQuery,
  AssessmentAttemptRecord,
  AssessmentStudentProfileRef,
  AssessmentSubjectRef,
  AssessmentTaskRef,
  AssessmentTopicRef,
  InvalidateAssessmentAttemptResult,
  UpdateAssessmentAttemptResult,
} from './types.js'

export interface AssessmentAttemptStore {
  findStudentProfileByUserId(userId: string): Promise<AssessmentStudentProfileRef | null>
  findTaskById(profileId: string, id: string): Promise<AssessmentTaskRef | null>
  findSubjectById(profileId: string, id: string): Promise<AssessmentSubjectRef | null>
  findTopicById(profileId: string, id: string): Promise<AssessmentTopicRef | null>
  listAttempts(profileId: string, query?: AssessmentAttemptPageQuery): Promise<AssessmentAttemptRecord[]>
  findAttemptById(profileId: string, id: string): Promise<AssessmentAttemptRecord | null>
  createAttempt(input: Omit<AssessmentAttemptRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssessmentAttemptRecord>
  updateAttempt(profileId: string, id: string, input: AssessmentAttemptMutableInput): Promise<UpdateAssessmentAttemptResult>
  invalidateAttempt(profileId: string, id: string, invalidatedAt: Date): Promise<InvalidateAssessmentAttemptResult>
}
