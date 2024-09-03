import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from 'src/prisma/prisma.service'
import { USER_ID } from '../env'
import { validateInitData } from '../utils'

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prismaService: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass()
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()

    if (process.env.NODE_ENV === 'development') {
      request['user'] = {
        id: USER_ID,
        telegramId: Number(process.env.TELEGRAM_ID)
      }

      return true
    }

    const initData = request.headers['x-telegram-initdata'] as string

    if (!initData) {
      throw new ForbiddenException('No initData provided')
    }

    if (!validateInitData(initData)) {
      throw new ForbiddenException('Invalid initData signature')
    }

    const urlParams = new URLSearchParams(initData)
    const initDataUser = JSON.parse(urlParams.get('user'))

    const telegramId = Number(initDataUser.id)

    const user = await this.prismaService.user.findUnique({
      where: {
        telegramId
      }
    })

    if (!user) {
      return false
    }

    if (!request['user']) {
      request['user'] = {}
    }

    request['user']['id'] = user.id
    request['user']['telegramId'] = user.telegramId

    return true
  }
}
