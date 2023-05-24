import { IsArray, IsBase64, IsOptional, IsString } from 'class-validator'

export class UpdateLoginDto {
  @IsString()
  declare authRequestId: string

  @IsString()
  @IsBase64()
  declare signature: string

  @IsString()
  @IsOptional()
  declare username?: string

  @IsString()
  @IsOptional()
  declare avatar?: string

  @IsArray({ each: true })
  @IsOptional()
  declare joinedServers?: string[]
}
