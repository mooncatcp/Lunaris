import { Injectable } from '@nestjs/common'
import { Channel, DB } from '@app/schema'
import { KyselyService } from '@app/kysely-adapter'
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
    async modifyChannel(id: string, newData: { name?: string; parentId?: string; description?: string }) {
        return await this.db
            .updateTable('channel')
            .where('channel.id', '=', id)
            .set({ ...newData })
            .execute()
    }

    async deleteChannel(id: string) {
        return await this.db
            .deleteFrom('channel')
            .where('channel.id', '=', id)
            .execute()
    }
}
