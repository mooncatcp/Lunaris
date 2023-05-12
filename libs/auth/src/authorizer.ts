import { MembersService } from '@app/members/members.service'
import { RolesService } from '@app/members/roles.service'
import { has } from '@app/permissions/permissions.enum'
import { ForbiddenException } from '@nestjs/common'
import { ErrorCode } from '@app/response/error-code.enum'

export class Authorizer {
  constructor(
    private readonly members: MembersService,
    private readonly roles: RolesService,
    private readonly user: string,
  ) {}

  async canOnMember(onMember: string, perm: number) {
    return this.roles.canOnMember(
      this.user,
      onMember,
      perm,
    )
  }

  async hasPermission(perm: number) {
    const h = has(
      await this.roles.calculateGuildPermissions(this.user),
      perm,
    )
    if (!h) {
      throw new ForbiddenException({ code: ErrorCode.Unauthorized })
    }
  }
}