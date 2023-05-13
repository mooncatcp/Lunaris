import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AUTH_DECORATOR_KEY } from '@app/auth/auth.decorator'
import { FastifyRequest } from 'fastify'
import { TOKEN_KEY, WithToken } from '@app/auth/token.interface'
import { TokenService } from '@app/auth/token.service'
import { ErrorCode } from '@app/response/error-code.enum'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireAuth = this.reflector.getAllAndOverride(AUTH_DECORATOR_KEY, [
      context.getHandler(),
      context.getClass,
    ])

    const fastifyRequest =
      context.switchToHttp().getRequest<WithToken<FastifyRequest>>()

    if (fastifyRequest.headers.authorization === undefined)
      if (requireAuth)
        throw new UnauthorizedException({ code: ErrorCode.InvalidTokenFormat })
      else
        return true

    fastifyRequest[TOKEN_KEY] = this.tokens.decodeToken(fastifyRequest.headers.authorization)
    return true
  }
}