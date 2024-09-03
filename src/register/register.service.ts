import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { RegistrationStage } from '@prisma/client'
import { AwsService } from 'src/aws/aws.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { RegisterStartDto } from '~/dto/register.dto'

@Injectable()
export class RegisterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aws: AwsService
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
        birthDate: new Date(body.birthDate)
      }
    })
  }

  async uploadPhotos(
    telegramId: number,
    files: Array<Express.Multer.File>
  ): Promise<void> {
    const result = await Promise.all(
      files.map(async (file, index) =>
        this.aws.uploadFile(
          file,
          `${String(telegramId)}/${file.fieldname}-${index + 1}`
        )
      )
    )

    await this.prisma.user.update({
      where: {
        telegramId
      },
      data: {
        registrationStage: RegistrationStage.DONE,
        photoKeys: result.map((r) => r.Key.split('/')[1])
      }
    })
  }
}
