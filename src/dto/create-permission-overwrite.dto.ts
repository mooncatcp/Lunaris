import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreatePermissionOverwriteDto {
  /** ID of the member or role. */
  @IsString()
  @IsNotEmpty()
  declare id: string

  /** Type of the member or role. */
  @IsString()
  @IsNotEmpty()
  declare type: 'member' | 'role'

  /** Bitfield of allowed permissions. */
  @IsNumber()
  declare allow: number

  /** Bitfield of denied permissions. */
  @IsNumber()
  declare deny: number
}