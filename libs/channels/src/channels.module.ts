import { Module } from '@nestjs/common'
import { ChannelsService } from '@app/channels/channels.service'
import { KyselyModule } from '@app/kysely-adapter/kysely.module'
import { SnowflakeModule } from '@app/snowflake/snowflake.module'

@Module({
  providers: [ ChannelsService ],
  exports: [ ChannelsService ],
  imports: [ KyselyModule, SnowflakeModule ],
})
export class ChannelsModule {}
