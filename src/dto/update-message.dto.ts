import { ArrayMaxSize, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateMessageDto {
  /** Message content. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  declare content: string

  /** Message Attachments URLs. */
  @IsString({ each: true })
  @IsOptional()
  @ArrayMaxSize(10)
  declare attachments?: string[]
}