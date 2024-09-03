import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { GetCurrentUserId } from '~/common/decorators/get-current-user-id.decorator'
import {
  CreateMessageDTO,
  DeleteMessageDTO,
  EditMessageDTO,
  GetMessagesDTO,
  ReadMessageDTO
} from '~/dto/messages.dto'
import { MessagesService } from './messages.service'

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('/')
  async getMessages(
    @GetCurrentUserId() userId: string,
    @Query() query: GetMessagesDTO
  ) {
    return await this.messagesService.getMessages(userId, query.chatId)
  }

  @Post('/')
  async createMessage(
    @GetCurrentUserId() userId: string,
    @Body() body: CreateMessageDTO
  ) {
    return await this.messagesService.createMessage(userId, body)
  }

  @Put('/')
  async editMessage(
    @GetCurrentUserId() userId: string,
    @Body() body: EditMessageDTO
  ) {
    await this.messagesService.editMessage(userId, body)
    return { status: HttpStatus.OK }
  }

  @Put('/read')
  async readMessage(
    @GetCurrentUserId() userId: string,
    @Body() body: ReadMessageDTO
  ) {
    await this.messagesService.readMessage(userId, body)
    return { status: HttpStatus.OK }
  }

  @Delete('/')
  async deleteMessage(
    @GetCurrentUserId() userId: string,
    @Body() body: DeleteMessageDTO
  ) {
    await this.messagesService.deleteMessage(userId, body)
    return 'Success deleted'
  }
}
