import { AuthService } from './auth.service'

export class Authorizer {
  constructor(
    private readonly authService: AuthService,
    private readonly token: string,
  ) {}
}