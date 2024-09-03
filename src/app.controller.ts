import { Controller, Post } from '@nestjs/common'
import { User } from '@prisma/client'
import { AppService } from './app.service'
import { GetCurrentTelegramId } from './common/decorators/get-current-telegram-id.decorator'

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/user')
  async getUser(@GetCurrentTelegramId() telegramId: number): Promise<User> {
    return await this.appService.getUser(telegramId)
  }
}
