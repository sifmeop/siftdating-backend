import { Inject, Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'

type RedisMethodNames = {
  [K in keyof Redis]: Redis[K] extends (...args: any[]) => any ? K : never
}[keyof Redis]

@Injectable()
export class RedisService {
  private readonly redisClient: Redis

  constructor(@Inject('REDIS_CLIENT') redisClient: Redis) {
    this.redisClient = redisClient
  }

  async call<K extends 'set'>(
    method: K,
    key: string,
    value: string,
    ...args: any[]
  ): Promise<ReturnType<Redis[K]>>
  async call<K extends RedisMethodNames>(
    method: K,
    ...args: Parameters<Redis[K]>
  ): Promise<ReturnType<Redis[K]>>

  async call<K extends RedisMethodNames>(
    method: K,
    ...args: any[]
  ): Promise<any> {
    const redisMethod = this.redisClient[method]
    if (typeof redisMethod !== 'function') {
      throw new Error(`Method ${String(method)} does not exist on Redis client`)
    }
    return redisMethod.apply(this.redisClient, args)
  }
}
