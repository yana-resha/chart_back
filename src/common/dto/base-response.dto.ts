import { ApiProperty } from '@nestjs/swagger'
import { Type } from '@nestjs/common'

export class ErrorResponseDto {
  @ApiProperty({ example: '400', description: 'Код ошибки' })
  code: string

  @ApiProperty({
    example: 'name - Название должно содержать минимум 3 символа',
    description: 'Информация об ошибке',
  })
  message: string
}

export class BaseResponseDto<T> {
  @ApiProperty({ example: true, description: 'Флаг успешного выполнения' })
  success: boolean

  @ApiProperty({ required: false })
  data?: T

  @ApiProperty({ type: () => ErrorResponseDto, required: false })
  error?: ErrorResponseDto
}

// 🧩 Генератор ответа с оберткой для Swagger (анонимный класс с правильным типом data)
export function BaseResponseDtoFactory<TModel>(
  model: Type<TModel>,
  isArray: boolean = false,
): Type<BaseResponseDto<TModel | TModel[]>> {
  class DynamicResponseDto extends BaseResponseDto<TModel | TModel[]> {
    @ApiProperty({
      type: () => model,
      required: false,
      isArray,
    })
    override data?: TModel | TModel[]
  }

  Object.defineProperty(DynamicResponseDto, 'name', {
    value: `ResponseDto_${model.name}`,
  })

  return DynamicResponseDto
}
