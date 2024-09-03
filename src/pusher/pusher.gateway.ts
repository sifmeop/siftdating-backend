import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway
} from '@nestjs/websockets'
import * as Pusher from 'pusher'

@WebSocketGateway()
export class PusherGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private pusher: Pusher

  constructor() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER
      // useTLS: true
    })
  }

  async handleConnection(client: any, ...args: any[]) {
    // Код для обработки подключения клиента
    console.log('Client connected:', client.id)
  }

  async handleDisconnect(client: any) {
    // Код для обработки отключения клиента
    console.log('Client disconnected:', client.id)
  }

  async triggerEvent(channel: string, event: string, data: object) {
    this.pusher.trigger(channel, event, data)
  }
}
