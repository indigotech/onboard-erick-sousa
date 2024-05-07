import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { PrismaClient } from '@prisma/client'

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

      const user = await prisma.user.create({
        data: {
          name: userInput.name,
          email: userInput.email,
          password: userInput.password,
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

console.log(`🚀  Access server at: ${url}`)
