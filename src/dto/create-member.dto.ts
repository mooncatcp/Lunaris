import { IsString, IsBase64, IsHexadecimal } from 'class-validator'

export class CreateMemberDto {
  /** Username. */
  @IsString()
  declare username: string

  /** ID of the auth request. */
  @IsString()
  @IsHexadecimal()
  declare authRequestId: string

  /** Signature of data of the auth request with the private key. */
  @IsString()
  @IsBase64()
  declare signature: string

  /** Public key. */
  @IsString()
  @IsBase64()
  declare publicKey: string
}