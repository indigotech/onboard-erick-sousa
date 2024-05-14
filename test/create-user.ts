import axios from 'axios'
import { prisma } from '../src/setup-db'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'
import bcrypt from 'bcrypt'

describe('createUser mutation tests', function () {
  const correctUserInfo = {
    data: {
      name: 'test_name',
      email: 'test_emai1',
      password: 'test_password1',
      birthDate: '01-01-1900',
    },
  }

  const createUserMutation = gql`
    mutation CreateUser($data: UserInput!) {
      createUser(data: $data) {
        birthDate
        email
        id
        name
      }
    }
  `

  afterEach(async function () {
    await prisma.user.deleteMany({})
  })

  it('Should create a new user', async function () {
    const response = await axios.post('http://localhost:4000', {
      query: print(createUserMutation),
      variables: {
        data: correctUserInfo.data,
      },
    })

    const user = await prisma.user.findUnique({
      where: {
        email: correctUserInfo.data.email,
      },
    })

    expect(response.data.data.createUser).to.be.deep.eq({
      name: correctUserInfo.data.name,
      email: correctUserInfo.data.email,
      birthDate: correctUserInfo.data.birthDate,
      id: String(user.id),
    })

    const { password, ...userFields } = user

    expect(userFields).to.be.deep.eq({
      name: correctUserInfo.data.name,
      email: correctUserInfo.data.email,
      birthDate: correctUserInfo.data.birthDate,
      id: parseInt(response.data.data.createUser.id),
    })

    const passwordMatches = await bcrypt.compare(
      correctUserInfo.data.password,
      user.password
    )

    expect(passwordMatches).to.be.eq(true)
  })

  it('Should not create the user due to not unique e-mail', async function () {
    await prisma.user.create(correctUserInfo)

    const response = await axios.post('http://localhost:4000', {
      query: print(createUserMutation),
      variables: {
        data: correctUserInfo.data,
      },
    })

    expect(response.data.data).to.be.null
    expect(response.data.errors).to.be.an('array').that.is.not.empty
    expect(response.data.errors[0].message).to.be.deep.eq('Email já cadastrado')
  })

  it('Should not create the user due to not valid password', async function () {
    const wrongUserPasswordInfo = {
      data: {
        name: 'test_name',
        email: 'test_email2',
        password: 'test_password',
        birthDate: '01-01-1900',
      },
    }

    const response = await axios.post('http://localhost:4000', {
      query: print(createUserMutation),
      variables: {
        data: wrongUserPasswordInfo.data,
      },
    })

    expect(response.data.data).to.be.null
  })
})
