import { IsBase64, IsHexadecimal, IsString } from 'class-validator'

export class GetTokenDto {
  @IsString()
  @IsHexadecimal()
  declare authRequestId: string
  
  @IsString()
  @IsBase64()
  declare signature: string
}