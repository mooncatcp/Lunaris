import { IsString } from 'class-validator'
import { IsLogin } from '@app/schema/is-login.decorator'

export class CreateLoginDto {
  /** User's public key. */
  @IsString()
  declare publicKey: string

  /** Client implementation dependent. */
  @IsString()
  declare privateKey: string

  /** User's login. */
  @IsString()
  @IsLogin()
  declare login: string

  /** Client implementation dependent. */
  @IsString()
  declare passwordHash: string

  /** Client implementation dependent. */
  @IsString()
  declare iv: string
}