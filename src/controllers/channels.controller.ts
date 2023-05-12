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


@Controller('channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly auth: AuthService,
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
    const id = ((Math.random() * 1000)|0).toString() // TODO: Flake Generator
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
    if (!name && !parentId && !description) throw new BadRequestException({ code: ErrorCode.NothingToModify })
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