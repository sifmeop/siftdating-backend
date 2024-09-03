import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from './prisma/prisma.service'

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getUser(telegramId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        telegramId
      }
    })

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    return user
  }
}
