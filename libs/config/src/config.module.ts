import { Module } from '@nestjs/common'
import { MooncatConfigService } from '@app/config/config.service'
import { ConfigModule } from '@nestjs/config'
import { CryptoModule } from '@app/crypto/crypto.module'

@Module({
  exports: [ MooncatConfigService ],
  providers: [ MooncatConfigService ],
  imports: [ ConfigModule, CryptoModule ],
})
export class MooncatConfigModule {}