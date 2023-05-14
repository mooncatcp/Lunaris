import { Module } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { KyselyModule } from '@app/kysely-adapter/kysely.module'
import { SnowflakeModule } from '@app/snowflake/snowflake.module'
import { CryptoModule } from '@app/crypto/crypto.module'
import { MooncatConfigModule } from '@app/config/config.module'

@Module({
  providers: [ MessagesService ],
  exports: [ MessagesService ],
  imports: [ KyselyModule, SnowflakeModule, CryptoModule, MooncatConfigModule ],
})
export class MessagesModule {}
