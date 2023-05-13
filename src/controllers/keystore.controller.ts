import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common'
import { KeystoreService } from '@app/keystore-server/keystore.service'
import { Keystore } from '@app/schema/keystore.schema'
import { ErrorCode } from '@app/response/error-code.enum'
import { CreateLoginDto } from '../dto/create-login.dto'
import { ApiTags } from '@nestjs/swagger'

@Controller('keystore')
@ApiTags('Keystore')
export class KeystoreController {
  constructor(
    private readonly keystoreService: KeystoreService,
  ) {}

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
    const keystore = await this.keystoreService.getByLogin(login)
    if (keystore === null) {
      throw new NotFoundException({ code: ErrorCode.UnknownLogin })
    }

    return keystore
  }
}