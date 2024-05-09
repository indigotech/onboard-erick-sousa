import { startServer } from '../src/setup-server.js'
import { startDb } from './setup-db.js'

export default async function setup() {
  await startDb()
  await startServer()
}
