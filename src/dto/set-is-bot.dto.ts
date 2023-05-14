import { IsBoolean } from 'class-validator'

export class SetIsBotDto {
  /** New state. */
  @IsBoolean()
  declare isBot: boolean
}