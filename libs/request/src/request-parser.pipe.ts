import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { RequestExceptionType, RequestException } from './request.exception'
import { RequestParserService } from './request-parser.service'
import { ClassConstructor } from 'class-transformer'
import { RawRequest } from './raw-request.dto'

export class MooncatBodyData<T> {
  declare data: T
  declare rawRequest: RawRequest
}

@Injectable()
export class RequestParserPipe implements PipeTransform {
  constructor(private readonly type: ClassConstructor<any>) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<MooncatBodyData<any>> {
    const parser = new RequestParserService()
    if (metadata.type !== 'body') {
      throw new RequestException(RequestExceptionType.PARSE_NON_BODY)
    } else if (typeof value !== 'object') {
      throw new RequestException(RequestExceptionType.EXPECTED_OBJECT)
    }
    const rawRequest = await parser.getRawRequest(value)

    const data = await parser.fromObject(rawRequest, this.type)
    const result = new MooncatBodyData()
    result.data = data
    result.rawRequest = rawRequest

    return result
  }
}