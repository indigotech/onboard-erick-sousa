import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql

  type SimpleText {
    content: String!  # non-nullable 
  }

  type Query {
    hello: [SimpleText]
  }
`;

const Texts = [
    {
        content: 'Hello world!'
    },
];

const resolvers = {
    Query: {
      hello: () => Texts,
    },
};

// Creating the ApolloServer is similar to express funtion createHandler
const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  
  console.log(`🚀  Access server at: ${url}`);
  