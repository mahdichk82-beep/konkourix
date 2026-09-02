type ClosableApp = {
  close: () => Promise<unknown>
}

type DisconnectablePrisma = {
  $disconnect: () => Promise<unknown>
}

export const closeResources = async (
  app: ClosableApp,
  prisma: DisconnectablePrisma,
): Promise<void> => {
  await app.close()
  await prisma.$disconnect()
}
