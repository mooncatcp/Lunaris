import { BadRequestException, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common'
import { Server } from 'ws'
import { WebSocketServer } from '@nestjs/websockets'
import { SnowflakeService } from '@app/snowflake/snowflake.service'
import { Socket } from './websocket.type'
import { TokenService } from '@app/auth/token.service'
import { ErrorCode } from '@app/response/error-code.enum'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MooncatConfigService } from '@app/config/config.service'

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
  ) {}

  async onModuleInit() {
    if (this.config.debug) {
      this.events.onAny((event, values) => {
        this.logger.log(`Event: ${event}(${values})`)
      })
    }
  }

  async authorizeClient(id: string, token: string) {
    const connection = this.connections.get(id)
    if (connection === undefined)
      throw new InternalServerErrorException({ code: ErrorCode.UnknownClient })
    const data = this.token.decodeToken(token)
    if (connection.userId) {
      throw new BadRequestException({ code: ErrorCode.ClientAlreadyAuthorized })
    } else {
      this.events.emit('socket.auth', this.connections.get(id)!)
      connection.userId = data.userId
    }
  }
  
  async connectClient(client: Socket) {
    const connectionId = this.snowflake.nextStringId()
    client.id = connectionId
    client.userId = null
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
