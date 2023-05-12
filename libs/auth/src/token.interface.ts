export interface Token extends TokenPayload {
  signature: Buffer
}

export interface TokenPayload {
  userId: string
  validUntil: Date
}

export const TOKEN_KEY = Symbol('TOKEN_KEY')
export type WithToken<T> = T & { [TOKEN_KEY]: TokenPayload }