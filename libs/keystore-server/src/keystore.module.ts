import { Module } from '@nestjs/common'
import { KeystoreService } from './keystore.service'
import { KyselyModule } from '@app/kysely-adapter'
import { CryptoModule } from '@app/crypto'

@Module({
  providers: [ KeystoreService ],
  exports: [ KeystoreService ],
  imports: [ KyselyModule, CryptoModule ],
})
export class KeystoreModule {}
