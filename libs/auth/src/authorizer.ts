import { MembersService } from '@app/members/members.service'
import { RolesService } from '@app/members/roles.service'
import { has, Permissions } from '@app/permissions/permissions.enum'
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

  async canOnRole(role: string) {
    await this.hasPermission(Permissions.MANAGE_ROLES)
    const member = await this.members.get(this.user)
    if (member.isOwner) {
      return
    }
    const role2 = await this.roles.getRole(role)
    const highest = await this.roles.highestRole(this.user)

    if (role2.position >= (highest.position ?? 0)) {
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

  async hasPermission(perm: number, channelId?: string) {
    if (channelId) await this.hasPermissionOnChannel(channelId, perm)
    const h = has(
      await this.roles.calculateGuildPermissions(this.user),
      perm,
    )
    if (!h) {
      throw new ForbiddenException({ code: ErrorCode.NoPermissions })
    }
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