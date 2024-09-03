import { Global, Module } from '@nestjs/common'
import { PusherController } from './pusher.controller'
import { PusherGateway } from './pusher.gateway'
import { PusherService } from './pusher.service'

@Global()
@Module({
  controllers: [PusherController],
  providers: [PusherService, PusherGateway],
  exports: [PusherService]
})
export class PusherModule {}
