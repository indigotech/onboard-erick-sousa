import { prisma } from '../setup-db.js'
import { texts } from './schema.js'
import bcrypt from 'bcrypt'

export let isEmailValid

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

      await validateEmail(userInput.email)

      console.log('\n \n EMAIL EH VALIDO? ' + isEmailValid + '\n \n')
      if (!isEmailValid) {
        throw new Error('There is already a user with the given email')
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

async function validateEmail(email_input: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email_input,
    },
  })

  if (user) {
    isEmailValid = false
  } else {
    isEmailValid = true
  }
}
