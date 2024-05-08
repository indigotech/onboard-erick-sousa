import { PrismaClient } from '@prisma/client'

export async function startDb() {
  const prisma = new PrismaClient()
  await prisma.$connect()
}
