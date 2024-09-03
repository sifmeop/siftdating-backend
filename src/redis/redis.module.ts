import { Global, Module } from '@nestjs/common'
import { Redis } from 'ioredis'
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '~/common/env'
import { RedisService } from './redis.service'

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: REDIS_HOST,
          port: REDIS_PORT,
          password: REDIS_PASSWORD
        })
      }
    },
    RedisService
  ],
  exports: ['REDIS_CLIENT', RedisService]
})
export class RedisModule {}
