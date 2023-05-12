import { Module } from '@nestjs/common'
import { MooncatConfigModule } from '@app/config/config.module'
import { KyselyModule } from '@app/kysely-adapter/kysely.module'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ResponseModule } from '@app/response/response.module'
import { KeystoreModule } from '@app/keystore-server/keystore.module'
import { KeystoreController } from './controllers/keystore.controller'
import { CryptoModule } from '@app/crypto/crypto.module'
import { MembersModule } from '@app/members/members.module'
import { AuthModule } from '@app/auth/auth.module'
import { ChannelsController } from './controllers/channels.controller'
import { ChannelsModule } from '@app/channels/channels.module'
import { SnowflakeModule } from '@app/snowflake/snowflake.module'

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
    SnowflakeModule,
  ],
  controllers: [ KeystoreController, ChannelsController ],
})
export class AppModule {}
