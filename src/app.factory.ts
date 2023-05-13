import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { WsAdapter } from '@nestjs/platform-ws'
import { ValidationPipe } from '@nestjs/common'

export const createApp = async (log = true) => {
  const app =
    await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
      {
        logger: log ? [
          'error',
          'warn',
          'log',
          'verbose',
          'debug',
        ] : [],
      },
    )
  app.useWebSocketAdapter(new WsAdapter(app))
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe())

  return app
}