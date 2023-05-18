import WebSocket from 'ws'

export type Socket = SocketData & WebSocket

export interface SocketData {
  id: string
  userId: string | null
  channels: string[]
  interestedIn: string[]
}
