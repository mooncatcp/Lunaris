import { Expose } from 'class-transformer'
import { IsString } from 'class-validator'

export class RawRequest {
  @Expose({ name: 'p' })
  @IsString()
  declare public: string

  @Expose({ name: 'd' })
  @IsString()
  declare data: string

  @Expose({ name: 's' })
  @IsString()
  declare signature: string
}