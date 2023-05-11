export enum Permissions {
  MANAGE_ROLES = 1 << 0,
  BAN_MEMBERS = 1 << 1,
  MUTE_MEMBERS = 1 << 2,
  MANAGE_MESSAGES = 1 << 3,
}

export const DEFAULT_GUILD_PERMISSIONS = 0

export const has = (check: number, permission: number) =>
  (check & permission) === check

export const merge = (one: number, two: number) =>
  one & two

export const remove = (from: number, which: number) =>
  from & (~which)