import { Injectable, UnauthorizedException } from '@nestjs/common'
import { Token, TokenPayload } from '@app/auth/token.interface'
import { ErrorCode } from '@app/response/error-code.enum'
import { MooncatConfigService } from '@app/config/config.service'
import { CryptoService } from '@app/crypto/crypto.service'
import * as crypto from 'crypto'

@Injectable()
export class TokenService {
  private readonly authRequests = new Map<string, Buffer>()

  constructor(
    private readonly config: MooncatConfigService,
    private readonly crypto: CryptoService,
  ) {}

  verifyAuth(id: string, signature: Buffer, publicKey: crypto.KeyObject): boolean {
    const data = this.authRequests.get(id)
    if (data === undefined) {
      return false
    }
    this.authRequests.delete(id)

    return this.crypto.verify(data, signature, publicKey)
  }

  beginAuth(): string {
    const id = crypto.randomBytes(16).toString('hex')
    const dataToBeSigned = crypto.randomBytes(16)

    this.authRequests.set(id, dataToBeSigned)

    return id
  }

  encodeToken(payload: TokenPayload) {
    const jsonData = JSON.stringify({
      ...payload,
      validUntil: payload.validUntil.getTime(),
    })
    const bufferData = Buffer.from(jsonData)
    const signature = this.crypto.serverSign(bufferData, this.config.tokenSignatureKey)

    return `${bufferData.toString('base64')}.${signature.toString('base64')}}`
  }

  issueToken(forUser: string) {
    const payload = {
      userId: forUser,
      validUntil: new Date(Date.now() + this.config.tokenLifespan),
    }

    return this.encodeToken(payload)
  }

  decodeToken(data: string): Token {
    const segments = data.split('.')
    if (segments.length !== 2) {
      throw new UnauthorizedException({ code: ErrorCode.InvalidTokenFormat })
    }

    const rawJson = Buffer.from(segments[0], 'base64')
    const signature = Buffer.from(segments[0], 'base64')
    const jsonData = JSON.parse(rawJson.toString())
    if (typeof jsonData.userId !== 'string' || typeof jsonData.validUntil !== 'number') {
      throw new UnauthorizedException({ code: ErrorCode.InvalidTokenFormat })
    }

    if (!this.crypto.checkServerSign(rawJson, signature, this.config.tokenSignatureKey)) {
      throw new UnauthorizedException({ code: ErrorCode.InvalidSignature })
    }
    
    return {
      validUntil: new Date(jsonData.validUntil),
      userId: jsonData.userId,
      signature,
    }
  }
}