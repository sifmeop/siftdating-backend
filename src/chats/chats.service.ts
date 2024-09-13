import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserService } from 'src/user/user.service'

@Injectable()
export class ChatsService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService
  ) {}

  async getChats(telegramId: number) {
    const chats = await this.prisma.chat.findMany({
      where: {
        messages: {
          some: {}
        },
        users: {
          some: {
            telegramId
          }
        }
      },
      include: {
        messages: {
          where: {
            deletedAt: null
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        users: {
          where: {
            telegramId: {
              not: telegramId
            }
          },
          select: {
            id: true,
            telegramId: true,
            firstName: true,
            isOnline: true
          }
        }
      }
    })

    const promise = chats.map(async (chat) => {
      const lastMessage = chat.messages[0] ?? null
      const user = chat.users[0]
      const unRead = await this.prisma.message.count({
        where: {
          chatId: chat.id,
          userId: user.id,
          deletedAt: null,
          readAt: null
        }
      })

      // const photo = await this.userService.getPhotoUrls(Number(user.telegramId))

      delete chat.messages
      delete chat.users
      delete user.telegramId

      return {
        ...chat,
        user: {
          ...user,
          // photo: photo[0]
          photo: 'https://api.dicebear.com/9.x/avataaars/svg?seed'
        },
        lastMessage,
        unRead
      }
    })

    const result = await Promise.all(promise)

    return result.sort(
      (a, b) =>
        (b.lastMessage?.createdAt.getTime() || 0) -
        (a.lastMessage?.createdAt.getTime() || 0)
    )
  }

  async getLikes(telegramId: number): Promise<any[]> {
    const user = await this.prisma.user.findUnique({
      where: {
        telegramId
      }
    })

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    // const reactions = await this.prisma.reaction.findMany({
    //   where: {
    //     type: ReactionType.LIKE,
    //     targetId: user.id
    //   },
    //   select: {
    //     user: {
    //       select: {
    //         id: true,
    //         firstName: true,
    //         isOnline: true
    //       }
    //     }
    //   }
    // })
    const chats = await this.prisma.chat.findMany({
      where: {
        users: {
          some: {
            id: user.id
          }
        }
      },
      select: {
        id: true,
        users: {
          select: {
            id: true,
            firstName: true,
            isOnline: true
          }
        }
      }
    })

    const promise = chats.map(async (chat) => {
      const photos = await this.userService.getPhotoUrls(telegramId)

      return {
        ...chat.users[0],
        photoUrl: photos[0],
        chatId: chat.id
      }
    })

    return await Promise.all(promise)
  }
}
