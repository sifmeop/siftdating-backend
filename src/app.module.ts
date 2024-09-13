import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AwsModule } from './aws/aws.module'
import { BotModule } from './bot/bot.module'
import { ChatsModule } from './chats/chats.module'
import { TelegramAuthGuard } from './common/guard'
import { DiscoverModule } from './discover/discover.module'
import { MessagesModule } from './messages/messages.module'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { RegisterModule } from './register/register.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    BotModule,
    PrismaModule,
    DiscoverModule,
    RegisterModule,
    AwsModule,
    ChatsModule,
    MessagesModule,
    UserModule,
    RedisModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: TelegramAuthGuard
    }
  ]
})
export class AppModule {}
