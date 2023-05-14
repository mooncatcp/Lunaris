import { IsString } from 'class-validator'

export class CreateRoleDto {
  @IsString()
  declare name: string
}