import axios from 'axios'
import assert from 'assert'
import { describe, it, before, after } from 'mocha'
import { startServer, stopServer } from '../src/setup-server'

describe('hello query test', function () {
  before(async function () {
    await startServer()
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
    assert.equal(response.data.data.hello[0].content, 'Hello world!')
  })
})
