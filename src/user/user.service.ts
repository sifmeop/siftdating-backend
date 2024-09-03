import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { AwsService } from 'src/aws/aws.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly aws: AwsService,
    private readonly redisService: RedisService
  ) {}

  async getUser(telegramId: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        telegramId
      }
    })

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    return user
  }

  async getPhotoUrls(telegramId: number): Promise<string[]> {
    const user = await this.getUser(telegramId)
    const key = `user-photos-${telegramId}`

    const cache = await this.redisService.call('get', key)

    if (cache) {
      return JSON.parse(cache as string) as string[]
    }

    const photoUrls = await Promise.all(
      user.photoKeys.map(async (key) => {
        return await this.aws.getFileUrl(`${String(508440400)}/${key}`)
      })
    )

    await this.redisService.call('set', key, JSON.stringify(photoUrls))

    return photoUrls
  }
}
