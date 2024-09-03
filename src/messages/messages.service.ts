import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Message } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { PusherService } from 'src/pusher/pusher.service'
import { UserGateway } from 'src/user/user.gateway'
import { UserService } from 'src/user/user.service'
import { v4 as uuidv4 } from 'uuid'
import {
  CreateMessageDTO,
  DeleteMessageDTO,
  EditMessageDTO,
  ReadMessageDTO
} from '~/dto/messages.dto'

@Injectable()
export class MessagesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly pusherService: PusherService,
    private readonly userGateway: UserGateway
  ) {}

  async getMessages(userId: string, chatId: string): Promise<Message[]> {
    const chat = await this.prismaService.chat.findUnique({
      where: {
        id: chatId,
        users: {
          some: {
            id: userId
          }
        }
      }
    })

    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND)
    }

    return await this.prismaService.message.findMany({
      where: {
        chatId: chat.id,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 20
    })
  }

  async createMessage(userId: string, body: CreateMessageDTO) {
    const createdAt = new Date()
    const id = uuidv4()

    this.pusherService.sendMessage(body.chatId, {
      chatId: body.chatId,
      createdAt: createdAt.toISOString(),
      deletedAt: null,
      editedAt: null,
      id,
      readAt: null,
      text: body.text,
      userId
    })

    const chat = await this.prismaService.chat.findUnique({
      where: {
        id: body.chatId,
        users: {
          some: {
            id: userId
          }
        }
      }
    })

    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND)
    }

    return await this.prismaService.message.create({
      data: {
        id,
        chatId: chat.id,
        userId,
        text: body.text,
        createdAt
      }
    })
  }

  async editMessage(userId: string, body: EditMessageDTO) {
    const message = await this.prismaService.message.findFirst({
      where: {
        id: body.id,
        userId
      }
    })

    if (!message) {
      throw new HttpException('Message not found', HttpStatus.NOT_FOUND)
    }

    await this.prismaService.message.update({
      where: {
        id: message.id
      },
      data: {
        text: body.text
      }
    })
  }

  async deleteMessage(userId: string, body: DeleteMessageDTO) {
    const message = await this.prismaService.message.findFirst({
      where: {
        id: body.id,
        userId
      }
    })

    if (!message) {
      throw new HttpException('Message not found', HttpStatus.NOT_FOUND)
    }

    await this.prismaService.message.update({
      where: {
        id: message.id
      },
      data: {
        deletedAt: new Date()
      }
    })
  }

  async readMessage(userId: string, body: ReadMessageDTO) {
    const chat = await this.prismaService.chat.findUnique({
      where: {
        id: body.chatId
      }
    })

    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND)
    }

    const message = await this.prismaService.message.findMany({
      where: {
        id: {
          in: body.messagesIds
        },
        chatId: body.chatId,
        userId: {
          not: userId
        }
      }
    })

    if (message.length !== body.messagesIds.length) {
      throw new HttpException('Messages not found', HttpStatus.NOT_FOUND)
    }

    const readAt = new Date()

    await this.prismaService.message.updateMany({
      where: {
        id: {
          in: body.messagesIds
        },
        chatId: body.chatId
      },
      data: {
        readAt
      }
    })

    await this.userGateway.sendToClient(message[0].userId, 'read-messages', {
      chatId: body.chatId,
      messagesIds: body.messagesIds,
      readAt: readAt.toISOString()
    })
  }
}
