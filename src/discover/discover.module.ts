import { Module } from '@nestjs/common'
import { BotModule } from 'src/bot/bot.module'
import { DiscoverController } from './discover.controller'
import { DiscoverService } from './discover.service'

@Module({
  imports: [BotModule],
  controllers: [DiscoverController],
  providers: [DiscoverService]
})
export class DiscoverModule {}
