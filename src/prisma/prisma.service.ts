import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect()
  }

  async getUser(telegramId: number) {
    return await this.user.findUnique({
      where: {
        telegramId
      }
    })
  }
}
