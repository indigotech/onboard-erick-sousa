import { prisma } from '../setup-db'
import { texts } from './schema'
import bcrypt from 'bcrypt'

export const resolvers = {
  Query: {
    hello: () => texts,
  },
  Mutation: {
    createUser: async (_, args) => {
      const userInput = args.data

      if (!isPasswordValid(userInput.password)) {
        throw new Error(
          'Password must have at least six characters, with at least one digit and one letter'
        )
      }

      const passwordHash = await bcrypt
        .genSalt(10)
        .then((salt) => {
          return bcrypt.hash(userInput.password, salt)
        })
        .catch((error) => {
          throw new Error('Hash error: ' + error.message)
        })

      return prisma.user
        .create({
          data: {
            name: userInput.name,
            email: userInput.email,
            password: passwordHash,
            birthDate: userInput.birthDate,
          },
        })
        .then((user) => {
          const userInfo = {
            id: user.id,
            name: user.name,
            email: user.email,
            birthDate: user.birthDate,
          }
          return userInfo
        })
        .catch((error) => {
          throw new Error('Erro ao criar usuário: ' + error.message)
        })
    },
  },
}

function isPasswordValid(password: string): boolean {
  return (
    password.length >= 6 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password)
  )
}
