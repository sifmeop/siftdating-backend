import { Injectable } from '@nestjs/common'
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { PrismaService } from 'src/prisma/prisma.service'
import { NODE_ENV, USER_ID } from '~/common/env'
import { getTelegramIdFromInitData, validateInitData } from '~/common/utils'

interface IClient {
  telegramId: number
  socket: Socket
}

@Injectable()
@WebSocketGateway({ path: '/user' })
export class UserGateway {
  @WebSocketServer()
  server: Server

  private clients: Map<string, Socket> = new Map()

  constructor(private readonly prisma: PrismaService) {}

  @SubscribeMessage('message')
  handleOffer(client: Socket, payload: any): void {
    this.server.emit('notification', payload)
  }

  async handleConnection(client: Socket) {
    if (NODE_ENV === 'development') {
      this.clients.set(USER_ID, client)
      return
    }

    const initData = client.handshake.query?.initData

    if (
      !initData ||
      typeof initData !== 'string' ||
      !validateInitData(initData)
    ) {
      client.emit('error', 'Invalid initData')
      client.disconnect()
      return
    }

    const telegramId = getTelegramIdFromInitData(initData)

    const user = await this.prisma.user.findUnique({
      where: {
        telegramId
      }
    })

    if (!user) {
      client.emit('error', 'User not found')
      client.disconnect()
      return
    }

    this.clients.set(user.id, client)
  }

  handleDisconnect(client: any) {}

  async sendToClient(clientId: string, event: string, payload: any) {
    const client = this.clients.get(clientId)

    if (client) {
      client.emit(event, payload)
    }
  }
}
