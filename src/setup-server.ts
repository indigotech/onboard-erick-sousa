import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { typeDefs } from './graphql/schema.js'
import { resolvers } from './graphql/resolvers.js'
import { formatError } from './graphql/error-handler.js'

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError,
})

export async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  })

  console.log(`🚀  Access server at: ${url}`)
}

export async function stopServer() {
  await server.stop()
}
