import { IsString, IsBase64, IsHexadecimal } from 'class-validator'

export class CreateMemberDto {
  @IsString()
  declare username: string
  
  @IsString()
  @IsHexadecimal()
  declare authRequestId: string

  @IsString()
  @IsBase64()
  declare signature: string

  @IsString()
  @IsBase64()
  declare publicKey: string
}