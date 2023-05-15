import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Channel } from '@app/schema/guild.schema'
import { KyselyService } from '@app/kysely-adapter/kysely.service'
import { ErrorCode } from '@app/response/error-code.enum'
import { DB } from '@app/schema/db.schema'
import { SnowflakeService } from '@app/snowflake/snowflake.service'

@Injectable()
export class ChannelsService {
  constructor(
    private readonly db: KyselyService<DB>,
    private readonly snowflake: SnowflakeService,
  ) {}

  async getParent(id: string) {
    const ch = await this.getChannel(id)
    if (ch === undefined) throw new NotFoundException({ code: ErrorCode.UnknownChannel })
    try {
      if (ch.parentId !== undefined) {
        return this.getChannel(ch.parentId)
      } else {
        return undefined
      }
    } catch {
      return undefined
    }
  }

  async getChannel(id: string) {
    const ch = await this.db
      .selectFrom('channel')
      .where('channel.id', '=', id)
      .selectAll()
      .executeTakeFirst()

    if (ch === undefined) {
      throw new NotFoundException({ code: ErrorCode.UnknownChannel })
    }

    return ch
  }

  async getChannelType(id: string) {
    const ch = await this.getChannel(id)
    return ch.type
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

  async updateChannelPositions(positions: ({ id: string; position: number })[]) {
    const totalChannels = await this.db.selectFrom('channel')
      .select(this.db.fn.countAll().as('totalChannels'))
      .executeTakeFirstOrThrow()
      .then(e => Number(e.totalChannels))
    if (positions.length !== totalChannels) {
      throw new BadRequestException({ code: ErrorCode.BadChannelPositions })
    }
    const takenPositions = new Set<number>()
    const ids = new Set<string>()
    for (const position of positions) {
      if (position.position < 0 || ids.has(position.id) || takenPositions.has(position.position)) {
        throw new BadRequestException({ code: ErrorCode.BadChannelPositions })
      } else {
        await this.enforceExists(position.id)
        takenPositions.add(position.position)
        ids.add(position.id)
      }
    }

    const proms = []

    for (const position of positions) {
      proms.push(
        this.db.updateTable('channel')
          .set({ position: position.position })
          .where('id', '=', position.id)
          .execute(),
      )
    }

    return Promise.all(proms)
  }

  async createChannel(data: Omit<Channel, 'id' | 'position'>) {
    if (data.parentId) {
      const parent = await this.getChannel(data.parentId)
      if (data.type === 'category' || parent?.type !== 'category') {
        throw new BadRequestException({ code: ErrorCode.InvalidChannelType })
      }
    }

    const id = this.snowflake.nextStringId()
    await this.db.updateTable('channel')
      .set(({ bxp }) => ({
        position: bxp('position', '+', 1),
      }))
      .execute()

    await this.db
      .insertInto('channel')
      .values({ ...data, id, position: 0 })
      .execute()

    return id
  }

  async modifyChannel(
    id: string,
    newData: { name: string; parentId?: string; description?: string; },
  ) {
    await this.enforceExists(id)
    if (newData.parentId) {
      const self = await this.getChannel(id)
      const parent = await this.getChannel(newData.parentId)
      if (self.type === 'category' || parent?.type !== 'category') {
        throw new BadRequestException({ code: ErrorCode.InvalidChannelType })
      }
    }

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
