import { createParamDecorator } from '@nestjs/common'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'

export const GetCurrentUserId = createParamDecorator(
  (_, context: ExecutionContextHost): number => {
    const request = context.switchToHttp().getRequest()
    return request.user['id']
  }
)
