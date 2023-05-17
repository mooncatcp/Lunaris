import { IsArray, IsNumber, IsString, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class PositionDto {
  @IsString()
  declare id: string
  
  @IsNumber()
  @Min(0)
  declare position: number
}

export class ModifyPositionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionDto)
  declare positions: PositionDto[]
}
