import { Body } from '@nestjs/common'
import { RequestParserPipe } from './request-parser.pipe'
import { ClassConstructor } from 'class-transformer'

export const MooncatBody = <T extends object>
  (type: ClassConstructor<T>, signatureRequired = true) =>
    Body(new RequestParserPipe(type, signatureRequired))