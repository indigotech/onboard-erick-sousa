import { prisma } from '../src/setup-db'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import bcrypt from 'bcrypt'

describe('Relation between users and addresses tests', function () {
  afterEach(async function () {
    await prisma.address.deleteMany({})
    await prisma.user.deleteMany({})
  })

  it('Should create one user with two addresses', async function () {
    const addresses = [
      {
        cep: '12345678',
        street: 'Street 1',
        streetNumber: 1,
        complement: null,
        neighborhood: 'Neighborhood 1',
        city: 'City 1',
        state: 'State 1',
      },
      {
        cep: '87654321',
        street: 'Street 2',
        streetNumber: 2,
        complement: null,
        neighborhood: 'Neighborhood 2',
        city: 'City 2',
        state: 'State 2',
      },
    ]

    const salt = await bcrypt.genSalt(2)
    const passwordHash = await bcrypt.hash('test_user_adress', salt)

    const user = await prisma.user.create({
      data: {
        name: 'Taki User',
        email: 'taki@teste.com',
        password: passwordHash,
        birthDate: '01-01-1950',
        addresses: {
          create: addresses,
        },
      },
    })

    const foundAddresses = await prisma.address.findMany({
      where: {
        userId: user.id,
      },
    })
    expect(foundAddresses[0].userId).to.be.eq(user.id)
    expect(foundAddresses[1].userId).to.be.eq(user.id)
  })
})
