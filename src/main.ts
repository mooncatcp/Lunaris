import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { WsAdapter } from '@nestjs/platform-ws'
import { MooncatConfigService } from '@app/config/config.service'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app =
    await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
  app.useWebSocketAdapter(new WsAdapter(app))
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe())
  const config = app.get(MooncatConfigService)
  
  await app.listen(config.appPort)
}
bootstrap()
