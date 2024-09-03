import { Gender } from '@prisma/client'
import {
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  registerDecorator,
  ValidationArguments,
  ValidationOptions
} from 'class-validator'

export class RegisterStartDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  firstName: string

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  aboutMe: string

  @IsDateFormat({ message: 'Invalid date' })
  birthDate: string

  @IsString()
  @MinLength(1)
  @MaxLength(15)
  city: string

  @IsString()
  @IsEnum(Gender, { message: 'Invalid gender' })
  gender: Gender
}

function IsDateFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          const regex = /^\d{4}-\d{2}-\d{2}$/
          return typeof value === 'string' && regex.test(value)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be in the format YYYY-MM-DD`
        }
      }
    })
  }
}
