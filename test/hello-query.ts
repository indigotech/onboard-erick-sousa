import { stopServer } from '../src/setup-server'
import setup from '../src/setup'
import { describe, it, before, after } from 'mocha'
import axios from 'axios'
import { expect } from 'chai'

describe('hello query test', function () {
  before(async function () {
    await setup()
  })

  after(async function () {
    await stopServer()
  })

  it('should return "Hello world!"', async function () {
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
})
