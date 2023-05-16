import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import WebSocket, { Server } from 'ws'
import { RealtimeService } from '@app/realtime/realtime.service'
import { Socket } from '@app/realtime/websocket.type'
import { AuthWsDto } from '../dto/auth-ws.dto'
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import { AllExceptionsFilter } from '@app/response/exceptions.filter'

@WebSocketGateway()
@UsePipes(new ValidationPipe())
@UseFilters(AllExceptionsFilter)
export class RealtimeGateway implements OnGatewayConnection<WebSocket> {
  constructor(
    private readonly realtime: RealtimeService,
  ) {}
  
  @WebSocketServer()
  declare server: Server
  
  async handleConnection(client: Socket): Promise<void> {
    await this.realtime.connectClient(client)
  }

  @SubscribeMessage('auth')
  async authorize(
    @MessageBody() body: AuthWsDto,
    @ConnectedSocket() socket: Socket,
  ) {
    await this.realtime.authorizeClient(socket.id, body.token)

    return { event: 'hello', data: { id: socket.id } }
  }
}
