import axios from 'axios'
import { prisma } from '../src/setup-db'
import { describe, it } from 'mocha'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'
import { expect } from 'chai'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

describe('Multiple users query mutation tests', function () {
  beforeEach(async function () {
    await setupDatabase()
  })

  const usersQuery = gql`
    query users($data: UsersInput!) {
      users(data: $data) {
        userList {
          id
          name
          email
          birthDate
          addresses {
            cep
            city
            complement
            neighborhood
            state
            street
            streetNumber
          }
        }
        totalResults
        hasUsersBefore
        hasUsersAfter
      }
    }
  `

  afterEach(async function () {
    await prisma.address.deleteMany({})
    await prisma.user.deleteMany({})
  })

  it('Should fail due to lack of authentication', async function () {
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
    const userListWithoutPasswords = userList.data.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    const userListWithoutUserIdInAddresses = userListWithoutPasswords.map(
      (user) => {
        return {
          ...user,
          addresses: user.addresses.map(({ userId, ...adress }) => adress),
        }
      }
    )

    const expectedResponse = {
      userList: userListWithoutUserIdInAddresses,
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

    expect(response.data.data.users)
      .excludingEvery('id')
      .to.be.deep.eq(expectedResponse)
  })

  it('Should return the first page (users 1-3 from 10 users)', async function () {
    const userListWithoutPasswords = userList.data.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    const userListWithoutUserIdInAddresses = userListWithoutPasswords.map(
      (user) => {
        return {
          ...user,
          addresses: user.addresses.map(({ userId, ...adress }) => adress),
        }
      }
    )

    const expectedResponse = {
      userList: [
        userListWithoutUserIdInAddresses[0],
        userListWithoutUserIdInAddresses[1],
        userListWithoutUserIdInAddresses[2],
      ],
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

    expect(response.data.data.users)
      .excludingEvery('id')
      .to.be.deep.eq(expectedResponse)
  })

  it('Should return the second page (users 4-6 from 10 users)', async function () {
    const userListWithoutPasswords = userList.data.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    const userListWithoutUserIdInAddresses = userListWithoutPasswords.map(
      (user) => {
        return {
          ...user,
          addresses: user.addresses.map(({ userId, ...adress }) => adress),
        }
      }
    )

    const expectedResponse = {
      userList: [
        userListWithoutUserIdInAddresses[3],
        userListWithoutUserIdInAddresses[4],
        userListWithoutUserIdInAddresses[5],
      ],
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

    expect(response.data.data.users)
      .excludingEvery('id')
      .to.be.deep.eq(expectedResponse)
  })

  it('Should return the third page (users 7-9 from 10 users)', async function () {
    const userListWithoutPasswords = userList.data.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    const userListWithoutUserIdInAddresses = userListWithoutPasswords.map(
      (user) => {
        return {
          ...user,
          addresses: user.addresses.map(({ userId, ...adress }) => adress),
        }
      }
    )

    const expectedResponse = {
      userList: [
        userListWithoutUserIdInAddresses[6],
        userListWithoutUserIdInAddresses[7],
        userListWithoutUserIdInAddresses[8],
      ],
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

    expect(response.data.data.users)
      .excludingEvery('id')
      .to.be.deep.eq(expectedResponse)
  })

  it('Should return the fourth page (only 10th user from 10 users)', async function () {
    const userListWithoutPasswords = userList.data.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    const userListWithoutUserIdInAddresses = userListWithoutPasswords.map(
      (user) => {
        return {
          ...user,
          addresses: user.addresses.map(({ userId, ...adress }) => adress),
        }
      }
    )

    const expectedResponse = {
      userList: [userListWithoutUserIdInAddresses[9]],
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

    expect(response.data.data.users)
      .excludingEvery('id')
      .to.be.deep.eq(expectedResponse)
  })

  it('Should return an empty page', async function () {
    const expectedResponse = {
      userList: [],
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
            skippedUsers: 10,
          },
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )

    expect(response.data.data.users)
      .excludingEvery('id')
      .to.be.deep.eq(expectedResponse)
  })

  it('Should fail due to negative skip', async function () {
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

  it('Should fail due to less the one users per page request', async function () {
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
            usersPerPage: 0,
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

  let userList = {
    data: [],
  }
  let addressList = []

  async function setupDatabase() {
    let password: string

    const alphabeticNameList = [
      'Adler Alves',
      'Bernardete Barros',
      'Claudia Leite',
      'Daniel Junior',
      'Erick Sousa',
      'Felipe Gabriel',
      'Gabriel Felipe',
      'Heitor Nunes',
      'Italo John',
      'Joao da Silva',
    ]
  
    for (let i = 0; i < 10; i++) {
      password = `taki_senha${i}`
      const salt = await bcrypt.genSalt(2)
      const passwordHash = await bcrypt.hash(password, salt)
  
      userList.data[i] = {
        name: alphabeticNameList[i],
        email: `${alphabeticNameList[i]}@gmail.com`,
        birthDate: `0${i}-0${i}-1980`,
        password: passwordHash,
      }
    }
  
    const reversedList = {
      data: [...userList.data].reverse(),
    }
  
    await prisma.user.createMany(reversedList)
  
    const foundUsers = await prisma.user.findMany()
  
    for (let i = 0; i < 10; i++) {
      addressList[i] = {
        cep: '12345678',
        street: `Street ${i}`,
        streetNumber: i,
        complement: null,
        neighborhood: `Neighborhood ${i}`,
        city: `City ${i}`,
        state: `State ${i}`,
        userId: foundUsers[9 - i].id,
      }
  
      userList.data[i] = {
        ...userList.data[i],
        addresses: [addressList[i]],
      }
    }
  
    await prisma.address.createMany({
      data: addressList,
    })
  }
})
