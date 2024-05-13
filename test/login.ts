import axios from 'axios'
import { prisma } from '../src/setup-db'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'
import bcrypt from 'bcrypt'

describe('hello query tests', function () {
  afterEach(async function () {
    await prisma.user.deleteMany({})
  })

  const loginMutation = gql`
    mutation Login($data: LoginInput!) {
      login(data: $data) {
        user {
          birthDate
          email
          id
          name
        }
        token
      }
    }
  `

  it('Should return a user and a token as response', async function () {
    const createdUser = {
      data: {
        name: 'login_test',
        email: 'login_test',
        password: 'login_test_1',
        birthDate: '01-01-1900',
      },
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(createdUser.data.password, salt)

    const createUserResponse = await prisma.user.create({
      data: {
        name: createdUser.data.name,
        email: createdUser.data.email,
        password: passwordHash,
        birthDate: createdUser.data.birthDate,
      },
    })

    const loginInfo = {
      email: createdUser.data.email,
      password: createdUser.data.password,
    }

    const loginResponse = await axios.post('http://localhost:4000', {
      query: print(loginMutation),
      variables: {
        data: loginInfo,
      },
    })

    expect(loginResponse.data.data.login).to.deep.eq({
      user: {
        id: String(createUserResponse.id),
        name: createUserResponse.name,
        email: createUserResponse.email,
        birthDate: createUserResponse.birthDate,
      },
      token: '',
    })
  })

  it('Should fail due to nonexistent user', async function () {
    const createdUser = {
      data: {
        name: 'login_test',
        email: 'login_test',
        password: 'login_test_1',
        birthDate: '01-01-1900',
      },
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(createdUser.data.password, salt)

    await prisma.user.create({
      data: {
        name: createdUser.data.name,
        email: createdUser.data.email,
        password: passwordHash,
        birthDate: createdUser.data.birthDate,
      },
    })

    const loginInfo = {
      email: 'wrong_email@gmail.com',
      password: createdUser.data.password,
    }

    const loginResponse = await axios.post('http://localhost:4000', {
      query: print(loginMutation),
      variables: {
        data: loginInfo,
      },
    })

    console.log(loginResponse.data.errors[0].message)

    expect(loginResponse.data.errors).to.be.an('array').that.is.not.empty
    expect(loginResponse.data.errors[0].message).to.be.deep.eq(
      'Usuário não encontrado'
    )
  })

  it('Should fail due to wrong password user', async function () {
    const createdUser = {
      data: {
        name: 'login_test',
        email: 'login_test',
        password: 'login_test_1',
        birthDate: '01-01-1900',
      },
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(createdUser.data.password, salt)

    await prisma.user.create({
      data: {
        name: createdUser.data.name,
        email: createdUser.data.email,
        password: passwordHash,
        birthDate: createdUser.data.birthDate,
      },
    })

    const loginInfo = {
      email: createdUser.data.email,
      password: 'wrong_password',
    }

    const loginResponse = await axios.post('http://localhost:4000', {
      query: print(loginMutation),
      variables: {
        data: loginInfo,
      },
    })

    expect(loginResponse.data.errors).to.be.an('array').that.is.not.empty
    expect(loginResponse.data.errors[0].message).to.be.deep.eq('Senha inválida')
  })
})
