import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const typeDefs = `#graphql

  type SimpleText {
    content: String!  # non-nullable 
  }

  type Query {
    hello: [SimpleText]
  }

  type Mutation  {
    createUser(data: UserInput!): User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    birthDate: String
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    birthDate: String 
  }
`

const texts = [
  {
    content: 'Hello world!',
  },
]

const resolvers = {
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

      let passwordHash: string

      try {
        const salt = await bcrypt.genSalt(10)
        passwordHash = await bcrypt.hash(userInput.password, salt)
      } catch (error) {
        throw new Error('Hash error: ' + error.message)
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
        throw new Error('Erro ao criar usuário: ' + error.message)
      }
    },
  },
}

// Creating the ApolloServer is similar to express funtion createHandler
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
})

function isPasswordValid(password: string): boolean {
  return (
    password.length >= 6 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password)
  )
}

console.log(`🚀  Access server at: ${url}`)
