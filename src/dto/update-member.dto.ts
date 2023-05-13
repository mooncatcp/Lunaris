import { IsOptional, IsString } from 'class-validator'

export class UpdateMemberDto {
  /** User's username. */
  @IsString()
  declare username: string

  /** User's avatar */
  @IsString()
  @IsOptional()
  declare avatar?: string
}