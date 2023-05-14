import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { KyselyService } from '@app/kysely-adapter/kysely.service'
import { DB } from '@app/schema/db.schema'
import { channelPermissions, checkValid } from '@app/permissions/permissions.enum'
import { PermissionOverwrite } from '@app/schema/guild.schema'
import { SnowflakeService } from '@app/snowflake/snowflake.service'
import { ErrorCode } from '@app/response/error-code.enum'
import { RolesService } from '@app/members/roles.service'
import { ChannelsService } from '@app/channels/channels.service'

@Injectable()
export class PermissionOverwritesService {
  constructor(
    private readonly db: KyselyService<DB>,
    private readonly snowflakes: SnowflakeService,
    private readonly roles: RolesService,
    private readonly channels: ChannelsService,
  ) {}

  async getResolvedPermissionOverwrites(member: string, channelId: string) {
    const channel = await this.channels.getChannel(channelId)
    const basePermissions = await this.roles.calculateGuildPermissions(member)
    const roles = await this.roles.getUserRoles(member)
    const overwritesForRoles = await this.db.selectFrom('permissionOverwrite')
      .where(({ and, cmpr }) =>
        and([
          cmpr('roleId', 'in', roles),
          cmpr('channelId', 'in', [ channel.parentId ?? '', channelId ]),
        ]),
      )
      .selectAll()
      .execute()
    const everyoneRole = await this.roles.getEveryoneRole()
    const everyoneOverwrite = await this.db.selectFrom('permissionOverwrite')
      .where(({ and, cmpr }) =>
        and([
          cmpr('roleId', '=', everyoneRole.id),
          cmpr('channelId', 'in', [ channel.parentId ?? '', channelId ]),
        ]),
      )
      .selectAll()
      .executeTakeFirst()

    if (everyoneOverwrite !== undefined) {
      overwritesForRoles.push(everyoneOverwrite)
    }

    let permissions = basePermissions
    let allow = 0
    let deny = 0

    for (const roleOverwrite of overwritesForRoles) {
      allow |= roleOverwrite.allow
      deny |= roleOverwrite.deny
    }

    permissions &= ~deny
    permissions |= allow

    const memberOverwrite = await this.db.selectFrom('permissionOverwrite')
      .where(({ and, cmpr }) =>
        and([
          cmpr('memberId', '=', member),
          cmpr('channelId', 'in', [ channel.parentId ?? '', channelId ]),
        ]),
      )
      .selectAll()
      .executeTakeFirst()
    if (memberOverwrite !== undefined) {
      permissions |= memberOverwrite.allow
      permissions &= ~memberOverwrite.deny
    }

    return permissions
  }

  async getAllPermissionOverwrites() {
    return await this.db
      .selectFrom('permissionOverwrite')
      .selectAll()
      .execute() ?? []
  }

  async getPermissionOverwrites(channelId: string) {
    return await this.db
      .selectFrom('permissionOverwrite')
      .where('channelId', '=', channelId)
      .selectAll()
      .execute() ?? []
  }

  async getPermissionOverwrite(permissionOverwriteId: string) {
    const overwrite = await this.db
      .selectFrom('permissionOverwrite')
      .where('id', '=', permissionOverwriteId)
      .selectAll()
      .executeTakeFirst()
    if (overwrite === undefined) {
      throw new NotFoundException({ code: ErrorCode.UnknownPermissionOverwrite })
    }

    return overwrite
  }

  async createPermissionOverwrite(channelId: string, type: 'role' | 'member', id: string, allow: number, deny: number) {
    const data: PermissionOverwrite = { channelId, type, allow, deny, id: this.snowflakes.nextStringId() }
    type === 'member' ? data.memberId = id : data.roleId = id
    if (!(checkValid(allow, channelPermissions) && checkValid(deny, channelPermissions)))
      throw new BadRequestException({ code: ErrorCode.InvalidPermissions })

    await this.db
      .insertInto('permissionOverwrite')
      .values(data)
      .execute()
  }

  async modifyPermissionOverwrite(permissionOverwriteId: string, allow: number, deny: number) {

    if (!(checkValid(allow, channelPermissions) && checkValid(deny, channelPermissions)))
      throw new BadRequestException({ code: ErrorCode.InvalidPermissions })

    await this.db
      .updateTable('permissionOverwrite')
      .where('id', '=', permissionOverwriteId)
      .set({ allow, deny })
      .execute()
  }

  async deletePermissionOverwrite(permissionOverwriteId: string) {
    await this.db
      .deleteFrom('permissionOverwrite')
      .where('id', '=', permissionOverwriteId)
      .execute()
  }
}