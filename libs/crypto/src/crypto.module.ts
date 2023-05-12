import { Module } from '@nestjs/common'
import { CryptoService } from '@app/crypto/crypto.service'

@Module({
  providers: [ CryptoService ],
  exports: [ CryptoService ],
})
export class CryptoModule {}
