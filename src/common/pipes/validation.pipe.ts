import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { ValidationException } from 'src/exceptions/validation.exception'

// pipes используются в двух случаях: преобразовать входящие данные или выполнить валидацию входных данных
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
    if (!metatype) {
      return undefined
    }

    const obj = plainToClass(metatype, value)
    const errors = await validate(obj)
    if (errors.length) {
      const messages = errors.flatMap((err) =>
        Object.values(err.constraints ?? {}).map((message) => `${err.property} - ${message}`),
      )
      throw new ValidationException(messages[0])
    }

    return value
  }
}
