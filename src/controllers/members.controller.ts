import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { MembersService } from '@app/members/members.service'
import { CryptoService } from '@app/crypto/crypto.service'
import { AuthService } from '@app/auth/auth.service'
import { CreateMemberDto } from '../dto/create-member.dto'
import { TokenData } from '@app/auth/token.decorator'
import { TokenPayload } from '@app/auth/token.interface'
import { RequireAuth } from '@app/auth/auth.decorator'
import { UpdateMemberDto } from '../dto/update-member.dto'
import { RolesService } from '@app/members/roles.service'
import { ApiTags } from '@nestjs/swagger'
import { Permissions } from '@app/permissions/permissions.enum'
import { SetIsBotDto } from '../dto/set-is-bot.dto'

@Controller('members')
@ApiTags('Members')
export class MembersController {
  constructor(
    private readonly members: MembersService,
    private readonly crypto: CryptoService,
    private readonly auth: AuthService,
    private readonly roles: RolesService,
  ) {}

  /** Switches the isBot flag on given member. */
  @Patch(':member/isBot')
  @RequireAuth()
  async setIsBot(
    @Param('member') member: string,
    @TokenData() data: TokenPayload,
    @Body() dto: SetIsBotDto,
  ) {
    await this.auth.forUser(data.userId).hasPermission(Permissions.ADD_BOTS)
    return this.members.setIsBot(member, dto.isBot)
  }

  /** Remove a role. */
  @Delete(':member/roles/:role')
  @RequireAuth()
  async removeRole(
    @Param('member') memberId: string,
    @Param('role') roleId: string,
    @TokenData() data: TokenPayload,
  ) {
    const authr = this.auth.forUser(data.userId)
    await authr.onMember(memberId, Permissions.MANAGE_ROLES)
    await authr.canOnRole(roleId)

    return this.roles.ungrantRole(memberId, roleId)
  }

  /** Add a role to a member. */
  @Post(':member/roles/:role')
  @RequireAuth()
  async addRole(
    @Param('member') memberId: string,
    @Param('role') roleId: string,
    @TokenData() data: TokenPayload,
  ) {
    const authr = this.auth.forUser(data.userId)
    await authr.onMember(memberId, Permissions.MANAGE_ROLES)
    await authr.canOnRole(roleId)

    return this.roles.grantRole(memberId, roleId)
  }

  /** Get a member by id. */
  @Get(':id')
  async getMember(@Param('id') userId: string) {
    // todo: add @me
    const member = await this.members.get(userId)

    return {
      ...member,
      roles: await this.roles.getUserRoles(userId),
    }
  }

  /** Update a member. A member can only be updated by the member itself. */
  @Patch(':id')
  @RequireAuth()
  async updateMember(
    @Param('id') userId: string,
    @TokenData() tokenData: TokenPayload,
    @Body() dto: UpdateMemberDto,
  ) {
    const authr = this.auth.forUser(tokenData.userId)
    authr.isMember(userId)

    return this.members.updateMember(userId, dto.username, dto.avatar)
  }

  /** Register a new member. */
  @Post()
  async createMember(@Body() member: CreateMemberDto) {
    return this.members.createMember(
      this.crypto.importPublicKey(Buffer.from(member.publicKey, 'base64')),
      member.username,
      member.authRequestId,
      Buffer.from(member.signature, 'base64'),
    )
  }
}
