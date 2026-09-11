import type {
  AssignedResourceResult,
  AssignedTopicResult,
  CounselorStudentSubject,
  CounselorTaskPageQuery,
  CreateCounselorTaskRecordInput,
  CreateCounselorTaskResult,
} from './types.js'

export interface CounselorTaskStore {
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
}
