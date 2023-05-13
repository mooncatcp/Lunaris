import { MembersService } from '@app/members/members.service'
import { RolesService } from '@app/members/roles.service'
import { has } from '@app/permissions/permissions.enum'
import { ForbiddenException } from '@nestjs/common'
import { ErrorCode } from '@app/response/error-code.enum'
import { PermissionOverwritesService } from '@app/permissions/permission-overwrites.service'

export class Authorizer {
  constructor(
    private readonly members: MembersService,
    private readonly roles: RolesService,
    private readonly user: string,
    private readonly permissionsOverwrites: PermissionOverwritesService,
  ) {}

  isMember(another: string) {
    if (another !== this.user) {
      throw new ForbiddenException({ code: ErrorCode.NoPermissions })
    }
  }

  async onMember(onMember: string, perm: number) {
    const is = await this.roles.canOnMember(
      this.user,
      onMember,
      perm,
    )

    if (!is) {
      throw new ForbiddenException({ code: ErrorCode.NoPermissions })
    }
  }

  async hasPermission(perm: number) {
    const h = has(
      await this.roles.calculateGuildPermissions(this.user),
      perm,
    )
    if (!h) {
      throw new ForbiddenException({ code: ErrorCode.NoPermissions })
    }
  }

  async hasPermissions(...perms: number[]) {
    for (const perm of perms) await this.hasPermission(perm)
  }

  async hasPermissionOnChannel(channelId: string, perm: number) {
    const overwrites = await this.permissionsOverwrites.getResolvedPermissionOverwrites(this.user, channelId)
    if (!overwrites) return this.hasPermission(perm)
    const h = has(
      overwrites,
      perm,
    )
    if (!h) {
      throw new ForbiddenException({ code: ErrorCode.NoPermissions })
    }
  }
}