import { Module } from '@nestjs/common'
import { MooncatConfigModule } from '@app/config'
import { KyselyModule } from '@app/kysely-adapter'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [ './.mooncatrc' ],
    }),
    EventEmitterModule.forRoot(),
    MooncatConfigModule,
    KyselyModule,
  ],
})
export class AppModule {}
