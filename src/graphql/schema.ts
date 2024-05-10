export const typeDefs = `#graphql

    type SimpleText {
      content: String!  # non-nullable 
    }

    type Query {
      hello: [SimpleText]
    }

    type Mutation  {
      createUser(data: UserInput!): User!
      login(data: LoginInput!): LoginResponse!
    }

    type LoginResponse {
      user: User!
      token: String!
    }
    
    input LoginInput {
      email: String!
      password: String!
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

export const texts = [
  {
    content: 'Hello world!',
  },
]
