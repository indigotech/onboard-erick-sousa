import axios from 'axios'
import { prisma } from '../src/setup-db'
import { describe, it } from 'mocha'
import { expect } from 'chai'

describe('hello query tests', function () {
  afterEach(async function () {
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
        cep: '12345678',
        street: 'Street 1',
        streetNumber: 1,
        complement: null,
        neighborhood: 'Neighborhood 1',
        city: 'City 1',
        state: 'State 1',
      },
    ]

    const user = await prisma.user.create({
      data: {
        name: 'Taki User',
        email: 'taki@teste.com',
        password:
          '$2b$10$li3MOizIuHQ0gEDF3glM..M2pScu0u2AUntgrynpyg39IR1a.ELHO',
        birthDate: '01-01-1950',
        addresses: {
          create: addresses,
        },
      },
    })
  })
})
