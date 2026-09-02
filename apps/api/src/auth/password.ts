import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

const VERSION = 'v1'
const KEY_LENGTH = 64
const SALT_LENGTH = 16
const DEFAULT_PARAMS = {
  N: 32_768,
  r: 8,
  p: 1,
} as const

type ScryptParams = {
  N: number
  r: number
  p: number
}

const deriveKey = (
  password: string,
  salt: Buffer,
  params: ScryptParams,
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, {
      ...params,
      maxmem: 64 * 1024 * 1024,
    }, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }

      resolve(derivedKey as Buffer)
    })
  })

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH)
  const derivedKey = await deriveKey(password, salt, DEFAULT_PARAMS)
  const params = `N=${DEFAULT_PARAMS.N},r=${DEFAULT_PARAMS.r},p=${DEFAULT_PARAMS.p}`

  return [
    'scrypt',
    VERSION,
    params,
    salt.toString('base64url'),
    derivedKey.toString('base64url'),
  ].join('$')
}

const parseHash = (
  encodedHash: string,
): { params: ScryptParams; salt: Buffer; derivedKey: Buffer } | null => {
  const [algorithm, version, encodedParams, encodedSalt, encodedKey] =
    encodedHash.split('$')

  if (
    algorithm !== 'scrypt' ||
    version !== VERSION ||
    !encodedParams ||
    !encodedSalt ||
    !encodedKey
  ) {
    return null
  }

  const params = Object.fromEntries(
    encodedParams.split(',').map((entry) => entry.split('=')),
  )
  const N = Number(params.N)
  const r = Number(params.r)
  const p = Number(params.p)

  if (
    !Number.isSafeInteger(N) ||
    !Number.isSafeInteger(r) ||
    !Number.isSafeInteger(p) ||
    N < 2 ** 10 ||
    N > 2 ** 20 ||
    r < 1 ||
    r > 32 ||
    p < 1 ||
    p > 8
  ) {
    return null
  }

  try {
    return {
      params: { N, r, p },
      salt: Buffer.from(encodedSalt, 'base64url'),
      derivedKey: Buffer.from(encodedKey, 'base64url'),
    }
  } catch {
    return null
  }
}

export const verifyPassword = async (
  password: string,
  encodedHash: string,
): Promise<boolean> => {
  const parsed = parseHash(encodedHash)

  if (!parsed || parsed.salt.length === 0 || parsed.derivedKey.length === 0) {
    return false
  }

  try {
    const derivedKey = await deriveKey(password, parsed.salt, parsed.params)

    return (
      derivedKey.length === parsed.derivedKey.length &&
      timingSafeEqual(derivedKey, parsed.derivedKey)
    )
  } catch {
    return false
  }
}
