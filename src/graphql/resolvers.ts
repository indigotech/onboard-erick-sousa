import { prisma } from '../setup-db.js'
import { texts } from './schema.js'
import { CustomError } from './error-handler.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const shortExpirationTime = 1000 * 60 * 60 * 12 // 12 hours
export const longExpirationTime = 1000 * 60 * 60 * 24 * 7 // 7 days

export const resolvers = {
  Query: {
    hello: () => texts,
    user: async (_, args, contextValue) => {
      const token = contextValue.token
      if (!token || !isTokenValid(token)) {
        throw new CustomError('Usuário não autenticado', 400)
      }
      const idInput = args.id
      const user = await findUserById(idInput)

      if (!user) {
        throw new CustomError(
          'Usuário não encontrado',
          400,
          `There is no user registered with the given id`
        )
      }

      return user
    },
  },
  Mutation: {
    createUser: async (_, args, contextValue) => {
      const token = contextValue.token
      if (!token || !isTokenValid(token)) {
        throw new CustomError('Usuário não autenticado', 400)
      }
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
        try {
          const userInfo = {
            id: searchedUser.id,
            name: searchedUser.name,
            email: searchedUser.email,
            birthDate: searchedUser.birthDate,
          }

          const payload = {
            id: userInfo.id,
            email: userInfo.email,
          }

          const expirationTime: number = loginInput.rememberMe
            ? longExpirationTime
            : shortExpirationTime

          const signingKey = process.env.SIGNING_KEY
          const token = jwt.sign(payload, signingKey, {
            expiresIn: expirationTime,
          })

          const loginResponse = {
            user: userInfo,
            token: token,
          }

          return loginResponse
        } catch (error) {
          throw new CustomError(
            'Não foi possível realizar o login',
            500,
            `jwt sign message: ${error.message}`
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

async function checkPasswordMatch(passwordInput: string, userPassword: string) {
  const passwordMatches: boolean = await bcrypt.compare(
    passwordInput,
    userPassword
  )
  return passwordMatches
}

function isTokenValid(tokenInput: string) {
  const tokenVerification = jwt.verify(tokenInput, process.env.SIGNING_KEY)
  return !!tokenVerification
}

async function checkEmailAvailability(email_input: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email_input,
    },
  })

  return !!user
}

async function findUserById(idInput) {
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(idInput),
    },
  })

  return user
}
