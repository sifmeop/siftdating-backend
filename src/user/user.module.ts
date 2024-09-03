import { Global, Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserGateway } from './user.gateway'
import { UserService } from './user.service'

@Global()
@Module({
  controllers: [UserController],
  providers: [UserService, UserGateway],
  exports: [UserService, UserGateway]
})
export class UserModule {}
