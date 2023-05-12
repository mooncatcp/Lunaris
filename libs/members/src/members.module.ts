import { forwardRef, Module } from '@nestjs/common'
import { MembersService } from '@app/members/members.service'
import { KyselyModule } from '@app/kysely-adapter/kysely.module'
import { RolesService } from '@app/members/roles.service'
import { AuthModule } from '@app/auth/auth.module'
import { CryptoModule } from '@app/crypto/crypto.module'
import { SnowflakeModule } from '@app/snowflake/snowflake.module'

@Module({
  providers: [ MembersService, RolesService ],
  exports: [ MembersService, RolesService ],
  imports: [ KyselyModule, forwardRef(() => AuthModule), CryptoModule, SnowflakeModule ],
})
export class MembersModule {}
