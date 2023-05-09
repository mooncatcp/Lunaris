import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { WsAdapter } from '@nestjs/platform-ws'

async function bootstrap() {
  const app =
    await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
  app.useWebSocketAdapter(new WsAdapter(app))
  app.enableCors()
  
  await app.listen(3000)
}
bootstrap()
