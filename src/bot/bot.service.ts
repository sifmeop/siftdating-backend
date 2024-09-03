import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { InjectBot } from 'nestjs-telegraf'
import { PrismaService } from 'src/prisma/prisma.service'
import { Context, Telegraf } from 'telegraf'

@Injectable()
export class BotService {
  constructor(
    private prisma: PrismaService,
    @InjectBot() private readonly bot: Telegraf<Context>
  ) {}

  async onStart(ctx: Context): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        telegramId: ctx.from.id
      }
    })

    if (!user) {
      return await this.onRegister(ctx)
    }

    return user
  }

  async onRegister(ctx: Context): Promise<User> {
    const { first_name: firstName, id: telegramId } = ctx.from

    return await this.prisma.user.create({
      data: {
        firstName,
        telegramId
      }
    })
  }

  async notifyUserLiked(telegramId: number): Promise<void> {
    await this.bot.telegram.sendMessage(
      telegramId,
      'Поздравляю еблуша, тебя лайкнули, чекни кто',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Play',
                web_app: {
                  url: 'https://tuna-whole-gelding.ngrok-free.app'
                }
              }
            ]
          ]
        }
      }
    )
  }
}
