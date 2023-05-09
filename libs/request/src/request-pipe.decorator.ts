import { Body } from '@nestjs/common'
import { RequestParserPipe } from './request-parser.pipe'

export const MooncatBody = () => Body(new RequestParserPipe())