import { IsString } from 'class-validator'
import { IsLogin } from '@app/schema/is-login.decorator'

export class CreateLoginDto {
  @IsString()
  declare publicKey: string

  @IsString()
  declare privateKey: string

  @IsString()
  @IsLogin()
  declare login: string

  @IsString()
  declare passwordHash: string

  @IsString()
  declare iv: string
}