import { IsArray, IsString } from 'class-validator'

export class AuthWsDto {
  @IsString()
  declare token: string

  @IsArray()
  declare interestedIn: string[]
}
