import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { randomInt } from 'crypto'

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
    createUser: async ( _, args) => {
      const userInput = args.data
      const userInfo = {
        id: randomInt(20),
        name: userInput.name,
        email: userInput.email,
        birthDate: userInput.birthDate,
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
