import setup from '../src/setup'
import { stopServer } from '../src/setup-server'
import { before, after } from 'mocha'
import { prisma } from '../src/setup-db'

before(async function () {
  await setup()
  await prisma.user.deleteMany({})
})
after(async function () {
  await stopServer()
})

import './hello-query'
import './create-user'
