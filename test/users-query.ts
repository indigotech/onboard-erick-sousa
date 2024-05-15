import axios from 'axios'
import { prisma } from '../src/setup-db'
import { describe, it } from 'mocha'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'
import { expect } from 'chai'
import jwt from 'jsonwebtoken'
import { faker } from '@faker-js/faker'

describe('Multiple users query mutation tests', function () {
  const userList = {
    data: [
      {
        name: 'Adler Alves',
        email: 'Tommie.Medhurst@gmail.com',
        birthDate: '16-11-1962',
        password:
          '$2b$10$5ss0lvGtJIAzKT2ipK35ueAiYBN1Kccd3YJSVgx2WKhWkDM4Udm3e',
      },
      {
        name: 'Bernardete Barros',
        email: 'Princess.Kiehn52@gmail.com',
        birthDate: '04-11-1959',
        password:
          '$2b$10$DOCXYkeO0QJoOV6mVl94F.CSPla8gMSDXLIIDVKcmptP5MvMslYMG',
      },
      {
        name: 'Claudia Leite',
        email: 'Daren.Roob0@yahoo.com',
        birthDate: '01-12-1997',
        password:
          '$2b$10$aCBOjaCD2aU8GXIs9Ivia.NWz3iKdXnwO0kXEUCNhQwuyVq9ViX/2',
      },
      {
        name: 'Daniel Almeida',
        email: 'Jeremie.Bernhard@hotmail.com',
        birthDate: '28-08-1976',
        password:
          '$2b$10$jWb2pfXapMReEI6cqYqVqORg0R9s7H7TNS7iC.W.mz47kt7nbV3Xi',
      },
      {
        name: 'Erick Sousa',
        email: 'Shyann.Davis20@yahoo.com',
        birthDate: '12-03-1961',
        password:
          '$2b$10$li3MOizIuHQ0gEDF3glM..M2pScu0u2AUntgrynpyg39IR1a.ELHO',
      },
      {
        name: 'Felipe Kalume',
        email: 'Sedrick.Halvorson19@yahoo.com',
        birthDate: '22-06-1991',
        password:
          '$2b$10$mFRG4CdITKnnij3u/ldlseAC644ENbrdUj.QwKLXO5UTPKkusjMUm',
      },
      {
        name: 'Gabriel Engler',
        email: 'Obie_Terry85@hotmail.com',
        birthDate: '04-07-1967',
        password:
          '$2b$10$4MUrEPoD.lblZjDWTn8V7.cRZaRyQD6G1HzGqo1Zq74dsJeYp3ofW',
      },
      {
        name: 'Heitor Mascarenhas',
        email: 'Wyman_Auer@yahoo.com',
        birthDate: '09-01-1990',
        password:
          '$2b$10$kbg91w4/b0PIumY8xL/tpORHmCQFpfUm7i./Rsb7slUmavDTl.SEa',
      },
      {
        name: 'Italo John',
        email: 'Kelsi_Lowe@hotmail.com',
        birthDate: '14-01-1995',
        password:
          '$2b$10$o7P4MzxFIsvwFAddGMxoyuNGOib1w2xCmVEd.Qu7ggxmU0cpGtXd.',
      },
      {
        name: 'Joao Almeida',
        email: 'Alvera.MacGyver1@gmail.com',
        birthDate: '15-04-2003',
        password:
          '$2b$10$.xwPoedPtimBYIadcMB0jeH4Hv8lBRWxq5ldWEluxcxwytP1BohJ2',
      },
    ],
  }

  const shuffledList = {
    data: faker.helpers.shuffle(userList.data),
  }

  const usersQuery = gql`
    query users($data: UsersInput!) {
      users(data: $data) {
        userList {
          id
          name
          email
          birthDate
        }
        totalResults
        hasUsersBefore
        hasUsersAfter
      }
    }
  `

  afterEach(async function () {
    await prisma.user.deleteMany({})
  })

  it('Should fail due to lack of authentication', async function () {
    await prisma.user.createMany(shuffledList)

    const response = await axios.post('http://localhost:4000', {
      query: print(usersQuery),
      variables: {
        data: {
          usersPerPage: 10,
          skippedUsers: 0,
        },
      },
    })

    expect(response.data.data).to.be.null
    expect(response.data.errors[0].message).to.be.eq('Usuário não autenticado')
  })

  it('Should return all users on alphabetical order', async function () {
    await prisma.user.createMany(shuffledList)

    const createdUsers = await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
      skip: 0,
      take: 10,
    })

    const expectedResponse = {
      userList: createdUsers.map((user) => {
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          birthDate: user.birthDate,
        }
      }),
      totalResults: 10,
      hasUsersBefore: false,
      hasUsersAfter: false,
    }

    const payload = {
      id: 10000,
      email: 'payload_email@gmail.com',
    }

    const token = jwt.sign(payload, process.env.SIGNING_KEY)

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(usersQuery),
        variables: {
          data: {
            usersPerPage: 10,
            skippedUsers: 0,
          },
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )

    expect(response.data.data.users).to.be.deep.eq(expectedResponse)
  })

  it('Should return the first page (users 1-3 from 10 users)', async function () {
    await prisma.user.createMany(shuffledList)

    const createdUsers = await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
      skip: 0,
      take: 3,
    })

    const expectedResponse = {
      userList: createdUsers.map((user) => {
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          birthDate: user.birthDate,
        }
      }),
      totalResults: 10,
      hasUsersBefore: false,
      hasUsersAfter: true,
    }

    const payload = {
      id: 10000,
      email: 'payload_email@gmail.com',
    }

    const token = jwt.sign(payload, process.env.SIGNING_KEY)

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(usersQuery),
        variables: {
          data: {
            usersPerPage: 3,
            skippedUsers: 0,
          },
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )

    expect(response.data.data.users).to.be.deep.eq(expectedResponse)
  })

  it('Should return the second page (users 4-6 from 10 users)', async function () {
    await prisma.user.createMany(shuffledList)

    const createdUsers = await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
      skip: 3,
      take: 3,
    })

    const expectedResponse = {
      userList: createdUsers.map((user) => {
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          birthDate: user.birthDate,
        }
      }),
      totalResults: 10,
      hasUsersBefore: true,
      hasUsersAfter: true,
    }

    const payload = {
      id: 10000,
      email: 'payload_email@gmail.com',
    }

    const token = jwt.sign(payload, process.env.SIGNING_KEY)

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(usersQuery),
        variables: {
          data: {
            usersPerPage: 3,
            skippedUsers: 3,
          },
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )

    expect(response.data.data.users).to.be.deep.eq(expectedResponse)
  })

  it('Should return the third page (users 7-9 from 10 users)', async function () {
    await prisma.user.createMany(shuffledList)

    const createdUsers = await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
      skip: 6,
      take: 3,
    })

    const expectedResponse = {
      userList: createdUsers.map((user) => {
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          birthDate: user.birthDate,
        }
      }),
      totalResults: 10,
      hasUsersBefore: true,
      hasUsersAfter: true,
    }

    const payload = {
      id: 10000,
      email: 'payload_email@gmail.com',
    }

    const token = jwt.sign(payload, process.env.SIGNING_KEY)

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(usersQuery),
        variables: {
          data: {
            usersPerPage: 3,
            skippedUsers: 6,
          },
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )

    expect(response.data.data.users).to.be.deep.eq(expectedResponse)
  })

  it('Should return the fourth page (only 10th user from 10 users)', async function () {
    await prisma.user.createMany(shuffledList)

    const createdUsers = await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
      skip: 9,
      take: 3,
    })

    const expectedResponse = {
      userList: createdUsers.map((user) => {
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          birthDate: user.birthDate,
        }
      }),
      totalResults: 10,
      hasUsersBefore: true,
      hasUsersAfter: false,
    }

    const payload = {
      id: 10000,
      email: 'payload_email@gmail.com',
    }

    const token = jwt.sign(payload, process.env.SIGNING_KEY)

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(usersQuery),
        variables: {
          data: {
            usersPerPage: 3,
            skippedUsers: 9,
          },
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )

    expect(response.data.data.users).to.be.deep.eq(expectedResponse)
  })

  it('Should fail due to negative skip', async function () {
    await prisma.user.createMany(shuffledList)

    const payload = {
      id: 10000,
      email: 'payload_email@gmail.com',
    }

    const token = jwt.sign(payload, process.env.SIGNING_KEY)

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(usersQuery),
        variables: {
          data: {
            usersPerPage: 10,
            skippedUsers: -1,
          },
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )

    expect(response.data.data).to.be.null
    expect(response.data.errors[0].message).to.be.eq('Solicitação inválida')
  })

  it('Should fail due to 0 users per page request', async function () {
    await prisma.user.createMany(shuffledList)

    const payload = {
      id: 10000,
      email: 'payload_email@gmail.com',
    }

    const token = jwt.sign(payload, process.env.SIGNING_KEY)

    const response = await axios.post(
      'http://localhost:4000',
      {
        query: print(usersQuery),
        variables: {
          data: {
            usersPerPage: -1,
            skippedUsers: 0,
          },
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    expect(response.data.data).to.be.null
    expect(response.data.errors[0].message).to.be.eq('Solicitação inválida')
  })
})
