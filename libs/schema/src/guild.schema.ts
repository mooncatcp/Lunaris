export interface Guild {
  name: string
  description?: string
  iconURL?: string
  bannerURL?: string
}

export interface Role {
  id: string
  name: string
  color: number
  permissions: number
  position: number
}

export interface Member {
  id: string
  publicKey: string
  isOwner: boolean
  avatar?: string
  username: string
  isBot: boolean
}

// many-to-many relationships can only be done like this
// typeorm does basically the same
export interface RoleMemberRelation {
  memberId: string
  roleId: string
}

export interface Channel {
  type: 'voice' | 'text' | 'category'
  id: string
  name: string
  parentId?: string
  description?: string
}

export interface Message {
  id: string
  channelId: string
  content: string
  iv: string
  lastUpdatedAt?: Date
  flags: number
  encryptionType: 'e2ee' | 'aes'
}

// we can't add Attachment[] on message
export interface Attachment {
  id: string
  messageId: string
  url: string
}

export interface PermissionOverwrite {
  id: string
  type: 'role' | 'member'
  deny: number
  allow: number
  // memberId and roleId are mutually exclusive
  // separate properties because each column can only
  // link to one table(roles and members are stored in different tables).
  roleId?: string
  memberId?: string
  channelId: string
}