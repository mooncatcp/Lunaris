import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common'
import { KeystoreService } from '@app/keystore-server'
import { Keystore } from '@app/schema'
import { ErrorCode } from '@app/response'
import { CreateLoginDto } from '../dto/create-login.dto'

@Controller('keystore')
export class KeystoreController {
  constructor(
    private readonly keystoreService: KeystoreService,
  ) {}

  @Post()
  async addLogin(
    @Body() data: CreateLoginDto,
  ) {
    await this.keystoreService.addLogin(data)
    return null
  }

  @Get(':login')
  async getByLogin(@Param('login') login: string): Promise<Keystore> {
    const keystore = await this.keystoreService.getByLogin(login)
    if (keystore === null) {
      throw new NotFoundException({ code: ErrorCode.UnknownLogin })
    }

    return keystore
  }
}