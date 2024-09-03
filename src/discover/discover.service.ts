import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ReactionType, RegistrationStage } from '@prisma/client'
import { AwsService } from 'src/aws/aws.service'
import { BotService } from 'src/bot/bot.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserGateway } from 'src/user/user.gateway'
import { UserService } from 'src/user/user.service'
import { SetReactionDto } from '~/dto/discover.dto'

@Injectable()
export class DiscoverService {
  constructor(
    private prisma: PrismaService,
    private botService: BotService,
    private readonly aws: AwsService,
    private readonly userGateway: UserGateway,
    private readonly userService: UserService
  ) {}

  async getUsers(telegramId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        telegramId
      },
      select: {
        id: true,
        reactedTo: {
          select: {
            targetId: true
          }
        }
      }
    })

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    const previousIds = user.reactedTo.map((reaction) => reaction.targetId)
    previousIds.push(user.id)

    const users = await this.prisma.user.findMany({
      where: {
        id: {
          notIn: previousIds
        },
        registrationStage: RegistrationStage.DONE
      },
      take: 20
    })

    const promise = await Promise.all(
      users.map(async (user) => {
        const photoUrls = await this.userService.getPhotoUrls(
          Number(user.telegramId)
        )

        delete user.photoKeys

        return {
          ...user,
          photoUrls
        }
      })
    )

    return await Promise.all(promise)
  }

  async setReaction(telegramId: number, { targetId, type }: SetReactionDto) {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          telegramId
        }
      })

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }

      const isHasReaction = await tx.reaction.findFirst({
        where: {
          userId: user.id,
          targetId
        }
      })

      if (isHasReaction) {
        throw new HttpException('Already has reaction', HttpStatus.BAD_REQUEST)
      }

      const { targetUser } = await tx.reaction.create({
        data: {
          userId: user.id,
          targetId,
          type
        },
        select: {
          targetUser: {
            select: {
              id: true,
              telegramId: true
            }
          }
        }
      })

      // await tx.chat.create({
      //   data: {
      //     users: {
      //       connect: [
      //         {
      //           id: user.id
      //         },
      //         {
      //           id: targetUser.id
      //         }
      //       ]
      //     }
      //   }
      // })

      const targetUserLiked = await tx.reaction.findFirst({
        where: {
          userId: targetUser.id,
          targetId: user.id,
          type: ReactionType.LIKE
        }
      })

      if (targetUserLiked) {
        await this.userGateway.sendToClient(user.id, 'notification', {
          type: 'reciprocal-like'
        })
      }
    })

    // await this.botService.notifyUserLiked(Number(targetUser.telegramId))
  }
}
