import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { parseEnv } from './runtime.js'

config({
  path: fileURLToPath(new URL('../../../../.env', import.meta.url)),
})

export { envSchema, parseEnv } from './runtime.js'

export const env = parseEnv()
