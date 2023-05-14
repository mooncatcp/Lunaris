import { forwardRef, Module } from '@nestjs/common'
import { PermissionOverwritesService } from '@app/permissions/permission-overwrites.service'
import { KyselyModule } from '@app/kysely-adapter/kysely.module'
import { SnowflakeModule } from '@app/snowflake/snowflake.module'
import { MembersModule } from '@app/members/members.module'
import { ChannelsModule } from '@app/channels/channels.module'

@Module({
  providers: [ PermissionOverwritesService ],
  exports: [ PermissionOverwritesService ],
  imports: [ KyselyModule, SnowflakeModule, forwardRef(() => MembersModule), ChannelsModule ],
})
export class PermissionOverwritesModule {}
