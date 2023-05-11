import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'

@Injectable()
export class CryptoService {
  decrypt(key: crypto.KeyObject, data: Buffer, iv: Buffer) {
    const cipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    const encrypted = cipher.update(data)
    return Buffer.concat([ encrypted, cipher.final() ])
  }

  encrypt(key: crypto.KeyObject, data: Buffer, iv: Buffer) {
    const decipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    const encrypted = decipher.update(data)
    return Buffer.concat([ encrypted, decipher.final() ])
  }

  verify(data: Buffer, signature: Buffer, publicKey: crypto.KeyObject): boolean {
    return crypto.verify('sha256', data, publicKey, signature)
  }

  sign(data: Buffer, privateKey: crypto.KeyObject): Buffer {
    return crypto.sign('sha256', data, privateKey)
  }

  importPrivateKey(data: Buffer) {
    return crypto.createPrivateKey({
      key: data,
      type: 'pkcs1',
      format: 'der',
    })
  }

  importSecretKey(data: Buffer) {
    return crypto.createSecretKey(data)
  }

  importPublicKey(data: Buffer) {
    return crypto.createPublicKey({
      key: data,
      type: 'pkcs1',
      format: 'der',
    })
  }

  exportKey(key: crypto.KeyObject) {
    return key.export({ type: 'pkcs1', format: 'der' })
  }
}
