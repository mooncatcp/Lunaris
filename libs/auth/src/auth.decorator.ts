import { SetMetadata } from '@nestjs/common'

export const AUTH_DECORATOR_KEY = Symbol('REQUIRE_AUTH')
export const RequireAuth = (value = true) =>
  SetMetadata(AUTH_DECORATOR_KEY, value)