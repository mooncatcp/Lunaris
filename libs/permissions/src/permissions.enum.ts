export enum Permissions {
  MANAGE_ROLES = 1 << 0,
  BAN_MEMBERS = 1 << 1,
  MUTE_MEMBERS = 1 << 2,
  MANAGE_MESSAGES = 1 << 3,
  MANAGE_CHANNELS = 1 << 4,
  READ_MESSAGES = 1 << 5,
  SEND_MESSAGES = 1 << 6,
}

export const DEFAULT_GUILD_PERMISSIONS = Permissions.SEND_MESSAGES | Permissions.READ_MESSAGES

export const ALL = Permissions.MANAGE_ROLES |
  Permissions.BAN_MEMBERS |
  Permissions.MUTE_MEMBERS |
  Permissions.MANAGE_MESSAGES |
  Permissions.MANAGE_CHANNELS |
  Permissions.READ_MESSAGES |
  Permissions.SEND_MESSAGES

export const has = (check: number, permission: number) =>
  (check & permission) === check

export const merge = (one: number, two: number) =>
  one & two

export const remove = (from: number, which: number) =>
  from & (~which)