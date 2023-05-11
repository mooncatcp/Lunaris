import { Module } from '@nestjs/common'
import { MooncatConfigModule } from '@app/config'
import { KyselyModule } from '@app/kysely-adapter'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ResponseModule } from '@app/response'
import { KeystoreModule } from '@app/keystore-server'
import { KeystoreController } from './controllers/keystore.controller'
import { CryptoModule } from '@app/crypto'
import { MembersModule } from '@app/members'
import { AuthModule } from '@app/auth'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [ './.mooncatrc' ],
    }),
    EventEmitterModule.forRoot(),
    MooncatConfigModule,
    KyselyModule,
    ResponseModule,
    KeystoreModule,
    CryptoModule,
    MembersModule,
    AuthModule,
  ],
  controllers: [ KeystoreController ],
})
export class AppModule {}
