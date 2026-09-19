import { createPrismaCurriculumStore } from '../curriculum/prisma-store.js'
import { prisma } from '../lib/prisma.js'

const [operatorAdminUserId, permissionAdminUserId, ...reasonParts] = process.argv.slice(2)
const reason = reasonParts.join(' ').trim()

if (!operatorAdminUserId || !permissionAdminUserId || !reason) {
  throw new Error('Usage: curriculum:bootstrap-permissions <operator-admin-user-id> <permission-admin-user-id> <reason>')
}

try {
  const result = await createPrismaCurriculumStore(prisma)
    .bootstrapPermissionAdministrator(operatorAdminUserId, permissionAdminUserId, reason)

  if (!result.ok) throw new Error(`Curriculum permission bootstrap refused: ${result.reason}`)
  process.stdout.write(`Curriculum permission administrator grant created: ${result.value.id}\n`)
} finally {
  await prisma.$disconnect()
}
