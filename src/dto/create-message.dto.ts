import { ArrayMaxSize, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateMessageDto {
  /** Message content. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  declare content: string

  /** Message flags. */
  @IsNumber()
  @IsNotEmpty()
  declare flags: number

  /** Message Attachments URLs. */
  @IsString({ each: true })
  @IsOptional()
  @ArrayMaxSize(10)
  declare attachments?: string[]

  /** Reply/Reference message ID. */
  @IsString()
  @IsOptional()
  declare referenceMessageId?: string
}