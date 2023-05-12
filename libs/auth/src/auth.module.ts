import { forwardRef, Module } from '@nestjs/common'
import { AuthService } from '@app/auth/auth.service'
import { MembersModule } from '@app/members/members.module'
import { TokenService } from '@app/auth/token.service'
import { MooncatConfigModule } from '@app/config/config.module'
import { CryptoModule } from '@app/crypto/crypto.module'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from '@app/auth/auth.guard'

@Module({
  providers: [
    AuthService,
    TokenService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [ AuthService, TokenService ],
  imports: [ forwardRef(() => MembersModule), MooncatConfigModule, CryptoModule ],
})
export class AuthModule {}
