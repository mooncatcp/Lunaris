import { BadRequestException, Injectable } from '@nestjs/common'
import { KyselyService } from '@app/kysely-adapter/kysely.service'
import { DB } from '@app/schema/db.schema'
import { channelPermissions, checkValid, resolve } from '@app/permissions/permissions.enum'
import { PermissionOverwrite } from '@app/schema/guild.schema'
import { SnowflakeService } from '@app/snowflake/snowflake.service'
import { ErrorCode } from '@app/response/error-code.enum'

@Injectable()
export class PermissionOverwritesService {
  constructor(
    private readonly db: KyselyService<DB>,
    private readonly snowflakes: SnowflakeService,
  ) {}

  async getResolvedPermissionOverwrites(id: string, channelId: string) {
    const overwrites = await this.db
      .selectFrom('permissionOverwrite')
      .where('channelId', '=', channelId)
      .where(({ or, cmpr }) => or([ cmpr('memberId', '=', id), cmpr('roleId', '=', id) ]))
      .selectAll()
      .executeTakeFirst()


    if (!overwrites) return undefined
    else return resolve(overwrites.allow, overwrites.deny)
  }

  async getPermissionOverwrites(channelId: string) {
    return await this.db
      .selectFrom('permissionOverwrite')
      .where('channelId', '=', channelId)
      .selectAll()
      .execute() ?? []
  }

  async getPermissionOverwrite(permissionOverwriteId: string) {
    return await this.db
      .selectFrom('permissionOverwrite')
      .where('id', '=', permissionOverwriteId)
      .selectAll()
      .executeTakeFirst()
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