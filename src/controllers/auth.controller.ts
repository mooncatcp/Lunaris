import { Controller, Get, NotFoundException, Param, Post } from '@nestjs/common'
import { AuthService } from '@app/auth-server'
import { Auth } from '@app/schema'
import { ErrorCode } from '@app/response'
import { MooncatBody, MooncatBodyData } from '@app/request'
import { CreateLoginDto } from '../dto/create-login.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post()
  async addLogin(
    @MooncatBody(CreateLoginDto, false) body: MooncatBodyData<CreateLoginDto>,
  ) {
    await this.authService.addLogin(body.data)
    return null
  }

  @Get(':login')
  async getByLogin(@Param('login') login: string): Promise<Auth> {
    const auth = await this.authService.getByLogin(login)
    if (auth === null) {
      throw new NotFoundException({ code: ErrorCode.UnknownLogin })
    }

    return auth
  }
}