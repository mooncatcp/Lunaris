import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { ResponseSerializerInterceptor } from './response.interceptor'
import { AllExceptionsFilter } from './exceptions.filter'

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class ResponseModule {}