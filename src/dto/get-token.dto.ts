import { IsBase64, IsHexadecimal, IsString } from 'class-validator'

export class GetTokenDto {
  /** ID of the auth request. */
  @IsString()
  @IsHexadecimal()
  declare authRequestId: string

  /** User's public key. */
  @IsString()
  @IsBase64()
  declare publicKey: string

  /** Data of the auth request signed with the private key. */
  @IsString()
  @IsBase64()
  declare signature: string
}