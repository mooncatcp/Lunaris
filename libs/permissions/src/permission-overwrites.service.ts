import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { KyselyService } from '@app/kysely-adapter/kysely.service'
import { DB } from '@app/schema/db.schema'
import { channelPermissions, checkValid, Permissions } from '@app/permissions/permissions.enum'
import { PermissionOverwrite } from '@app/schema/guild.schema'
import { SnowflakeService } from '@app/snowflake/snowflake.service'
import { ErrorCode } from '@app/response/error-code.enum'
import { RolesService } from '@app/members/roles.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MembersService } from '@app/members/members.service'
import { ChannelsService } from '@app/channels/channels.service'

@Injectable()
export class PermissionOverwritesService {
  constructor(
    private readonly db: KyselyService<DB>,
    private readonly snowflakes: SnowflakeService,
    private readonly roles: RolesService,
    private readonly events: EventEmitter2,
    private readonly members: MembersService,
    private readonly channels: ChannelsService,
  ) {}

  async getOverwritesForRolesAndChannel(roles: string[], channelId: string) {
    return this.db.selectFrom('permissionOverwrite')
      .where(({ and, cmpr }) =>
        and([
          cmpr('roleId', 'in', roles),
          cmpr('channelId', '=', channelId),
        ]),
      )
      .selectAll()
      .execute()
  }

  async getOverwriteForMemberAndChannel(member: string, channelId: string) {
    return this.db.selectFrom('permissionOverwrite')
      .where(({ and, cmpr }) =>
        and([
          cmpr('memberId', '=', member),
          cmpr('channelId', '=', channelId),
        ]),
      )
      .selectAll()
      .executeTakeFirst()
  }


  async getResolvedPermissionOverwrites(member: string, channelId: string) {
    const basePermissions = await this.roles.calculateGuildPermissions(member)
    const channel = await this.channels.getChannel(channelId)
    const roles = await this.roles.getUserRoles(member)
    let overwritesForRoles = await this.getOverwritesForRolesAndChannel(roles, channelId)
    if (overwritesForRoles.length === 0 && channel.parentId) {
      overwritesForRoles = await this.getOverwritesForRolesAndChannel(roles, channelId)
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

    let memberOverwrite = await this.getOverwriteForMemberAndChannel(member, channelId)
    if (memberOverwrite === undefined && channel.parentId !== undefined) {
      memberOverwrite = await this.getOverwriteForMemberAndChannel(member, channel.parentId)
    }
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

  async getPermissionOverwritesForRoleOrMember(id: string) {
    return await this.db
      .selectFrom('permissionOverwrite')
      .where(({ or, cmpr }) =>
        or([
          cmpr('roleId', '=', id),
          cmpr('memberId', '=', id),
        ]),
      )
      .selectAll()
      .execute() ?? []
  }

  async getPermissionOverwritesForRoles(roleIds: string[]) {
    return await this.db
      .selectFrom('permissionOverwrite')
      .where(({ and, cmpr }) =>
        and([
          cmpr('roleId', 'in', roleIds),
        ]),
      )
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

  async getAvailableChannels(member: string) {
    const channels = await this.db
      .selectFrom('channel')
      .selectAll()
      .execute()
    const proms = []
    
    for (const channel of channels) {
      const promise = this.getResolvedPermissionOverwrites(member, channel.id)  
        .then(v => (v & Permissions.READ_MESSAGES) === Permissions.READ_MESSAGES ? channel.id : '' )
      proms.push(promise)
    }

    return Promise.all(proms).then(e => e.filter(e => e !== ''))
  }

  async createPermissionOverwrite(channelId: string, type: 'role' | 'member', id: string, allow: number, deny: number) {
    const data: PermissionOverwrite = { channelId, type, allow, deny, id: this.snowflakes.nextStringId() }
    type === 'member' ? data.memberId = id : data.roleId = id
    if (!(checkValid(allow, channelPermissions) && checkValid(deny, channelPermissions)))
      throw new BadRequestException({ code: ErrorCode.InvalidPermissions })

    const overwrite = await this.db
      .insertInto('permissionOverwrite')
      .values(data)
      .returningAll()
      .executeTakeFirst()

    this.events.emit('permission_overwrite.created', overwrite)

    return overwrite!
  }

  async modifyPermissionOverwrite(permissionOverwriteId: string, allow: number, deny: number) {
    if (!(checkValid(allow, channelPermissions) && checkValid(deny, channelPermissions)))
      throw new BadRequestException({ code: ErrorCode.InvalidPermissions })

    if ((allow & deny) !== 0)
      throw new BadRequestException({ code: ErrorCode.InvalidPermissions })

    const data = await this.db
      .updateTable('permissionOverwrite')
      .where('id', '=', permissionOverwriteId)
      .set({ allow, deny })
      .returningAll()
      .executeTakeFirst()

    this.events.emit('permission_overwrite.updated', data)

    return data!
  }

  async deletePermissionOverwrite(permissionOverwriteId: string) {
    await this.db
      .deleteFrom('permissionOverwrite')
      .where('id', '=', permissionOverwriteId)
      .execute()
    this.events.emit('permission_overwrite.deleted', { id: permissionOverwriteId })

    return { id: permissionOverwriteId }
  }
}
