import { Module } from '@nestjs/common'
import { ChannelsService } from './channels.service'
import { KyselyModule } from '@app/kysely-adapter'

@Module({
  providers: [ ChannelsService ],
  exports: [ ChannelsService ],
  imports: [ KyselyModule ],
})
export class ChannelsModule {}
