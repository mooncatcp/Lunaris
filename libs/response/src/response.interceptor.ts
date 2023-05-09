import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { map, Observable } from 'rxjs'
import { Response } from './response.dto'
import { instanceToPlain } from 'class-transformer'

export class ResponseSerializerInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    return next.handle().pipe(
      map(x => {
        const response = new Response()
        response.ok = true
        response.errors = []
        response.result = x
        
        return instanceToPlain(response)
      }),
    )
  }
}
