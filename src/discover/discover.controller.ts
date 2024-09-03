import { Body, Controller, Get, Post } from '@nestjs/common'
import { GetCurrentTelegramId } from '~/common/decorators/get-current-telegram-id.decorator'
import { SetReactionDto } from '~/dto/discover.dto'
import { DiscoverService } from './discover.service'

@Controller('discover')
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @Get('/')
  async getUsers(@GetCurrentTelegramId() telegramId: number) {
    return await this.discoverService.getUsers(telegramId)
  }

  @Post('/')
  async setReaction(
    @GetCurrentTelegramId() telegramId: number,
    @Body() body: SetReactionDto
  ) {
    await this.discoverService.setReaction(telegramId, body)
    return { success: true }
  }
}
