import axios from 'axios'
import { prisma } from '../src/setup-db'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'

describe('hello query tests', function () {
  afterEach(async function () {
    await prisma.user.deleteMany({})
  })

  it('Should return "Hello world!"', async function () {
    const helloQuery = gql`
      query {
        hello {
          content
        }
      }
    `

    const response = await axios.post('http://localhost:4000', {
      query: print(helloQuery),
    })

    const content = response.data.data.hello[0].content

    expect(content).to.be.equal('Hello world!')
  })
})
