import { IsString } from 'class-validator'

export class UpdateChannelDto {
  /** Channel name. */
  @IsString()
  declare name: string

  /** Channel's parent. Must be a category. */
  @IsString()
  declare parentId?: string

  /** Channel's description, */
  @IsString()
  declare description?: string
}