import { IsString } from 'class-validator'

export class GetUserDto {
  @IsString()
  telegramId: string
}
