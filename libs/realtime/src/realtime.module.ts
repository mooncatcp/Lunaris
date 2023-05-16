import { Module } from '@nestjs/common'
import { RealtimeService } from './realtime.service'
import { SnowflakeModule } from '@app/snowflake/snowflake.module'
import { AuthModule } from '@app/auth/auth.module'

@Module({
  providers: [ RealtimeService ],
  exports: [ RealtimeService ],
  imports: [ SnowflakeModule, AuthModule ],
})
export class RealtimeModule {}
