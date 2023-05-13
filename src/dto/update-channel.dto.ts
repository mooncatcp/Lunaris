import { IsString } from 'class-validator'

export class UpdateChannelDto {
  @IsString()
  declare name: string

  @IsString()
  declare parentId?: string

  @IsString()
  declare description?: string
}