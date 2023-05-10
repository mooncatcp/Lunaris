import { Module } from '@nestjs/common'
import { MooncatConfigModule } from '@app/config'
import { KyselyModule } from '@app/kysely-adapter'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { RequestModule } from '@app/request'
import { ResponseModule } from '@app/response'
import { AuthModule } from '@app/auth-server'
import { AuthController } from './controllers/auth.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [ './.mooncatrc' ],
    }),
    EventEmitterModule.forRoot(),
    MooncatConfigModule,
    KyselyModule,
    ResponseModule,
    RequestModule,
    AuthModule,
  ],
  controllers: [ AuthController ],
})
export class AppModule {}
