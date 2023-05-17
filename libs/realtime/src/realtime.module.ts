import { Module } from '@nestjs/common'
import { RealtimeService } from './realtime.service'
import { SnowflakeModule } from '@app/snowflake/snowflake.module'
import { AuthModule } from '@app/auth/auth.module'
import { MooncatConfigModule } from '@app/config/config.module'

@Module({
  providers: [ RealtimeService ],
  exports: [ RealtimeService ],
  imports: [ SnowflakeModule, AuthModule, MooncatConfigModule ],
})
export class RealtimeModule {}
