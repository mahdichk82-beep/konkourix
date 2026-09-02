import { createHash, randomBytes } from 'node:crypto'

export type GeneratedRefreshToken = {
  hash: string
  token: string
}

export const hashRefreshToken = (token: string): string =>
  createHash('sha256').update(token, 'utf8').digest('hex')

export const generateRefreshToken = (): GeneratedRefreshToken => {
  const token = randomBytes(32).toString('base64url')

  return {
    hash: hashRefreshToken(token),
    token,
  }
}
