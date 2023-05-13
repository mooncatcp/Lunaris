import { IsNumber } from 'class-validator'

export class UpdatePermissionOverwriteDto {
  /** Bitfield of allowed permissions. */
  @IsNumber()
  declare allow: number

  /** Bitfield of denied permissions. */
  @IsNumber()
  declare deny: number
}