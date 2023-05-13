import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { MembersService } from '@app/members/members.service'
import { CryptoService } from '@app/crypto/crypto.service'
import { AuthService } from '@app/auth/auth.service'
import { CreateMemberDto } from '../dto/create-member.dto'
import { TokenData } from '@app/auth/token.decorator'
import { TokenPayload } from '@app/auth/token.interface'
import { RequireAuth } from '@app/auth/auth.decorator'
import { UpdateMemberDto } from '../dto/update-member.dto'
import { RolesService } from '@app/members/roles.service'

@Controller('members')
export class MembersController {
  constructor(
    private readonly members: MembersService,
    private readonly crypto: CryptoService,
    private readonly auth: AuthService,
    private readonly roles: RolesService,
  ) {}

  @Get(':id')
  async getMember(@Param('id') userId: string) {
    // todo: add @me
    const member = await this.members.get(userId)

    return {
      ...member,
      roles: await this.roles.getUserRoles(userId),
    }
  }

  @Patch(':id')
  @RequireAuth()
  async updateMember(
    @Param('id') userId: string,
    @TokenData() tokenData: TokenPayload,
    @Body() dto: UpdateMemberDto,
  ) {
    const authr = this.auth.forUser(tokenData.userId)
    authr.isMember(userId)

    await this.members.updateMember(userId, dto.username, dto.avatar)

    return true
  }
  
  @Post()
  async createMember(@Body() member: CreateMemberDto) {
    const id = await this.members.createMember(
      this.crypto.importPublicKey(Buffer.from(member.publicKey, 'base64')),
      member.username,
      member.authRequestId,
      Buffer.from(member.signature, 'base64'),
    )

    return { id }
  }
}