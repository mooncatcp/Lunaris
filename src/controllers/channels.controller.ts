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
} from '@nestjs/common'
import { ChannelsService } from '@app/channels/channels.service'
import { ErrorCode } from '@app/response/error-code.enum'
import { CreateChannelDto } from '../dto/create-channel.dto'
import { UpdateChannelDto } from '../dto/update-channel.dto'
import { AuthService } from '@app/auth/auth.service'
import { ApiTags } from '@nestjs/swagger'
import { RequireAuth } from '@app/auth/auth.decorator'
import { TokenData } from '@app/auth/token.decorator'
import { TokenPayload } from '@app/auth/token.interface'
import { Permissions } from '@app/permissions/permissions.enum'
import { PermissionOverwritesService } from '@app/permissions/permission-overwrites.service'
import { CreatePermissionOverwriteDto } from '../dto/create-permission-overwrite.dto'
import { UpdatePermissionOverwriteDto } from '../dto/update-permission-overwrite.dto'
import { ModifyPositionDto } from '../dto/modify-positions.dto'

@Controller('channels')
@ApiTags('Channels')
export class ChannelsController {
  constructor(
    private readonly channels: ChannelsService,
    private readonly auth: AuthService,
    private readonly permissionOverwrites: PermissionOverwritesService,
  ) {}

  /** Change positions of channels. */
  @Patch('positions')
  @RequireAuth()
  async updateRolePositions(
    @TokenData() token: TokenPayload,
    @Body() dto: ModifyPositionDto,
  ) {
    const authr = this.auth.forUser(token.userId)
    await authr.hasPermission(Permissions.MANAGE_CHANNELS)
    await this.channels.updateChannelPositions(dto.positions)

    return dto.positions
  }


  /** Get all channels */
  @Get()
  @RequireAuth()
  async getAllChannels() {
    return await this.channels.getAllChannels()
  }

  /** Get a single channel */
  @Get(':id')
  @RequireAuth()
  async getChannel(@Param('id') id: string) {
    const channel = await this.channels.getChannel(id)
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
    await authr.hasPermission(Permissions.MANAGE_CHANNELS, data.parentId)

    const { name, type, parentId, description } = data

    return this.channels.createChannel({
      name,
      type,
      parentId,
      description,
    })
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
    await authr.hasPermission(Permissions.MANAGE_CHANNELS)

    const { name, parentId, description } = data
    return this.channels.modifyChannel(id, { name, parentId, description })
  }

  /** Delete a channel. Require MANAGE_CHANNELS permission. */
  @Delete(':id')
  @RequireAuth()
  async deleteChannel(
    @Param('id') id: string,
    @TokenData() tokenData: TokenPayload,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermission(Permissions.MANAGE_CHANNELS)

    const channel = await this.channels.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    return this.channels.deleteChannel(id)
  }

  /** Create permission overwrite on channel. Require MANAGE_CHANNELS permission.  */
  @Post(':id/permissions')
  @RequireAuth()
  async createChannelPermissions(
    @Param('id') id: string,
    @TokenData() tokenData: TokenPayload,
    @Body() data: CreatePermissionOverwriteDto,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermission(Permissions.MANAGE_CHANNELS)

    const channel = await this.channels.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    const { id: targetId, type, allow, deny } = data
    if ((allow & deny) !== 0) throw new BadRequestException({ code: ErrorCode.InvalidPermissions })
    return this.permissionOverwrites.createPermissionOverwrite(id, type, targetId, allow, deny)
  }

  /** Modify permission overwrite on channel. Require MANAGE_CHANNELS permission. */
  @Patch(':id/permissions/:permissionOverwriteId')
  @RequireAuth()
  async modifyChannelPermissions(
    @Param('id') id: string,
    @Param('permissionOverwriteId') targetId: string,
    @TokenData() tokenData: TokenPayload,
    @Body() data: UpdatePermissionOverwriteDto,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermission(Permissions.MANAGE_CHANNELS)

    const channel = await this.channels.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    const { allow, deny } = data
    if ((allow & deny) !== 0) throw new BadRequestException({ code: ErrorCode.InvalidPermissions })
    return this.permissionOverwrites.modifyPermissionOverwrite(targetId, allow, deny)
  }

  /** Delete permission overwrite on channel. Require MANAGE_CHANNELS permission. */
  @Delete(':id/permissions/:permissionOverwriteId')
  @RequireAuth()
  async deleteChannelPermissions(
    @Param('id') id: string,
    @Param('permissionOverwriteId') targetId: string,
    @TokenData() tokenData: TokenPayload,
  ) {
    const authr = await this.auth.forUser(tokenData.userId)
    await authr.hasPermission(Permissions.MANAGE_CHANNELS)

    const channel = await this.channels.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    return this.permissionOverwrites.deletePermissionOverwrite(targetId)
  }

  /** Get all permission overwrites on channel. */
  @Get(':id/permissions')
  async getChannelPermissions(
    @Param('id') id: string,
  ) {
    const channel = await this.channels.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    return this.permissionOverwrites.getPermissionOverwrites(id)
  }

  /** Get a single permission overwrite on channel. */
  @Get(':id/permissions/:permissionOverwriteId')
  async getChannelPermission(
    @Param('id') id: string,
    @Param('permissionOverwriteId') targetId: string,
  ) {
    const channel = await this.channels.getChannel(id)
    if (!channel) throw new NotFoundException({ code: ErrorCode.UnknownChannel })

    return await this.permissionOverwrites.getPermissionOverwrite(targetId)
  }

  @Get('/permissions')
  @RequireAuth()
  async getPermissions() {
    return await this.permissionOverwrites.getAllPermissionOverwrites()
  }
}
