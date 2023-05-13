import { IsOptional, IsString } from 'class-validator'

export class UpdateMemberDto {
  @IsString()
  declare username: string
  
  @IsString()
  @IsOptional()
  declare avatar?: string
}