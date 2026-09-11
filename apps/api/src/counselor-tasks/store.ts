import type {
  AssignedResourceResult,
  AssignedTaskResult,
  AssignedTopicResult,
  CounselorStudentSubject,
  CounselorTaskPageQuery,
  CounselorTaskStoreQuery,
  CreateCounselorTaskRecordInput,
  CreateCounselorTaskResult,
  RescheduleCounselorTaskResult,
} from './types.js'

export interface CounselorTaskStore {
  listAssignedStudentTasks(
    counselorUserId: string,
    studentProfileId: string,
    query: CounselorTaskStoreQuery,
  ): Promise<AssignedTaskResult>
  listAssignedStudentSubjects(
    counselorUserId: string,
    studentProfileId: string,
    query: CounselorTaskPageQuery,
  ): Promise<AssignedResourceResult<CounselorStudentSubject[]>>
  listAssignedStudentTopics(
    counselorUserId: string,
    studentProfileId: string,
    subjectId: string,
    query: CounselorTaskPageQuery,
  ): Promise<AssignedTopicResult>
  createAssignedStudentTask(
    counselorUserId: string,
    studentProfileId: string,
    input: CreateCounselorTaskRecordInput,
  ): Promise<CreateCounselorTaskResult>
  rescheduleAssignedStudentTask(
    counselorUserId: string,
    studentProfileId: string,
    taskId: string,
    scheduledFor: Date,
  ): Promise<RescheduleCounselorTaskResult>
}
