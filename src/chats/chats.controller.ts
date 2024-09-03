import { Controller, Get } from '@nestjs/common'
import { GetCurrentTelegramId } from '~/common/decorators'
import { ChatsService } from './chats.service'

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get('/')
  async getChats(@GetCurrentTelegramId() telegramId: number) {
    return await this.chatsService.getChats(telegramId)
  }

  @Get('/likes')
  async getLikes(@GetCurrentTelegramId() telegramId: number) {
    return await this.chatsService.getLikes(telegramId)
  }
}
