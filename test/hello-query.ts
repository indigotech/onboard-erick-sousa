import axios from 'axios'
import setup from '../src/setup'
import { stopServer } from '../src/setup-server'
import { prisma } from '../src/setup-db'
import { describe, it, before, after } from 'mocha'
import { expect } from 'chai'
import bcrypt from 'bcrypt'

describe('Server/database setup and GraphQL test', function () {
  before(async function () {
    await setup()
  })

  after(async function () {
    await prisma.user.deleteMany({})
    await stopServer()
  })

  it('Should return "Hello world!"', async function () {
    const response = await axios.post('http://localhost:4000', {
      query: `
        query {
          hello {
            content
          }
        }
      `,
    })
    const content = response.data.data.hello[0].content
    expect(content).to.be.equal('Hello world!')
  })

  const test_input = {
    data: {
      name: 'test_name',
      email: 'test_email1',
      password: 'test_password1',
      birthDate: '01-01-1900',
    },
  }

  it('Should create a new user', async function () {
    const response = await axios.post('http://localhost:4000', {
      query: `
        mutation CreateUser($data: UserInput!) {
          createUser(data: $data) {
            birthDate
            email
            id
            name
          }
        }
      `,
      variables: {
        data: {
          name: test_input.data.name,
          email: test_input.data.email,
          password: test_input.data.password,
          birthDate: test_input.data.birthDate,
        },
      },
    })

    const user = await prisma.user.findUnique({
      where: {
        email: test_input.data.email,
      },
    })

    expect(response.data.data.createUser).to.be.deep.eq({
      name: test_input.data.name,
      email: test_input.data.email,
      birthDate: test_input.data.birthDate,
      id: String(user.id),
    })

    const { password, ...userFields } = user

    expect(userFields).to.be.deep.eq({
      name: test_input.data.name,
      email: test_input.data.email,
      birthDate: test_input.data.birthDate,
      id: parseInt(response.data.data.createUser.id),
    })

    const passwordMatches = await bcrypt.compare(
      test_input.data.password,
      user.password
    )

    expect(passwordMatches).to.be.eq(true)
  })
})
