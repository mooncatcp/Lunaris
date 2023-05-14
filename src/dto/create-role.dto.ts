import { IsString } from 'class-validator'

export class CreateRoleDto {
  /** Name of the role. */
  @IsString()
  declare name: string
}