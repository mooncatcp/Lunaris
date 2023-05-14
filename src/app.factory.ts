import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { WsAdapter } from '@nestjs/platform-ws'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const createApp = async (log = true) => {
  const app =
    await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({ ignoreTrailingSlash: true }),
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

  const config = new DocumentBuilder()
    .setTitle('Mooncat Protocol')
    .addBearerAuth()
    .setDescription('This page contains API routes that are available on this machine')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  return app
}