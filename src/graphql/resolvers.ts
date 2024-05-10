import { prisma } from '../setup-db.js'
import { texts } from './schema.js'
import { CustomError } from './error-handler.js'
import bcrypt from 'bcrypt'
import { User } from '@prisma/client'

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

    login: async (_, args) => {
      const loginInput = args.data
      let searchedUser: User

      try {
        searchedUser = await prisma.user.findUnique({
          where: {
            email: loginInput.email,
          },
        })
      } catch (error) {
        throw new CustomError(
          'Could not find user: ' + error.message,
          error.extensions.code
        )
      }

      const passwordMatches: boolean = await bcrypt.compare(
        loginInput.password,
        searchedUser.password
      )

      if (!passwordMatches) {
        throw new CustomError('Password does not match', 401)
      } else {
        try {
          const userInfo = {
            id: searchedUser.id,
            name: searchedUser.name,
            email: searchedUser.email,
            birthDate: searchedUser.birthDate,
          }
          const token = ''
          const loginResponse = {
            user: userInfo,
            token: token,
          }

          return loginResponse
        } catch (error) {
          throw new CustomError(
            'Could not login: ' + error.message,
            error.extensions.code
          )
        }
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
