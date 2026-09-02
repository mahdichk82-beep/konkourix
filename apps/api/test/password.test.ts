import assert from 'node:assert/strict'
import test from 'node:test'
import { hashPassword, verifyPassword } from '../src/auth/password.js'

test('password hashes use a random salt and verify the original password', async () => {
  const firstHash = await hashPassword('correct horse battery staple')
  const secondHash = await hashPassword('correct horse battery staple')

  assert.notEqual(firstHash, secondHash)
  assert.equal(await verifyPassword('correct horse battery staple', firstHash), true)
  assert.equal(await verifyPassword('wrong password', firstHash), false)
})

test('malformed password hashes fail verification safely', async () => {
  assert.equal(await verifyPassword('any password', 'not-a-password-hash'), false)
})
