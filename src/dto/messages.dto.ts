import {
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  MinLength
} from 'class-validator'

export class GetMessagesDTO {
  @IsString()
  @IsUUID()
  chatId: string
}

export class CreateMessageDTO {
  @IsString()
  @MinLength(1)
  text: string

  @IsString()
  @IsUUID()
  chatId: string
}

export class EditMessageDTO {
  @IsString()
  @IsUUID()
  id: string

  @IsString()
  @MinLength(1)
  text: string
}

export class DeleteMessageDTO {
  @IsString()
  @IsUUID()
  chatId: string

  @IsArray()
  // @IsString({ each: true })
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  messagesIds: string[]
}

export class ReadMessageDTO {
  @IsString()
  @IsUUID()
  chatId: string

  @IsArray()
  // @IsString({ each: true })
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  messagesIds: string[]
}
