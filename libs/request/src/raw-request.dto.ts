import { IsString } from 'class-validator'
import crypto from 'crypto'

export class RawRequest {
  @IsString()
  private declare p: string

  @IsString()
  private declare d: string

  @IsString()
  private declare s: string

  get data(): Buffer {
    return Buffer.from(this.d, 'base64')
  }

  get signature(): Buffer {
    return Buffer.from(this.s, 'base64')
  }

  get public(): crypto.KeyObject {
    return crypto.createPublicKey(this.p)
  }
}