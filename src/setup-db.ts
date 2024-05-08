import { PrismaClient } from '@prisma/client'

export let prisma: PrismaClient

export async function startDb() {
  prisma = new PrismaClient()
  await prisma.$connect()
}
