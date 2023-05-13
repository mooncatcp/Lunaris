import { Module } from '@nestjs/common'
import { PermissionOverwritesService } from '@app/permissions/permission-overwrites.service'
import { KyselyModule } from '@app/kysely-adapter/kysely.module'
import { SnowflakeModule } from '@app/snowflake/snowflake.module'

@Module({
  providers: [ PermissionOverwritesService ],
  exports: [ PermissionOverwritesService ],
  imports: [ KyselyModule, SnowflakeModule ],
})
export class PermissionOverwritesModule {}
