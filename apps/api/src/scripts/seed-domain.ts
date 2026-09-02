import { seedDomainData } from '../seed/domain-seed.js'
import { prisma } from '../lib/prisma.js'

try {
  await seedDomainData(prisma)
  console.log('Development domain seed completed')
} finally {
  await prisma.$disconnect()
}
