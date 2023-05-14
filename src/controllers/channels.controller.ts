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
import { ApiTags } from '@nestjs/swagger'
import { RequireAuth } from '@app/auth/auth.decorator'
import { TokenData } from '@app/auth/token.decorator'
import { TokenPayload } from '@app/auth/token.interface'
import { Permissions } from '@app/permissions/permissions.enum'
import { PermissionOverwritesService } from '@app/permissions/permission-overwrites.service'
import { CreatePermissionOverwriteDto } from '../dto/create-permission-overwrite.dto'
import { UpdatePermissionOverwriteDto } from '../dto/update-permission-overwrite.dto'


@Controller('channels')
@ApiTags('Channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly auth: AuthService,
    private readonly snowflake: SnowflakeService,
    private readonly permissionOverwrites: PermissionOverwritesService,
  ) {}

  /** Get all channels */
  @Get()
  @RequireAuth()
  async getAllChannels() {
    return await this.channelsService.getAllChannels()
  }

  /** Get a single channel */
  @Get(':id')
  @RequireAuth()
  async getChannel(@Param('id') id: string) {
    const channel = await this.channelsService.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })
    else return channel
  }

  /** Create a channel */
  @Post()
  @RequireAuth()
  async createChannel(
    @Body() data: CreateChannelDto,
    @TokenData() tokenData: TokenPayload,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermissions(Permissions.MANAGE_CHANNELS)

    const id = this.snowflake.nextStringId()
    const { name, type, parentId, description } = data
    if (parentId) {
      const parent = await this.channelsService.getChannel(parentId)
      if (!parent) throw new BadRequestException({ code: ErrorCode.UnknownChannel })
      if (parent.type !== 'category' || type === 'category')
        throw new BadRequestException({ code: ErrorCode.InvalidChannelType })
    }

    await this.channelsService.createChannel({
      id,
      name,
      type,
      parentId,
      description,
    })

    return { id }
  }

  /** Modify channel. Require MANAGE_CHANNELS permission. */
  @Patch(':id')
  @RequireAuth()
  async modifyChannel(
    @Param('id') id: string,
    @TokenData() tokenData: TokenPayload,
    @Body() data: UpdateChannelDto,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermissions(Permissions.MANAGE_CHANNELS)

    const channel = await this.channelsService.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    const { name, parentId, description } = data
    await this.channelsService.modifyChannel(id, { name, parentId, description })
    return null
  }

  @Delete(':id')
  @RequireAuth()
  async deleteChannel(
    @Param('id') id: string,
    @TokenData() tokenData: TokenPayload,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermissions(Permissions.MANAGE_CHANNELS)

    const channel = await this.channelsService.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    await this.channelsService.deleteChannel(id)
    return null
  }

  @Post(':id/permissions')
  @RequireAuth()
  async createChannelPermissions(
    @Param('id') id: string,
    @TokenData() tokenData: TokenPayload,
    @Body() data: CreatePermissionOverwriteDto,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermissions(Permissions.MANAGE_CHANNELS)

    const channel = await this.channelsService.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    const { id: targetId, type, allow, deny } = data
    if ((allow & deny) !== 0) throw new BadRequestException({ code: ErrorCode.InvalidPermissions })
    await this.permissionOverwrites.createPermissionOverwrite(id, type, targetId, allow, deny)
  }

  @Patch(':id/permissions/:permissionOverwriteId')
  @RequireAuth()
  async modifyChannelPermissions(
    @Param('id') id: string,
    @Param('permissionOverwriteId') targetId: string,
    @TokenData() tokenData: TokenPayload,
    @Body() data: UpdatePermissionOverwriteDto,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermissions(Permissions.MANAGE_CHANNELS)

    const channel = await this.channelsService.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    const { allow, deny } = data
    if ((allow & deny) !== 0) throw new BadRequestException({ code: ErrorCode.InvalidPermissions })
    await this.permissionOverwrites.modifyPermissionOverwrite(targetId, allow, deny)
  }

  @Delete(':id/permissions/:permissionOverwriteId')
  @RequireAuth()
  async deleteChannelPermissions(
    @Param('id') id: string,
    @Param('permissionOverwriteId') targetId: string,
    @TokenData() tokenData: TokenPayload,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermissions(Permissions.MANAGE_CHANNELS)

    const channel = await this.channelsService.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    await this.permissionOverwrites.deletePermissionOverwrite(targetId)
  }

  @Get(':id/permissions')
  @RequireAuth()
  async getChannelPermissions(
    @Param('id') id: string,
  ) {
    const channel = await this.channelsService.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    return await this.permissionOverwrites.getPermissionOverwrites(id)
  }

  @Get(':id/permissions/:permissionOverwriteId')
  @RequireAuth()
  async getChannelPermission(
    @Param('id') id: string,
    @Param('permissionOverwriteId') targetId: string,
  ) {
    const channel = await this.channelsService.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    return await this.permissionOverwrites.getPermissionOverwrite(targetId)
  }

  @Get(':id/test')
  @RequireAuth()
  async test(
    @Param('id') id: string,
    @TokenData() tokenData: TokenPayload,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermissionOnChannel(id, Permissions.SEND_MESSAGES)

    const channel = await this.channelsService.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    return 'hui'
  }
}