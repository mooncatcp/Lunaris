import { Controller, Module, Post } from '@nestjs/common'
import { MooncatConfigModule } from '@app/config'
import { KyselyModule } from '@app/kysely-adapter'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MooncatBody, MooncatBodyData, RequestModule } from '@app/request'
import { ResponseModule } from '@app/response'

export class Something {
  declare hello: string
}

@Controller()
class Ctrl {
  @Post()
  async lol(@MooncatBody(Something) lol: MooncatBodyData<Something>) {
    console.log('a')
    console.log(lol.data, lol.rawRequest)
  }
}

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
  ],
  controllers: [ Ctrl ],
})
export class AppModule {}
