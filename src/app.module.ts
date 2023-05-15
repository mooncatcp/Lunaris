import { Module } from '@nestjs/common'
import { MooncatConfigModule } from '@app/config/config.module'
import { KyselyModule } from '@app/kysely-adapter/kysely.module'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ResponseModule } from '@app/response/response.module'
import { KeystoreModule } from '@app/keystore-server/keystore.module'
import { CryptoModule } from '@app/crypto/crypto.module'
import { MembersModule } from '@app/members/members.module'
import { AuthModule } from '@app/auth/auth.module'
import { ChannelsModule } from '@app/channels/channels.module'
import { SnowflakeModule } from '@app/snowflake/snowflake.module'
import { ChannelsController } from './controllers/channels.controller'
import { KeystoreController } from './controllers/keystore.controller'
import { AuthController } from './controllers/auth.controller'
import { MembersController } from './controllers/members.controller'
import { PermissionOverwritesModule } from '@app/permissions/permissions.module'
import { RolesController } from './controllers/roles.controller'
import { MessagesController } from './controllers/messages.controller'
import { MessagesModule } from '@app/messages/messages.module'

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
    PermissionOverwritesModule,
    MessagesModule,
  ],
  controllers: [
    KeystoreController,
    ChannelsController,
    AuthController,
    MembersController,
    RolesController,
    MessagesController,
  ],
})
export class AppModule {}
