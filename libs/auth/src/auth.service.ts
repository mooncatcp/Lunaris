import { Injectable } from '@nestjs/common'
import { Authorizer } from './authorizer'

@Injectable()
export class AuthService {
  forToken(token: string): Authorizer {
    return new Authorizer(this, token)
  }
}
