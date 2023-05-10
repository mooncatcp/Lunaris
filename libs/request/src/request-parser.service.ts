import { Injectable } from '@nestjs/common'
import { RawRequest } from './raw-request.dto'
import * as crypto from 'crypto'
import { RequestException, RequestExceptionType } from './request.exception'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validateOrReject } from 'class-validator'

@Injectable()
export class RequestParserService {
  async getRawRequest(obj: object): Promise<RawRequest> {
    const rawObject = plainToInstance(RawRequest, obj)
    await validateOrReject(rawObject)

    return rawObject
  }

  async fromObject<T extends object>(obj: object, c: ClassConstructor<T>): Promise<T> {
    const req = await this.getRawRequest(obj)

    return this.parse(req, c)
  }

  async parse<T extends object>(req: RawRequest, c: ClassConstructor<T>): Promise<T> {
    const publicKey = req.public
    const signature = req.signature
    const data = req.data

    if (publicKey !== null && signature !== null) {
      const ok = crypto.verify(
        'sha256',
        data,
        publicKey,
        signature,
      )

      if (!ok) {
        throw new RequestException(RequestExceptionType.INVALID_SIGNATURE)
      }
    }

    const decodedData = plainToInstance(c, JSON.parse(data.toString()) as object)

    await validateOrReject(decodedData)

    return decodedData
  }
}