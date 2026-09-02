import type { PrismaClient } from '../generated/prisma/client.js'

export const developmentSeedIds = {
  student: '00000000-0000-4000-8000-000000000001',
  counselor: '00000000-0000-4000-8000-000000000002',
  admin: '00000000-0000-4000-8000-000000000003',
} as const

export const developmentSeedPassword = 'konkourix-dev-password'

// Fixed, development-only scrypt hash for developmentSeedPassword.
const developmentPasswordHash =
  'scrypt$v1$N=32768,r=8,p=1$AAAAAAAAAAAAAAAAAAAAAA$TsiLnITN7T_tOuW2SY4rqSgR5O4wW4rol95NxQ2v4rP9smUT-J1POirUagvSGWxzQ20j1v9YkFyEMBDDYSFOeA'

export const seedDomainData = async (prisma: PrismaClient): Promise<void> => {
  const environment = process.env.NODE_ENV ?? 'development'
  if (environment === 'production') {
    throw new Error('Development seed data cannot run in production')
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.user.upsert({
      create: {
        id: developmentSeedIds.student,
        email: 'student.seed@konkourix.local',
        passwordHash: developmentPasswordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
      },
      update: { role: 'STUDENT', status: 'ACTIVE' },
      where: { id: developmentSeedIds.student },
    })
    await transaction.user.upsert({
      create: {
        id: developmentSeedIds.counselor,
        email: 'counselor.seed@konkourix.local',
        passwordHash: developmentPasswordHash,
        role: 'COUNSELOR',
        status: 'ACTIVE',
      },
      update: { role: 'COUNSELOR', status: 'ACTIVE' },
      where: { id: developmentSeedIds.counselor },
    })
    await transaction.user.upsert({
      create: {
        id: developmentSeedIds.admin,
        email: 'admin.seed@konkourix.local',
        passwordHash: developmentPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      update: { role: 'ADMIN', status: 'ACTIVE' },
      where: { id: developmentSeedIds.admin },
    })

    await transaction.studentProfile.upsert({
      create: {
        userId: developmentSeedIds.student,
        educationLevel: 'secondary',
        schoolName: 'Konkourix Development Academy',
      },
      update: {
        educationLevel: 'secondary',
        schoolName: 'Konkourix Development Academy',
      },
      where: { userId: developmentSeedIds.student },
    })
    await transaction.counselorProfile.upsert({
      create: {
        userId: developmentSeedIds.counselor,
        bio: 'Deterministic development counselor',
        specialization: 'General guidance',
      },
      update: {
        bio: 'Deterministic development counselor',
        specialization: 'General guidance',
      },
      where: { userId: developmentSeedIds.counselor },
    })
    await transaction.studentCounselor.upsert({
      create: {
        studentId: developmentSeedIds.student,
        counselorId: developmentSeedIds.counselor,
        status: 'ACTIVE',
      },
      update: { status: 'ACTIVE', endedAt: null },
      where: {
        studentId_counselorId: {
          studentId: developmentSeedIds.student,
          counselorId: developmentSeedIds.counselor,
        },
      },
    })
  })
}
