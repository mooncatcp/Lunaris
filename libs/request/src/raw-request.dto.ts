import { IsBase64, IsOptional, IsString } from 'class-validator'
import crypto from 'crypto'

export class RawRequest {
  @IsString()
  @IsOptional()
  @IsBase64()
  private declare p?: string

  @IsString()
  @IsBase64()
  private declare d: string

  @IsString()
  @IsOptional()
  @IsBase64()
  private declare s?: string

  get data(): Buffer {
    return Buffer.from(this.d, 'base64')
  }

  get signature(): Buffer | null {
    return this.s ? Buffer.from(this.s, 'base64') : null
  }

  get public(): crypto.KeyObject | null {
    return this.p ? crypto.createPublicKey(this.p) : null
  }
}