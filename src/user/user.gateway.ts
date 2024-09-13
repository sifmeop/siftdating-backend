import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
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

  async handleConnection(client: Socket) {
    if (NODE_ENV === 'development') {
      const userId = USER_ID
      this.clients.set(userId, client)
      client.emit('connected', userId)
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

    if (client && client.connected) {
      client.emit(event, payload)
    }
  }
}
