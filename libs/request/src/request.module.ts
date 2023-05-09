import { Module } from '@nestjs/common'
import { RequestParserService } from './request-parser.service'

@Module({
  providers: [ RequestParserService ],
  exports: [ RequestParserService ],
})
export class RequestModule {}