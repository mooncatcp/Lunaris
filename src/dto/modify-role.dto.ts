import { IsNumber, IsString } from 'class-validator'

export class ModifyRoleDto {
  /** The new name of the role. */
  @IsString()
  declare name: string

  /** Permissions of the role. */
  @IsNumber()
  declare permissions: number

  /** Role's color. */
  @IsNumber()
  declare color: number
}