import * as crypto from 'crypto'
import { CryptoService } from './crypto.service'

describe('CryptoService', () => {
  it('encrypts and decrypts aes', () => {
    const service = new CryptoService()
    const iv = crypto.randomBytes(16)
    const key = service.importSecretKey(crypto.randomBytes(32))
    const data = crypto.randomBytes(256)

    const encrypted = service.encrypt(key, data, iv)
    const decrypted = service.decrypt(key, encrypted, iv)

    expect(decrypted.equals(data)).toBe(true)
  })
})