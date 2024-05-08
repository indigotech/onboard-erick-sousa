import { startServer } from '../src/setup-server'
import { startDb } from './setup-db'

export function setup() {
  startDb()
  startServer()
}
