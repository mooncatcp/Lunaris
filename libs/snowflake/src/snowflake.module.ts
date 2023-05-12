import { Module } from '@nestjs/common'
import { SnowflakeService } from '@app/snowflake/snowflake.service'

@Module({
  providers: [ SnowflakeService ],
  exports: [ SnowflakeService ],
})
export class SnowflakeModule {}
