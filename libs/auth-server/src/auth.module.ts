import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { KyselyModule } from '@app/kysely-adapter'

@Module({
  providers: [ AuthService ],
  exports: [ AuthService ],
  imports: [ KyselyModule ],
})
export class AuthModule {}
