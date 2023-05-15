import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { MessagesService } from '@app/messages/messages.service'
import { RequireAuth } from '@app/auth/auth.decorator'
import { TokenData } from '@app/auth/token.decorator'
import { TokenPayload } from '@app/auth/token.interface'
import { AuthService } from '@app/auth/auth.service'
import { Permissions } from '@app/permissions/permissions.enum'
import { CreateMessageDto } from '../dto/create-message.dto'
import { UpdateMessageDto } from '../dto/update-message.dto'
import { ErrorCode } from '@app/response/error-code.enum'
import { ChannelsService } from '@app/channels/channels.service'

@Controller('/channels/:channelId/messages')
@ApiTags('Messages')
export class MessagesController {
  constructor(
    private readonly auth: AuthService,
    private readonly messagesService: MessagesService,
    private readonly channelsService: ChannelsService,
  ) {}

  @Get()
  @RequireAuth()
  async getMessages(
    @Param('channelId') channel: string,
    @TokenData() tokenData: TokenPayload,
    @Query('before') before?: string,
    @Query('after') after?: string,
    @Query('limit') limit?: number,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermission(Permissions.READ_MESSAGES, channel)

    if (await this.channelsService.getChannelType(channel) !== 'text')
      throw new BadRequestException({ code: ErrorCode.InvalidChannelType, details: [ 'channel type not text' ] })

    return await this.messagesService.getMessages(limit ?? 100, before, after) ?? []
  }

  @Get(':id')
  @RequireAuth()
  async getMessage(
    @Param('channelId') channel: string,
    @Param('id') id: string,
    @TokenData() tokenData: TokenPayload,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermission(Permissions.READ_MESSAGES, channel)

    if (await this.channelsService.getChannelType(channel) !== 'text')
      throw new BadRequestException({ code: ErrorCode.InvalidChannelType, details: [ 'channel type not text' ] })

    return await this.messagesService.getMessage(id)
  }

  @Post()
  @RequireAuth()
  async createMessage(
    @Param('channelId') channel: string,
    @TokenData() tokenData: TokenPayload,
    @Body() data: CreateMessageDto,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermission(Permissions.SEND_MESSAGES, channel)

    if (await this.channelsService.getChannelType(channel) !== 'text')
      throw new BadRequestException({ code: ErrorCode.InvalidChannelType, details: [ 'channel type not text' ] })

    const { content, flags, referenceMessageId, attachments } = data

    return await this.messagesService.createMessage(
      channel, content, flags,
      tokenData.userId, attachments, referenceMessageId,
    )
  }

  @Patch(':id')
  @RequireAuth()
  async updateMessage(
    @Param('channelId') channel: string,
    @Param('id') id: string,
    @TokenData() tokenData: TokenPayload,
    @Body() data: UpdateMessageDto,
  ) {
    const { content, attachments } = data

    await this.messagesService.modifyMessage(id, tokenData.userId, content, attachments)
    return true
  }

  @Delete(':id')
  @RequireAuth()
  async deleteMessage(
    @Param('channelId') channel: string,
    @Param('id') id: string,
    @TokenData() tokenData: TokenPayload,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)

    if (await this.channelsService.getChannelType(channel) !== 'text')
      throw new BadRequestException({ code: ErrorCode.InvalidChannelType, details: [ 'channel type not text' ] })

    const message = await this.messagesService.getMessage(id)
    if (!message) throw new NotFoundException({ code: ErrorCode.UnknownMessage })
    if (message.authorId !== tokenData.userId) await authr.hasPermission(Permissions.MANAGE_MESSAGES, channel)

    await this.messagesService.deleteMessage(id)
    return true
  }
}