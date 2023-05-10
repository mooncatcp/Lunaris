import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common'
import { Response, ResponseError } from './response.dto'
import { ErrorCode } from './error-code.enum'
import { FastifyReply } from 'fastify'
import { instanceToPlain } from 'class-transformer'
import WebSocket from 'ws'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: any, host: ArgumentsHost): any {
    this.logger.verbose(`Caught an exception - ${exception}`, exception?.stack ?? 'no stack')
    const response = new Response()
    response.result = null
    response.ok = false
    const error = new ResponseError()
    error.code = ErrorCode.BadRequest
    error.details = []
    error.message = 'aaa'
    response.errors = [
      error,
    ]
    const asString = JSON.stringify(instanceToPlain(response))

    if (host.getType() === 'http') {
      const httpHost = host.switchToHttp()
      const reply = httpHost.getResponse<FastifyReply>()
      reply.status(400).header('Content-Type', 'application/json').send(asString)
    } else if (host.getType() === 'ws') {
      const wsHost = host.switchToWs()
      const socket = wsHost.getClient<WebSocket>()
      socket.send(asString)
    }
  }
}