import {
  BadRequestException,
  Body,
  Controller, Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { ChannelsService } from '@app/channels/channels.service'
import { ErrorCode } from '@app/response/error-code.enum'
import { CreateChannelDto } from '../dto/create-channel.dto'
import { UpdateChannelDto } from '../dto/update-channel.dto'
import { AuthService } from '@app/auth/auth.service'
import { SnowflakeService } from '@app/snowflake/snowflake.service'


@Controller('channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly auth: AuthService,
    private readonly snowflake: SnowflakeService,
  ) {}

  @Get()
  async getAllChannels() {
    return await this.channelsService.getAllChannels()
  }

  @Get(':id')
  async getChannel(@Param('id') id: string) {
    const channel = await this.channelsService.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })
    else return channel
  }

  @Post()
  async createChannel(@Body() data: CreateChannelDto) {
    const id = this.snowflake.nextStringId()
    const { name, type, parentId, description } = data

    await this.channelsService.createChannel({
      id,
      name,
      type,
      parentId,
      description,
    })

    return null
  }

  @Patch(':id')
  async modifyChannel(@Param('id') id: string, @Body() data: UpdateChannelDto) {
    const channel = await this.channelsService.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    const { name, parentId, description } = data
    await this.channelsService.modifyChannel(id, { name, parentId, description })
    return null
  }

  @Delete(':id')
  async deleteChannel(@Param('id') id: string) {
    const channel = await this.channelsService.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    await this.channelsService.deleteChannel(id)
    return null
  }
}