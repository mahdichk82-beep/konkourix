import type { PrismaClient } from '../generated/prisma/client.js'

export const developmentSeedIds = {
  student: '00000000-0000-4000-8000-000000000001',
  counselor: '00000000-0000-4000-8000-000000000002',
  admin: '00000000-0000-4000-8000-000000000003',
  mathSubject: '00000000-0000-4000-8000-000000000011',
  scienceSubject: '00000000-0000-4000-8000-000000000012',
  studyPlan: '00000000-0000-4000-8000-000000000021',
  mathTask: '00000000-0000-4000-8000-000000000031',
  scienceTask: '00000000-0000-4000-8000-000000000032',
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

    const studentProfile = await transaction.studentProfile.upsert({
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

    await transaction.studySubject.upsert({
      create: {
        id: developmentSeedIds.mathSubject,
        studentProfileId: studentProfile.id,
        name: 'Mathematics',
        normalizedName: 'mathematics',
      },
      update: {
        studentProfileId: studentProfile.id,
        name: 'Mathematics',
        normalizedName: 'mathematics',
        archivedAt: null,
      },
      where: { id: developmentSeedIds.mathSubject },
    })
    await transaction.studySubject.upsert({
      create: {
        id: developmentSeedIds.scienceSubject,
        studentProfileId: studentProfile.id,
        name: 'Physics',
        normalizedName: 'physics',
      },
      update: {
        studentProfileId: studentProfile.id,
        name: 'Physics',
        normalizedName: 'physics',
        archivedAt: null,
      },
      where: { id: developmentSeedIds.scienceSubject },
    })
    await transaction.studyPlan.upsert({
      create: {
        id: developmentSeedIds.studyPlan,
        studentProfileId: studentProfile.id,
        title: 'Development exam preparation',
        description: 'Deterministic development study plan',
        status: 'ACTIVE',
        startsOn: new Date('2026-09-01T00:00:00.000Z'),
        endsOn: new Date('2026-09-30T00:00:00.000Z'),
      },
      update: {
        studentProfileId: studentProfile.id,
        title: 'Development exam preparation',
        description: 'Deterministic development study plan',
        status: 'ACTIVE',
        startsOn: new Date('2026-09-01T00:00:00.000Z'),
        endsOn: new Date('2026-09-30T00:00:00.000Z'),
      },
      where: { id: developmentSeedIds.studyPlan },
    })
    await transaction.dailyTask.upsert({
      create: {
        id: developmentSeedIds.mathTask,
        studentProfileId: studentProfile.id,
        studyPlanId: developmentSeedIds.studyPlan,
        subjectId: developmentSeedIds.mathSubject,
        title: 'Review algebra fundamentals',
        description: 'Deterministic mathematics task',
        scheduledFor: new Date('2026-09-03T00:00:00.000Z'),
        estimatedMinutes: 45,
        status: 'PENDING',
      },
      update: {
        studentProfileId: studentProfile.id,
        studyPlanId: developmentSeedIds.studyPlan,
        subjectId: developmentSeedIds.mathSubject,
        title: 'Review algebra fundamentals',
        description: 'Deterministic mathematics task',
        scheduledFor: new Date('2026-09-03T00:00:00.000Z'),
        estimatedMinutes: 45,
        status: 'PENDING',
        completedAt: null,
      },
      where: { id: developmentSeedIds.mathTask },
    })
    await transaction.dailyTask.upsert({
      create: {
        id: developmentSeedIds.scienceTask,
        studentProfileId: studentProfile.id,
        studyPlanId: developmentSeedIds.studyPlan,
        subjectId: developmentSeedIds.scienceSubject,
        title: 'Read motion chapter',
        description: 'Deterministic physics task',
        scheduledFor: new Date('2026-09-04T00:00:00.000Z'),
        estimatedMinutes: 30,
        status: 'PENDING',
      },
      update: {
        studentProfileId: studentProfile.id,
        studyPlanId: developmentSeedIds.studyPlan,
        subjectId: developmentSeedIds.scienceSubject,
        title: 'Read motion chapter',
        description: 'Deterministic physics task',
        scheduledFor: new Date('2026-09-04T00:00:00.000Z'),
        estimatedMinutes: 30,
        status: 'PENDING',
        completedAt: null,
      },
      where: { id: developmentSeedIds.scienceTask },
    })
  })
}
