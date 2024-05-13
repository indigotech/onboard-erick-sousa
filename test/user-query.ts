import axios from 'axios'
import { prisma } from '../src/setup-db'
import { describe, it } from 'mocha'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'
import { expect } from 'chai'
import jwt from 'jsonwebtoken'

describe('user query mutation tests', function () {
  const correctUserInfo = {
    data: {
      name: 'test_name',
      email: 'test_emai1@gmail.com',
      password: 'test_password1',
      birthDate: '01-01-1900',
    },
  }

  const authenticatedUserInfo = {
    data: {
      name: 'authenticated',
      email: 'authenticated@gmail.com',
      password: 'test_password1',
      birthDate: '01-01-1900',
    },
  }

  const userQuery = gql`
    query user($data: ID!) {
      user(data: $data) {
        id
        name
        email
        birthDate
      }
    }
  `

  afterEach(async function () {
    await prisma.user.deleteMany({})
  })

  it('Should return the authenticated user', async function () {
    const authenticatedUser = await prisma.user.create(authenticatedUserInfo)

    const payload = {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
    }

    const token = jwt.sign(payload, process.env.SIGNING_KEY)

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(userQuery),
        variables: {
          data: authenticatedUser.id,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )

    const expectedResponse = {
      id: String(authenticatedUser.id),
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      birthDate: authenticatedUser.birthDate,
    }

    expect(response.data.data.user).to.be.deep.eq(expectedResponse)
  })

  it('Should return a user wich is not the one doing the query request', async function () {
    const authenticatedUser = await prisma.user.create(authenticatedUserInfo)

    const searchedUser = await prisma.user.create(correctUserInfo)

    const payload = {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
    }

    const token = jwt.sign(payload, process.env.SIGNING_KEY)

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(userQuery),
        variables: {
          data: searchedUser.id,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )

    const expectedResponse = {
      id: String(searchedUser.id),
      name: searchedUser.name,
      email: searchedUser.email,
      birthDate: searchedUser.birthDate,
    }

    expect(response.data.data.user).to.be.deep.eq(expectedResponse)
  })

  it('Should fail due to wrong id input', async function () {
    const authenticatedUser = await prisma.user.create(authenticatedUserInfo)

    const wrongId = authenticatedUser.id + 1

    const payload = {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
    }

    const token = jwt.sign(payload, process.env.SIGNING_KEY)

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(userQuery),
        variables: {
          data: wrongId,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )

    expect(response.data.errors[0].message).to.be.eq('Usuário não encontrado')
    expect(response.data.data).to.be.null
  })

  it('Should fail due to invalid token', async function () {
    const invalidToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    const authenticatedUser = await prisma.user.create(authenticatedUserInfo)

    const wrongId = authenticatedUser.id + 1

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(userQuery),
        variables: {
          data: wrongId,
        },
      },
      {
        headers: {
          Authorization: invalidToken,
        },
      }
    )

    expect(response.data.errors[0].message).to.be.eq('invalid signature')
    expect(response.data.data).to.be.null
  })

  it('Should fail due to lack of authentication', async function () {
    const notAuthenticatedUser = await prisma.user.create({
      data: {
        name: 'authenticated',
        email: 'authenticated@gmail.com',
        password: 'test_password1',
        birthDate: '01-01-1900',
      },
    })

    const response = await axios.post('http://localhost:4000', {
      query: print(userQuery),
      variables: {
        data: notAuthenticatedUser.id,
      },
    })

    expect(response.data.errors[0].message).to.be.eq('Usuário não autenticado')
    expect(response.data.data).to.be.null
  })
})
