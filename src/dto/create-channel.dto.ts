import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateChannelDto {
  /** Channel name. */
  @IsString()
  @IsNotEmpty()
  declare name: string

  /** Channel type. */
  @IsString()
  @IsNotEmpty()
  declare type: 'text' | 'voice' | 'category'

  /** Channel's parent. Must be a category. */
  @IsString()
  @IsOptional()
  declare parentId?: string

  /** Description for the channel. */
  @IsString()
  @IsOptional()
  declare description?: string
}