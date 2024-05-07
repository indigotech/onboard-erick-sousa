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
    name: String
    email: String
    password: String
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
      const user_input = args.data
      const user_info = {
        id: randomInt(20),
        name: user_input.name,
        email: user_input.email,
        birthDate: user_input.birthDate,
      }
      return user_info
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
