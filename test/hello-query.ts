import axios from 'axios'
import setup from '../src/setup'
import { stopServer } from '../src/setup-server'
import { prisma } from '../src/setup-db'
import { describe, it, before, after } from 'mocha'
import { expect } from 'chai'

describe('Server/database setup and GraphQL test\n', function () {
  let createdUserId

  before(async function () {
    await setup()
  })

  after(async function () {
    if (createdUserId) {
      await prisma.user.delete({
        where: {
          email: test_input.data.email,
        },
      })
    }
    await stopServer()
  })

  it('Should return "Hello world!"\n', async function () {
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

  it('should return a user as response', async function () {
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

    console.log(response.data)
    expect(response.data.data).not.to.be.null
    expect(response.data.data.createUser.id).not.to.be.null
    createdUserId = response.data.data.createUser.id
    expect(response.data.data.createUser).not.to.have.property('password')
    expect(response.data.data.createUser.birthDate).to.be.equal(
      test_input.data.birthDate
    )
    expect(response.data.data.createUser.email).to.be.equal(
      test_input.data.email
    )
    expect(response.data.data.createUser.name).to.be.equal(test_input.data.name)
  })

  it('Should find the same user obtained on the previous response', async function () {
    const user = await prisma.user.findUnique({
      where: {
        email: test_input.data.email,
      },
    })
    expect(user).not.to.be.null

    expect(user.id).not.to.be.null
    expect(user.password).not.to.be.equal(test_input.data.password)
    expect(user.birthDate).to.be.equal(test_input.data.birthDate)
    expect(user.email).to.be.equal(test_input.data.email)
    expect(user.name).to.be.equal(test_input.data.name)
  })
})
