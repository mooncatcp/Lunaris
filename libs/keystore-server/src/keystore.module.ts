import { Module } from '@nestjs/common'
import { KeystoreService } from '@app/keystore-server/keystore.service'
import { KyselyModule } from '@app/kysely-adapter/kysely.module'
import { CryptoModule } from '@app/crypto/crypto.module'

@Module({
  providers: [ KeystoreService ],
  exports: [ KeystoreService ],
  imports: [ KyselyModule, CryptoModule ],
})
export class KeystoreModule {}
