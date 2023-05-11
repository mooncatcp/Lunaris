import { Keystore } from './keystore.schema'
import {
  Attachment,
  Channel,
  Guild,
  Member,
  Message,
  PermissionOverwrite,
  Role,
  RoleMemberRelation,
} from './guild.schema'

// this schema only represents how data is stored, not how it is sent
// i don't think that it is necessary to create DTOs for responses though.
// kysely gives rich typing + we can use swagger, which will generate api
// docs for us

export interface DB {
  keystore: Keystore
  guild: Guild
  role: Role
  member: Member
  roleMember: RoleMemberRelation
  channel: Channel
  message: Message
  permissionOverwrite: PermissionOverwrite
  attachment: Attachment
}
