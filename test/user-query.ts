import axios from 'axios'
import { prisma } from '../src/setup-db'
import { describe, it } from 'mocha'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'
import { expect, use } from 'chai'
import jwt from 'jsonwebtoken'
import { create } from 'domain'
import chaiExclude from 'chai-exclude'

describe('user query mutation tests', function () {
  use(chaiExclude)

  const addresses = [
    {
      cep: '12345678',
      street: 'Street 1',
      streetNumber: 1,
      complement: null,
      neighborhood: 'Neighborhood 1',
      city: 'City 1',
      state: 'State 1',
    },
    {
      cep: '87654321',
      street: 'Street 2',
      streetNumber: 2,
      complement: null,
      neighborhood: 'Neighborhood 2',
      city: 'City 2',
      state: 'State 2',
    },
  ]

  const correctUserInfo = {
    data: {
      name: 'test_name',
      email: 'test_emai1@gmail.com',
      password: 'test_password1',
      birthDate: '01-01-1900',
      addresses: {
        create: addresses[0],
      },
    },
  }

  const authenticatedUserInfo = {
    data: {
      name: 'authenticated',
      email: 'authenticated@gmail.com',
      password: 'test_password1',
      birthDate: '01-01-1900',
      addresses: {
        create: addresses[1],
      },
    },
  }

  const userQuery = gql`
    query user($id: ID!) {
      user(id: $id) {
        id
        name
        email
        birthDate
        addresses {
          cep
          street
          streetNumber
          complement
          neighborhood
          city
          state
        }
      }
    }
  `

  afterEach(async function () {
    await prisma.address.deleteMany({})
    await prisma.user.deleteMany({})
  })

  it('Should return the authenticated user himself', async function () {
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
          id: payload.id,
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
      addresses: [addresses[1]],
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
          id: searchedUser.id,
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
      addresses: [addresses[0]],
    }

    expect(response.data.data.user).to.be.deep.eq(expectedResponse)
  })

  it('Should fail due to wrong id input', async function () {
    const payload = {
      id: 10000,
      email: 'payload_email@gmail.com',
    }
    const wrongId = payload.id + 1

    const token = jwt.sign(payload, process.env.SIGNING_KEY)

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(userQuery),
        variables: {
          id: wrongId,
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

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(userQuery),
        variables: {
          id: 1,
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
    const payload = {
      id: 10000,
      email: 'payload_email@gmail.com',
    }

    const response = await axios.post('http://localhost:4000', {
      query: print(userQuery),
      variables: {
        id: payload.id,
      },
    })

    expect(response.data.errors[0].message).to.be.eq('Usuário não autenticado')
    expect(response.data.data).to.be.null
  })
})
