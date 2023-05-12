import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { TOKEN_KEY, WithToken } from '@app/auth/token.interface'

export const TokenData = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const tokenData = context.switchToHttp().getRequest<WithToken<object>>()
    return tokenData[TOKEN_KEY]
  },
)