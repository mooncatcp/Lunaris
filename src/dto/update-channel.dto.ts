import { IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateChannelDto {
  /** Channel name. */
  @IsString()
  declare name: string

  /** Channel's parent. Must be a category. */
  @IsString()
  @IsOptional()
  declare parentId?: string

  /** Channel's description, */
  @IsString()
  @IsOptional()
  declare description?: string
}
