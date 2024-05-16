import setup from '../src/setup'
import { stopServer } from '../src/setup-server'
import { before, after } from 'mocha'
import { prisma } from '../src/setup-db'
import chaiExclude from 'chai-exclude'
import { use } from 'chai'

before(async function () {
  await setup()
  await prisma.address.deleteMany({})
  await prisma.user.deleteMany({})
  use(chaiExclude)
})
after(async function () {
  await stopServer()
})

import './hello-query'
import './create-user'
import './login'
import './user-query'
import './users-query'
import './address-user-relation'
