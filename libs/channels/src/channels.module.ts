import { Module } from '@nestjs/common'
import { ChannelsService } from '@app/channels/channels.service'
import { KyselyModule } from '@app/kysely-adapter/kysely.module'

@Module({
  providers: [ ChannelsService ],
  exports: [ ChannelsService ],
  imports: [ KyselyModule ],
})
export class ChannelsModule {}
