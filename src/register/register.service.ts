import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { RegistrationStage } from '@prisma/client'
import { AwsService } from 'src/aws/aws.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from 'src/redis/redis.service'
import { UserService } from 'src/user/user.service'
import { getFileUrl } from '~/common/utils'
import { RegisterStartDto } from '~/dto/register.dto'

@Injectable()
export class RegisterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aws: AwsService,
    private readonly userService: UserService,
    private readonly redisService: RedisService
  ) {}

  async setProfileData(
    telegramId: number,
    body: RegisterStartDto
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        telegramId
      }
    })

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        ...body,
        birthDate: new Date(body.birthDate),
        registrationStage: RegistrationStage.PHOTO
      }
    })
  }

  async uploadPhotos(
    telegramId: number,
    files: Array<Express.Multer.File>
  ): Promise<void> {
    const user = await this.userService.getUser(telegramId)

    const photoKeys = await Promise.all(
      files.map(async (file, index) =>
        this.aws.uploadFile(file, `${String(telegramId)}/photo-${index + 1}`)
      )
    )

    const photoUrls = user.photoKeys.map((key) => {
      return getFileUrl(`${String(508440400)}/${key}`)
    })

    await this.redisService.call(
      'set',
      `user-photos-${telegramId}`,
      JSON.stringify(photoUrls)
    )

    await this.prisma.user.update({
      where: {
        telegramId
      },
      data: {
        registrationStage: RegistrationStage.DONE,
        photoKeys
      }
    })
  }
}
