import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export function startDb(): PrismaClient {
  prisma = new PrismaClient()
  prisma.$connect
  return prisma
}
