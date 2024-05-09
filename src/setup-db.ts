import { PrismaClient } from '@prisma/client'

export let prisma: PrismaClient

export async function startDb() {
  console.log('URL DA DATABASE: ' + process.env.DATABASE_URL)
  prisma = new PrismaClient()
  await prisma.$connect()
}
