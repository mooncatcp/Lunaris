import { IsNumber, IsString } from 'class-validator'

export class ModifyRoleDto {
  @IsString()
  declare name: string
  
  @IsNumber()
  declare permissions: number

  @IsNumber()
  declare color: number
}