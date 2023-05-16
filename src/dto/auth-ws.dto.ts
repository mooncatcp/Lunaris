import { IsString } from 'class-validator'

export class AuthWsDto {
  @IsString()
  declare token: string
}
