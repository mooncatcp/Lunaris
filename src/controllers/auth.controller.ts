import { Body, Controller, NotFoundException, Post, UnauthorizedException } from '@nestjs/common'
import { TokenService } from '@app/auth/token.service'
import { GetTokenDto } from '../dto/get-token.dto'
import { CryptoService } from '@app/crypto/crypto.service'
import { MembersService } from '@app/members/members.service'
import { ErrorCode } from '@app/response/error-code.enum'
import { ApiTags } from '@nestjs/swagger'

@Controller('auth')
@ApiTags('Authorization')
export class AuthController {
  constructor(
    private readonly token: TokenService,
    private readonly crypto: CryptoService,
    private readonly members: MembersService,
  ) {}

  /** Get a token for user using their signature. */
  @Post('token/:id')
  async getToken(@Body() dto: GetTokenDto) {
    const signature = Buffer.from(dto.signature, 'base64')
    const publicKey = this.crypto.importPublicKey(Buffer.from(dto.publicKey, 'base64'))
    const member = await this.members.getByKey(publicKey)
    
    if (member === undefined) {
      throw new NotFoundException({ code: ErrorCode.UnknownMember })
    }

    if (await this.token.verifyAuth(dto.authRequestId, signature, publicKey)) {
      return this.token.issueToken(member.id)
    } else {
      throw new UnauthorizedException({ code: ErrorCode.InvalidSignature })
    }
  }

  /** Creates an auth request. */
  @Post()
  async createAuthRequest() {
    const id = await this.token.beginAuth()
    const data = await this.token.getAuthData(id)

    return { id, data: data.toString('base64') }
  }
}