import { Injectable, NotFoundException } from '@nestjs/common'
import { Channel } from '@app/schema/guild.schema'
import { KyselyService } from '@app/kysely-adapter/kysely.service'
import { ErrorCode } from '@app/response/error-code.enum'
import { DB } from '@app/schema/db.schema'

@Injectable()
export class ChannelsService {
  constructor(private readonly db: KyselyService<DB>) {}

  async getChannel(id: string) {
    return await this.db
      .selectFrom('channel')
      .where('channel.id', '=', id)
      .selectAll()
      .executeTakeFirst()
  }

  async exists(channel: string) {
    const { countAll } = this.db.fn
    const res = await this.db
      .selectFrom('channel')
      .where('channel.id', '=', channel)
      .select(countAll().as('with_id'))
      .executeTakeFirst()
    return res !== undefined && BigInt(res.with_id) !== 0n
  }

  async enforceExists(channel: string) {
    if (!await this.exists(channel)) {
      throw new NotFoundException({ code: ErrorCode.UnknownChannel })
    }
  }

  async getAllChannels() {
    return await this.db
      .selectFrom('channel')
      .selectAll()
      .execute()
  }

  async createChannel(data: Channel) {
    return await this.db
      .insertInto('channel')
      .values({ ...data })
      .execute()
  }

  async modifyChannel(id: string, newData: { name: string; parentId?: string; description?: string }) {
    await this.enforceExists(id)
    return await this.db
      .updateTable('channel')
      .where('channel.id', '=', id)
      .set({ ...newData })
      .execute()
  }

  async deleteChannel(id: string) {
    await this.enforceExists(id)
    return await this.db
      .deleteFrom('channel')
      .where('channel.id', '=', id)
      .execute()
  }
}
