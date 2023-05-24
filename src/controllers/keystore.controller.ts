import { Body, Controller, ForbiddenException, Get, Param, Patch, Post } from '@nestjs/common'
import { KeystoreService } from '@app/keystore-server/keystore.service'
import { Keystore } from '@app/schema/keystore.schema'
import { ErrorCode } from '@app/response/error-code.enum'
import { CreateLoginDto } from '../dto/create-login.dto'
import { ApiTags } from '@nestjs/swagger'
import { UpdateLoginDto } from '../dto/update-login.dto'
import { TokenService } from '@app/auth/token.service'
import { CryptoService } from '@app/crypto/crypto.service'

@Controller('keystore')
@ApiTags('Keystore')
export class KeystoreController {
  constructor(
    private readonly keystoreService: KeystoreService,
    private readonly token: TokenService,
    private readonly crypto: CryptoService,
  ) {}

  /** Update a login by username. */
  @Patch(':login')
  async patchLogin(
    @Param('login') login: string,
    @Body() dto: UpdateLoginDto,
  ) {
    const loginFromDb = await this.keystoreService.getByLogin(login)
    const publicKey = this.crypto.importPublicKey(Buffer.from(loginFromDb.publicKey, 'base64'))
    const ok = this.token.verifyAuth(dto.authRequestId, Buffer.from(dto.signature, 'base64'), publicKey)
    if (!ok) {
      throw new ForbiddenException({ code: ErrorCode.InvalidSignature })
    }

    return this.keystoreService.updateLogin(login, dto)
  }

  /** Register a user in the keystore. */
  @Post()
  async addLogin(
    @Body() data: CreateLoginDto,
  ) {
    await this.keystoreService.addLogin(data)
    return null
  }

  /** Get data of a user in the keystore. */
  @Get(':login')
  async getByLogin(@Param('login') login: string): Promise<Keystore> {
    return this.keystoreService.getByLogin(login)
  }
}
