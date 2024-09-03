import { Ctx, InjectBot, Start, Update } from 'nestjs-telegraf'
import { Context, Telegraf } from 'telegraf'
import { Public } from '~/common/decorators'
import { BotService } from './bot.service'

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly botService: BotService
  ) {}

  @Public()
  @Start()
  async onStart(@Ctx() ctx: Context) {
    const user = await this.botService.onStart(ctx)
    await ctx.reply(`Hello ${user.firstName}`, {
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
    })
  }
}
