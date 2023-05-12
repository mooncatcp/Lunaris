import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateChannelDto {
    @IsString()
    @IsNotEmpty()
    declare name: string

    @IsString()
    @IsNotEmpty()
    declare type: 'text' | 'voice' | 'category'

    @IsString()
    @IsOptional()
    declare parentId?: string
    
    @IsString()
    @IsOptional()
    declare description?: string
}