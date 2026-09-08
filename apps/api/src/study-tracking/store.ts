import type {
  DailyTaskRef,
  GoalListQuery,
  SessionListQuery,
  StudentGoalRecord,
  StudentProfileRef,
  StudySessionRecord,
  StudySubjectRef,
} from './types.js'

export interface StudyTrackingStore {
  findStudentProfileByUserId(userId: string): Promise<StudentProfileRef | null>
  findSubjectById(profileId: string, id: string): Promise<StudySubjectRef | null>
  findTaskById(profileId: string, id: string): Promise<DailyTaskRef | null>
  listSessions(profileId: string, query?: SessionListQuery): Promise<StudySessionRecord[]>
  findSessionById(profileId: string, id: string): Promise<StudySessionRecord | null>
  createSession(input: Omit<StudySessionRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudySessionRecord>
  updateSession(profileId: string, id: string, input: Partial<Pick<StudySessionRecord, 'subjectId' | 'dailyTaskId' | 'startedAt' | 'endedAt' | 'notes'>>): Promise<StudySessionRecord | null>
  listGoals(profileId: string, query?: GoalListQuery): Promise<StudentGoalRecord[]>
  findGoalById(profileId: string, id: string): Promise<StudentGoalRecord | null>
  createGoal(input: Omit<StudentGoalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudentGoalRecord>
  updateGoal(profileId: string, id: string, input: Partial<Pick<StudentGoalRecord, 'subjectId' | 'title' | 'description' | 'targetDate' | 'status' | 'completedAt'>>): Promise<StudentGoalRecord | null>
}
