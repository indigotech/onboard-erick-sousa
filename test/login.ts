import axios from 'axios'
import { prisma } from '../src/setup-db'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'

describe('login mutation tests', function () {
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

  it('Should return a user and a  7 day token as response', async function () {
    const toBeCreatedUser = {
      data: {
        name: 'login_test',
        email: 'login_test',
        password: 'login_test_1',
        birthDate: '01-01-1900',
      },
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(toBeCreatedUser.data.password, salt)

    const createUserResponse = await prisma.user.create({
      data: {
        name: toBeCreatedUser.data.name,
        email: toBeCreatedUser.data.email,
        password: passwordHash,
        birthDate: toBeCreatedUser.data.birthDate,
      },
    })

    const loginInfo = {
      email: toBeCreatedUser.data.email,
      password: toBeCreatedUser.data.password,
      rememberMe: true,
    }

    const loginResponse = await axios.post('http://localhost:4000', {
      query: print(loginMutation),
      variables: {
        data: loginInfo,
      },
    })

    const decode = jwt.verify(
      loginResponse.data.data.login.token,
      process.env.SIGNING_KEY
    )

    expect(loginResponse.data.data.login.user).to.deep.eq({
      id: String(createUserResponse.id),
      name: createUserResponse.name,
      email: createUserResponse.email,
      birthDate: createUserResponse.birthDate,
    })

    expect(decode).to.deep.include({
      id: createUserResponse.id,
      email: createUserResponse.email,
    })

    expect((decode as JwtPayload).exp - (decode as JwtPayload).iat).to.be.equal(
      60 * 60 * 24 * 7
    )
  })

  it('Should return a user and a  1 minute token as response', async function () {
    const toBeCreatedUser = {
      data: {
        name: 'login_test',
        email: 'login_test',
        password: 'login_test_1',
        birthDate: '01-01-1900',
      },
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(toBeCreatedUser.data.password, salt)

    const createUserResponse = await prisma.user.create({
      data: {
        name: toBeCreatedUser.data.name,
        email: toBeCreatedUser.data.email,
        password: passwordHash,
        birthDate: toBeCreatedUser.data.birthDate,
      },
    })

    const loginInfo = {
      email: toBeCreatedUser.data.email,
      password: toBeCreatedUser.data.password,
      rememberMe: false,
    }

    const loginResponse = await axios.post('http://localhost:4000', {
      query: print(loginMutation),
      variables: {
        data: loginInfo,
      },
    })

    const decode = jwt.verify(
      loginResponse.data.data.login.token,
      process.env.SIGNING_KEY
    )

    expect(loginResponse.data.data.login.user).to.deep.eq({
      id: String(createUserResponse.id),
      name: createUserResponse.name,
      email: createUserResponse.email,
      birthDate: createUserResponse.birthDate,
    })

    expect(decode).to.deep.include({
      id: createUserResponse.id,
      email: createUserResponse.email,
    })

    expect((decode as JwtPayload).exp - (decode as JwtPayload).iat).to.be.equal(
      60
    )
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
