import type {
  DailyTaskRecord,
  DailyTaskStatus,
  PageQuery,
  StudyPlanRecord,
  StudyPlanStatus,
  StudySubjectRecord,
  StudentProfileRef,
} from './types.js'

export interface StudentCoreStore {
  findStudentProfileByUserId(userId: string): Promise<StudentProfileRef | null>
  listSubjects(profileId: string, query?: PageQuery): Promise<StudySubjectRecord[]>
  findSubjectById(profileId: string, id: string): Promise<StudySubjectRecord | null>
  createSubject(input: { studentProfileId: string; name: string; normalizedName: string }): Promise<StudySubjectRecord>
  updateSubject(profileId: string, id: string, input: { name?: string; normalizedName?: string; archivedAt?: Date | null }): Promise<StudySubjectRecord | null>
  listPlans(profileId: string, query?: PageQuery & { status?: StudyPlanStatus }): Promise<StudyPlanRecord[]>
  findPlanById(profileId: string, id: string): Promise<StudyPlanRecord | null>
  createPlan(input: Omit<StudyPlanRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudyPlanRecord>
  updatePlan(profileId: string, id: string, input: Partial<Pick<StudyPlanRecord, 'title' | 'description' | 'status' | 'startsOn' | 'endsOn'>>): Promise<StudyPlanRecord | null>
  listTasks(profileId: string, query?: PageQuery & { scheduledFor?: Date; status?: DailyTaskStatus; studyPlanId?: string; subjectId?: string }): Promise<DailyTaskRecord[]>
  findTaskById(profileId: string, id: string): Promise<DailyTaskRecord | null>
  createTask(input: Omit<DailyTaskRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyTaskRecord>
  updateTask(profileId: string, id: string, input: Partial<Pick<DailyTaskRecord, 'studyPlanId' | 'subjectId' | 'title' | 'description' | 'scheduledFor' | 'estimatedMinutes' | 'status' | 'completedAt'>>): Promise<DailyTaskRecord | null>
}
