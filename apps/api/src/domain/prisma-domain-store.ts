import type { PrismaClient } from '../generated/prisma/client.js'
import type {
  CounselorProfileInput,
  CounselorProfileRecord,
  DomainUser,
  StudentCounselorRecord,
  StudentProfileInput,
  StudentProfileRecord,
  StudentCounselorStatus,
} from './types.js'
import type { DomainStore } from './domain-store.js'

const toDomainUser = (user: {
  id: string
  role: string
  status: string
}): DomainUser => ({
  id: user.id,
  role: user.role as DomainUser['role'],
  status: user.status as DomainUser['status'],
})

const toStudentProfile = (profile: StudentProfileRecord): StudentProfileRecord => profile
const toCounselorProfile = (profile: CounselorProfileRecord): CounselorProfileRecord => profile
const toRelationship = (relationship: StudentCounselorRecord): StudentCounselorRecord => relationship

export const createPrismaDomainStore = (prisma: PrismaClient): DomainStore => ({
  async findUserById(id) {
    const user = await prisma.user.findUnique({
      select: { id: true, role: true, status: true },
      where: { id },
    })
    return user ? toDomainUser(user) : null
  },

  async findStudentProfile(userId) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } })
    return profile ? toStudentProfile(profile) : null
  },

  async upsertStudentProfile(userId: string, input: StudentProfileInput) {
    const profile = await prisma.studentProfile.upsert({
      create: { userId, educationLevel: input.educationLevel ?? null, schoolName: input.schoolName ?? null },
      update: {
        ...(input.educationLevel === undefined ? {} : { educationLevel: input.educationLevel }),
        ...(input.schoolName === undefined ? {} : { schoolName: input.schoolName }),
      },
      where: { userId },
    })
    return toStudentProfile(profile)
  },

  async findCounselorProfile(userId) {
    const profile = await prisma.counselorProfile.findUnique({ where: { userId } })
    return profile ? toCounselorProfile(profile) : null
  },

  async upsertCounselorProfile(userId: string, input: CounselorProfileInput) {
    const profile = await prisma.counselorProfile.upsert({
      create: { userId, bio: input.bio ?? null, specialization: input.specialization ?? null },
      update: {
        ...(input.bio === undefined ? {} : { bio: input.bio }),
        ...(input.specialization === undefined ? {} : { specialization: input.specialization }),
      },
      where: { userId },
    })
    return toCounselorProfile(profile)
  },

  async listStudentRelationships(studentId) {
    const relationships = await prisma.studentCounselor.findMany({
      orderBy: { createdAt: 'desc' },
      where: { studentId },
    })
    return relationships.map(toRelationship)
  },

  async listCounselorRelationships(counselorId) {
    const relationships = await prisma.studentCounselor.findMany({
      orderBy: { createdAt: 'desc' },
      where: { counselorId },
    })
    return relationships.map(toRelationship)
  },

  async createRelationship(input) {
    const relationship = await prisma.studentCounselor.create({ data: input })
    return toRelationship(relationship)
  },

  async updateRelationship(id: string, status: StudentCounselorStatus) {
    try {
      const relationship = await prisma.studentCounselor.update({
        data: {
          endedAt: status === 'INACTIVE' ? new Date() : null,
          status,
        },
        where: { id },
      })
      return toRelationship(relationship)
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
        return null
      }
      throw error
    }
  },
})
