import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { RequestExceptionType, RequestException } from './request.exception'
import { RequestParserService } from './request-parser.service'

@Injectable()
export class RequestParserPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (metadata.metatype === undefined) {
      throw new RequestException(RequestExceptionType.EXPECTED_TYPE)
    } else if (metadata.type !== 'body') {
      throw new RequestException(RequestExceptionType.PARSE_NON_BODY)
    } else if (typeof value !== 'object') {
      throw new RequestException(RequestExceptionType.EXPECTED_OBJECT)
    }

    return new RequestParserService().fromObject(value, metadata.metatype)
  }
}