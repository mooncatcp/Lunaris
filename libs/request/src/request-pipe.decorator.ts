import { Body } from '@nestjs/common'
import { RequestParserPipe } from './request-parser.pipe'
import { ClassConstructor } from 'class-transformer'

export const MooncatBody = <T>(type: ClassConstructor<T>) => Body(new RequestParserPipe(type))