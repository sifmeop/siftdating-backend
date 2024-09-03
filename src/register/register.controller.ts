import {
  Body,
  Controller,
  HttpCode,
  Put,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { GetCurrentTelegramId } from '~/common/decorators'
import { RegisterStartDto } from '~/dto/register.dto'
import { RegisterService } from './register.service'

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Put('start')
  @HttpCode(204)
  async setProfileData(
    @GetCurrentTelegramId() telegramId: number,
    @Body() body: RegisterStartDto
  ): Promise<void> {
    await this.registerService.setProfileData(telegramId, body)
  }

  @Put('photo')
  @HttpCode(204)
  @UseInterceptors(FilesInterceptor('files'))
  async uploadPhotos(
    @GetCurrentTelegramId() telegramId: number,
    @UploadedFiles() files: Array<Express.Multer.File>
  ): Promise<void> {
    await this.registerService.uploadPhotos(telegramId, files)
  }
}
