import { Module } from '@nestjs/common'
import { MembersService } from './members.service'
import { KyselyModule } from '@app/kysely-adapter'
import { RolesService } from './roles.service'

@Module({
  providers: [ MembersService, RolesService ],
  exports: [ MembersService, RolesService ],
  imports: [ KyselyModule ],
})
export class MembersModule {}
