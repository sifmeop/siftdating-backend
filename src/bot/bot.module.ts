import { Module } from '@nestjs/common'
import { TelegrafModule } from 'nestjs-telegraf'
import { PrismaModule } from 'src/prisma/prisma.module'
import { BotService } from './bot.service'
import { BotUpdate } from './bot.update'

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN
    }),
    PrismaModule
  ],
  providers: [BotUpdate, BotService],
  exports: [BotService]
})
export class BotModule {}
