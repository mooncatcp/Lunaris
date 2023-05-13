import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Token, TokenPayload } from '@app/auth/token.interface'
import { ErrorCode } from '@app/response/error-code.enum'
import { MooncatConfigService } from '@app/config/config.service'
import { CryptoService } from '@app/crypto/crypto.service'
import * as crypto from 'crypto'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import ms from 'ms'

@Injectable()
export class TokenService {
  constructor(
    private readonly config: MooncatConfigService,
    private readonly crypto: CryptoService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}
  
  private readonly authRequestKey = (id: string) => `authRequest:${id}`
  
  async getAuthData(id: string) {
    const data = await this.cache.get<Buffer>(this.authRequestKey(id))
    
    if (data === undefined) {
      throw new NotFoundException({ code: ErrorCode.UnknownAuthRequest })
    }
    
    return data
  }

  async verifyAuth(id: string, signature: Buffer, publicKey: crypto.KeyObject): Promise<boolean> {
    const data = await this.cache.get<Buffer>(this.authRequestKey(id))
    if (data === undefined) {
      return false
    }
    await this.cache.del(this.authRequestKey(id))

    return this.crypto.verify(data, signature, publicKey)
  }

  async beginAuth(): Promise<string> {
    const id = crypto.randomBytes(16).toString('hex')
    const dataToBeSigned = crypto.randomBytes(16)

    await this.cache.set(this.authRequestKey(id), dataToBeSigned, ms('10min'))

    return id
  }

  encodeToken(payload: TokenPayload) {
    const jsonData = JSON.stringify({
      ...payload,
      validUntil: payload.validUntil.getTime(),
    })
    const bufferData = Buffer.from(jsonData)
    const signature = this.crypto.serverSign(bufferData, this.config.tokenSignatureKey)

    return `${bufferData.toString('base64')}.${signature.toString('base64')}`
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
    const signature = Buffer.from(segments[1], 'base64')
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