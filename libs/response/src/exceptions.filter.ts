import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { Response, ResponseError } from '@app/response/response.dto'
import { ErrorCode } from '@app/response/error-code.enum'
import { FastifyReply } from 'fastify'
import { instanceToPlain } from 'class-transformer'
import WebSocket from 'ws'
import { ValidationError } from 'class-validator'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: any, host: ArgumentsHost): any {
    this.logger.verbose(`Caught an exception - ${exception}`, exception?.stack ?? 'no stack')
    const response = new Response()
    response.result = null
    response.ok = false
    response.errors = []
    const asString = () => JSON.stringify(instanceToPlain(response))

    let responseCode = 400

    if (exception instanceof HttpException) {
      const error = new ResponseError()
      error.code = ErrorCode.UnknownError
      error.message = exception.message
      error.details = []

      if (exception.getResponse() instanceof Object) {
        const body = (exception.getResponse() as { code?: ErrorCode; details?: any[] })
        if (body?.code) error.code = body.code
        if (body?.details) error.details = body.details
      }

      response.errors.push(error)
      responseCode = exception.getStatus()
    } else if (Array.isArray(exception) && exception.length > 0 && exception[0] instanceof ValidationError) {
      responseCode = 400
      for (const error of (exception as ValidationError[])) {
        const responseError = new ResponseError()
        responseError.code = ErrorCode.InvalidKeyFormat
        responseError.message = error.toString()
        responseError.details = [ error.property ]
        response.errors.push(responseError)
      }
    } else if (exception instanceof Error) responseCode = 500

    if (host.getType() === 'http') {
      const httpHost = host.switchToHttp()
      const reply = httpHost.getResponse<FastifyReply>()

      reply.status(responseCode).header('Content-Type', 'application/json').send(asString())
    } else if (host.getType() === 'ws') {
      const wsHost = host.switchToWs()
      const socket = wsHost.getClient<WebSocket>()

      socket.send(asString())
    }
  }
}