import { ReactionType } from '@prisma/client'
import { IsString } from 'class-validator'

export class SetReactionDto {
  @IsString()
  type: ReactionType

  @IsString()
  targetId: string
}
