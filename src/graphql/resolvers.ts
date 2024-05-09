import { prisma } from '../setup-db.js'
import { texts } from './schema.js'
import { CustomError } from './error-handler.js'
import bcrypt from 'bcrypt'

export const resolvers = {
  Query: {
    hello: () => texts,
  },
  Mutation: {
    createUser: async (_, args) => {
      const userInput = args.data

      if (!isPasswordValid(userInput.password)) {
        throw new CustomError(
          'Password must have at least six characters, with at least one digit and one letter',
          400
        )
      }

      const isEmailAlreadyRegistered = await checkEmailAvailability(
        userInput.email
      )

      if (isEmailAlreadyRegistered) {
        throw new CustomError(
          'Email is already registered',
          409,
          'There is another user already created with the provided e-mail adress'
        )
      }

      let passwordHash: string

      try {
        const salt = await bcrypt.genSalt(10)
        passwordHash = await bcrypt.hash(userInput.password, salt)
      } catch (error) {
        throw new CustomError('Could not hash password: ' + error.message, 500)
      }

      try {
        const user = await prisma.user.create({
          data: {
            name: userInput.name,
            email: userInput.email,
            password: passwordHash,
            birthDate: userInput.birthDate,
          },
        })
        const userInfo = {
          id: user.id,
          name: user.name,
          email: user.email,
          birthDate: user.birthDate,
        }
        return userInfo
      } catch (error) {
        throw new CustomError('Could not create user: ' + error.message, 500)
      }
    },
  },
}

function isPasswordValid(password: string): boolean {
  return (
    password.length >= 6 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password)
  )
}

async function checkEmailAvailability(email_input: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email_input,
    },
  })

  return !!user
}
