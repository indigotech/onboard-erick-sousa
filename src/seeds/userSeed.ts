import { faker } from '@faker-js/faker'
import setup from '../setup.js'
import { prisma } from '../setup-db.js'
import { stopServer } from '../setup-server.js'
import bcrypt from 'bcrypt'
import { CustomError } from '../graphql/error-handler.js'

await setup()

await generateUniqueUsers(75)

await stopServer()

async function generateUniqueUsers(count: number) {
  const users = []

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const fullName = firstName + lastName
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(faker.internet.password(), salt)
    const formattedDate = formatDate(
      faker.date.birthdate({
        min: 18,
        max: 65,
        mode: 'age',
      })
    )

    const user = {
      name: fullName,
      email: faker.internet.email({ firstName, lastName }),
      birthDate: formattedDate,
      password: passwordHash,
    }
    users.push(user)
  }

  const createdUsers = await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  })

  if (!createdUsers) {
    throw new CustomError('Ocorreu um erro na criação dos usuários', 500)
  }

  return users
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}
