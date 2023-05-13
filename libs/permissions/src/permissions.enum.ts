export enum Permissions {
  MANAGE_ROLES = 1 << 0,
  BAN_MEMBERS = 1 << 1,
  MUTE_MEMBERS = 1 << 2,
  MANAGE_MESSAGES = 1 << 3,
  MANAGE_CHANNELS = 1 << 4,
  READ_MESSAGES = 1 << 5,
  SEND_MESSAGES = 1 << 6,
  MANAGE_CHANNEL = 1 << 7,
}

export const channelPermissions = [
  Permissions.MANAGE_MESSAGES,
  Permissions.MANAGE_CHANNEL,
  Permissions.READ_MESSAGES,
  Permissions.SEND_MESSAGES,
]

export const DEFAULT_GUILD_PERMISSIONS = Permissions.SEND_MESSAGES | Permissions.READ_MESSAGES

export const ALL = Permissions.MANAGE_ROLES |
  Permissions.BAN_MEMBERS |
  Permissions.MUTE_MEMBERS |
  Permissions.MANAGE_MESSAGES |
  Permissions.MANAGE_CHANNELS |
  Permissions.READ_MESSAGES |
  Permissions.SEND_MESSAGES

export const has = (check: number, permission: number) => {
  return (check & permission) === permission
}

export const merge = (one: number, two: number) =>
  one & two

export const remove = (from: number, which: number) =>
  from & (~which)

export const toArray = (permissions: number) => {
  const result: string[] = []
  for (const [ key, value ] of Object.entries(Permissions)) {
    if (has(permissions, value as Permissions)) result.push(key)
  }
  return result
}

export const checkValid = (permissions: number, list: number[]) =>
  toArray(permissions).every(p => toArray(list.reduce((a, b) => a | b, 0)).includes(p))

export const resolve = (allow: number, deny: number) =>
  allow | (~deny)
