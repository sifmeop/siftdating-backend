import { Injectable } from '@nestjs/common'
import { PusherGateway } from './pusher.gateway'

@Injectable()
export class PusherService {
  constructor(private readonly pusherGateway: PusherGateway) {}

  async sendMessage(chatId: string, data: any): Promise<any> {
    await this.pusherGateway.triggerEvent(`chat-${chatId}`, 'message', data)
  }

  async checkAuth(): Promise<any> {}
}
