import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { Response, ResponseError } from '@app/response/response.dto'
import { ErrorCode } from '@app/response/error-code.enum'
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
    response.errors = []

    let responseCode = 400

    if (exception instanceof HttpException) {
      const error = new ResponseError()
      error.code = ErrorCode.UnknownError
      error.message = exception.message
      error.details = []

      if (exception.getResponse() instanceof Object) {
        const body = (exception.getResponse() as { code?: ErrorCode; details?: any[]; message?: any })
        if (body?.code) error.code = body.code
        let details = body.details
        if (Array.isArray(body.message)) {
          details = body.message
        }

        error.details.push(...(details ?? []))
      }

      response.errors.push(error)
      responseCode = exception.getStatus()
    } else if (exception instanceof Error) responseCode = 500
    if (host.getType() === 'http') {
      const httpHost = host.switchToHttp()
      const reply = httpHost.getResponse<FastifyReply>()

      reply.status(responseCode).header('Content-Type', 'application/json').send(instanceToPlain(response))
    } else if (host.getType() === 'ws') {
      const wsHost = host.switchToWs()
      const socket = wsHost.getClient<WebSocket>()

      socket.send(JSON.stringify({
        event: 'error',
        data: response.errors,
      }))
      socket.close()
    }
  }
}
