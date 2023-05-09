import { Module } from '@nestjs/common'
import { MooncatConfigService } from './config.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  exports: [ MooncatConfigService ],
  providers: [ MooncatConfigService ],
  imports: [ ConfigModule ],
})
export class MooncatConfigModule {}