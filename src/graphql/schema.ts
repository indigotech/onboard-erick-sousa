export const typeDefs = `#graphql

    type SimpleText {
      content: String!  # non-nullable 
    }

    type Query {
      hello: [SimpleText]
      user(id: ID!): User!
      users(data: UsersInput!): UsersResponse!
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
      rememberMe: Boolean!
    }

    type User {
      id: ID!
      name: String!
      email: String!
      birthDate: String
      addresses: [Address!]!
    }

    type Address {
      id: ID!     
      cep: String!
      street: String!
      streetNumber: Int!
      complement: String
      neighborhood: String!
      city: String!
      state: String!
      userId: Int!
      user: User!    
    }

    input UserInput {
      name: String!
      email: String!
      password: String!
      birthDate: String 
    }

    input UsersInput {
      usersPerPage: Int = 10 
      skippedUsers: Int = 0
    }

    type UsersResponse {
      userList: [User!]!
      totalResults: Int!
      hasUsersBefore: Boolean!
      hasUsersAfter: Boolean!
    }
  `

export const texts = [
  {
    content: 'Hello world!',
  },
]
