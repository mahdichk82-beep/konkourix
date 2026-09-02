import type {
  CounselorProfileInput,
  CounselorProfileRecord,
  DomainUser,
  StudentCounselorRecord,
  StudentProfileInput,
  StudentProfileRecord,
  StudentCounselorStatus,
} from './types.js'

export interface DomainStore {
  findUserById(id: string): Promise<DomainUser | null>
  findStudentProfile(userId: string): Promise<StudentProfileRecord | null>
  upsertStudentProfile(
    userId: string,
    input: StudentProfileInput,
  ): Promise<StudentProfileRecord>
  findCounselorProfile(userId: string): Promise<CounselorProfileRecord | null>
  upsertCounselorProfile(
    userId: string,
    input: CounselorProfileInput,
  ): Promise<CounselorProfileRecord>
  listStudentRelationships(studentId: string): Promise<StudentCounselorRecord[]>
  listCounselorRelationships(counselorId: string): Promise<StudentCounselorRecord[]>
  createRelationship(input: {
    studentId: string
    counselorId: string
  }): Promise<StudentCounselorRecord>
  updateRelationship(
    id: string,
    status: StudentCounselorStatus,
  ): Promise<StudentCounselorRecord | null>
}
