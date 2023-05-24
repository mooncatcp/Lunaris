export interface Keystore {
  login: string
  publicKey: string
  privateKey: string
  passwordHash: string
  iv: string

  username?: string
  avatar?: string
  joinedServers?: string[]
}
