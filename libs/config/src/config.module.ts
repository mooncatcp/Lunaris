import { Module } from '@nestjs/common'
import { MooncatConfigService } from './config.service'
import { ConfigModule } from '@nestjs/config'
import { CryptoModule } from '@app/crypto'

@Module({
  exports: [ MooncatConfigService ],
  providers: [ MooncatConfigService ],
  imports: [ ConfigModule, CryptoModule ],
})
export class MooncatConfigModule {}