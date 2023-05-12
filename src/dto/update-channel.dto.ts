import { IsOptional, IsString } from 'class-validator'

export class UpdateChannelDto {
  @IsString()
  @IsOptional()
  declare name: string

  @IsString()
  @IsOptional()
  declare parentId?: string

  @IsString()
  @IsOptional()
  declare description?: string
}