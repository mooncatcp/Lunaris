import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { RolesService } from '@app/members/roles.service'
import { RequireAuth } from '@app/auth/auth.decorator'
import { TokenData } from '@app/auth/token.decorator'
import { TokenPayload } from '@app/auth/token.interface'
import { AuthService } from '@app/auth/auth.service'
import { Permissions } from '@app/permissions/permissions.enum'
import { ModifyRoleDto } from '../dto/modify-role.dto'
import { CreateRoleDto } from '../dto/create-role.dto'
import { ModifyPositionDto } from '../dto/modify-positions.dto'

@Controller('roles')
@ApiTags('Roles')
export class RolesController {
  constructor(
    private readonly roles: RolesService,
    private readonly auth: AuthService,
  ) {}

  /** Delete a role. */
  @Delete('id')
  @RequireAuth()
  async deleteRole(
    @TokenData() token: TokenPayload,
    @Param('id') roleId: string,
  ) {
    const authr = this.auth.forUser(token.userId)
    await authr.hasPermission(Permissions.MANAGE_ROLES)
    await authr.canOnRole(roleId)

    return this.roles.deleteRole(roleId)
  }

  /** Change positions of roles. */
  @Patch('positions')
  @RequireAuth()
  async updateRolePositions(
    @TokenData() token: TokenPayload,
    @Body() dto: ModifyPositionDto,
  ) {
    const authr = this.auth.forUser(token.userId)
    await authr.hasPermission(Permissions.MANAGE_ROLES)
    await this.roles.updateRolePositions(
      dto.positions,
      await this.roles.highestRole(token.userId).then(e => e.position!),
    )

    return dto.positions
  }

  /** Modify a role. */
  @Patch(':id')
  @RequireAuth()
  async patchRole(
    @TokenData() token: TokenPayload,
    @Body() dto: ModifyRoleDto,
    @Param('id') roleId: string,
  ) {
    const authr = this.auth.forUser(token.userId)
    await authr.hasPermission(Permissions.MANAGE_ROLES)
    await authr.hasPermission(dto.permissions)
    await authr.canOnRole(roleId)

    return this.roles.updateRole(roleId, dto.name, dto.color, dto.permissions)
  }

  /** Create a role. */
  @Post()
  @RequireAuth()
  async createRole(@TokenData() token: TokenPayload, @Body() dto: CreateRoleDto) {
    const authr = this.auth.forUser(token.userId)
    await authr.hasPermission(Permissions.MANAGE_ROLES)

    return this.roles.createRole(dto.name)
  }

  /** Get list of all roles. */
  @Get()
  async getRoles() {
    return this.roles.getRoles()
  }
}
