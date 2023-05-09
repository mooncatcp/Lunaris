import { Injectable } from '@nestjs/common'
import { RawRequest } from './raw-request.dto'
import * as crypto from 'crypto'
import { RequestException, RequestExceptionType } from './request.exception'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validateOrReject } from 'class-validator'

@Injectable()
export class RequestParserService {
  async fromObject<T extends object>(obj: object, c: ClassConstructor<T>): Promise<T> {
    console.log(obj)
    const rawObject = plainToInstance(RawRequest, obj)
    await validateOrReject(rawObject)

    return this.parse(rawObject, c)
  }

  async parse<T extends object>(req: RawRequest, c: ClassConstructor<T>): Promise<T> {
    const publicKey = crypto.createPublicKey(req.public)
    const signature = Buffer.from(req.signature, 'base64')
    const data = Buffer.from(req.data)
    const ok = crypto.verify(
      'sha256',
      data,
      publicKey,
      signature,
    )

    if (!ok) {
      throw new RequestException(RequestExceptionType.INVALID_SIGNATURE)
    }
    const decodedData = plainToInstance(c, JSON.parse(data.toString()) as object)

    await validateOrReject(decodedData)

    return decodedData
  }
}