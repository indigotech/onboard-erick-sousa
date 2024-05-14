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
          'A senha fornecida não atende aos requisitos mínimos',
          400,
          'Password must have at least six characters, with at least one digit and one letter'
        )
      }

      const isEmailAlreadyRegistered = await checkEmailAvailability(
        userInput.email
      )

      if (isEmailAlreadyRegistered) {
        throw new CustomError(
          'Email já cadastrado',
          409,
          'There is another user already created with the provided e-mail adress'
        )
      }

      let passwordHash: string

      try {
        const salt = await bcrypt.genSalt(10)
        passwordHash = await bcrypt.hash(userInput.password, salt)
      } catch (error) {
        throw new CustomError(
          'Ocorreu um erro no cadastro',
          500,
          `bcrypt message: ${error.message}`
        )
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
        throw new CustomError(
          'Ocorreu um erro no cadastro',
          500,
          `prisma message: ${error.message}`
        )
      }
    },

    login: async (_, args) => {
      const loginInput = args.data
      const searchedUser = await prisma.user.findUnique({
        where: {
          email: loginInput.email,
        },
      })

      if (!searchedUser) {
        throw new CustomError(
          'Usuário não encontrado',
          400,
          `There is no user registered with the given email adress`
        )
      }

      const passwordMatches = await checkPasswordMatch(
        loginInput.password,
        searchedUser.password
      )

      if (!passwordMatches) {
        throw new CustomError('Senha inválida', 401)
      } else {
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
      }
    },
  },
}

function isPasswordValid(password: string): boolean {
  return (
    password.length >= 6 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password)
  )
}

async function checkPasswordMatch(passwordInput: string, userPassword: string) {
  const passwordMatches: boolean = await bcrypt.compare(
    passwordInput,
    userPassword
  )
  return passwordMatches
}

async function checkEmailAvailability(email_input: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email_input,
    },
  })

  return !!user
}
