import { BadRequestException, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common'
import { Server } from 'ws'
import { WebSocketServer } from '@nestjs/websockets'
import { SnowflakeService } from '@app/snowflake/snowflake.service'
import { Socket } from './websocket.type'
import { TokenService } from '@app/auth/token.service'
import { ErrorCode } from '@app/response/error-code.enum'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { MooncatConfigService } from '@app/config/config.service'
import { PermissionOverwritesService } from '@app/permissions/permission-overwrites.service'
import { PermissionOverwrite } from '@app/schema/guild.schema'
import { RolesService } from '@app/members/roles.service'

@Injectable()
export class RealtimeService implements OnModuleInit {
  @WebSocketServer()
  declare server: Server
  
  private readonly connections = new Map<string, Socket>()
  private readonly logger = new Logger(RealtimeService.name)

  constructor(
    private readonly snowflake: SnowflakeService,
    private readonly token: TokenService,
    private readonly events: EventEmitter2,
    private readonly config: MooncatConfigService,
    private readonly permissions: PermissionOverwritesService,
    private readonly roles: RolesService,
  ) {
    this.events.onAny(this.handleEvents)
  }

  async onModuleInit() {
    if (this.config.debug) {
      this.events.onAny((event, values) => {
        this.logger.log(`Event: ${event}(${values})`)
      })
    }
  }

  async authorizeClient(id: string, token: string, interestedIn: string[]) {
    const connection = this.connections.get(id)
    if (connection === undefined)
      throw new InternalServerErrorException({ code: ErrorCode.UnknownClient })
    const data = this.token.decodeToken(token)
    if (connection.userId) {
      throw new BadRequestException({ code: ErrorCode.ClientAlreadyAuthorized })
    } else {
      this.events.emit('socket.auth', this.connections.get(id)!)
      connection.userId = data.userId
      connection.interestedIn = interestedIn
      connection.channels = await this.permissions.getAvailableChannels(data.userId)
    }
  }

  async handleEvents(_event: string | string[], payload: any) {
    let event = _event as string
    if (Array.isArray(event)) {
      event = event.join('.')
    }
    const audience: Socket[] = []

    if (event.startsWith('app')) return
    else if (event.startsWith('message') && event !== 'message.deleted') {
      const data = payload as { channelId: string }
      for (const client of this.connections.values()) {
        if (client.interestedIn.includes(event) && client.channels.includes(data.channelId)) {
          audience.push(client)
        }
      }
    } else {
      for (const client of this.connections.values()) {
        if (client.interestedIn.includes(event)) {
          audience.push(client)
        }
      }
    }

    for (const client of audience) {
      client.send(JSON.stringify({
        event,
        data: payload,
      }))
    }
  }

  @OnEvent('permission_overwrite.updated', { async: true })
  async onPermissionOverwriteUpdated(payload: PermissionOverwrite) {
    const connections = [ ...this.connections.values() ]
    for (const connection of connections) {
      if (!connection.userId) continue
      const memberRoles = await this.roles.getUserRoles(connection.userId!)
      if (
        (payload.roleId && memberRoles.includes(payload.roleId)) ||
        (payload.memberId && payload.memberId === connection.userId)
      ) {
        connection.channels = await this.permissions.getAvailableChannels(connection.userId!)
      }
    }
  }
  
  async connectClient(client: Socket) {
    const connectionId = this.snowflake.nextStringId()
    client.id = connectionId
    client.userId = null
    client.channels = []
    client.interestedIn = []
    this.connections.set(connectionId, client)

    client.onclose = () => {
      this.connections.delete(connectionId)
    }

    setTimeout(() => {
      if (client.userId === null) {
        client.close()
      }
    }, 30000)

    return connectionId
  }
}
