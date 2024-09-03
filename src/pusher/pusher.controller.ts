import { Body, Controller, Post } from '@nestjs/common'
import { PusherService } from './pusher.service'

@Controller('pusher')
export class PusherController {
  constructor(private readonly pusherService: PusherService) {}

  @Post('/auth')
  async checkAuth(@Body() body: any): Promise<any> {
    console.log('checkAuth', body)
    return this.pusherService.checkAuth()
  }
}
