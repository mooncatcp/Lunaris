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
import { ChannelsController } from './controllers/channels.controller'
import { ChannelsModule } from '@app/channels'

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
    ChannelsModule,
  ],
  controllers: [ KeystoreController, ChannelsController ],
})
export class AppModule {}
