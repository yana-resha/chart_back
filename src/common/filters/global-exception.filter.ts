import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common'
import { Response } from 'express'
import { AppException } from '../errors/app.exception'
import { ValidationException } from 'src/exceptions/validation.exception'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let errorResponse = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Внутренняя ошибка сервера',
    }

    if (exception instanceof AppException) {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      errorResponse = {
        code: exception.code,
        message: exception.message,
      }
    }

    // 👉 Обработка валидационных ошибок от class-validator
    else if (exception instanceof BadRequestException) {
      const res = exception.getResponse()
      const messages = typeof res === 'object' && res['message'] ? res['message'] : ['Ошибка валидации']

      status = HttpStatus.BAD_REQUEST
      errorResponse = {
        code: 'VALIDATION_ERROR',
        message: Array.isArray(messages) ? messages.join(', ') : messages,
      }
    } else if (exception instanceof ValidationException) {
      status = HttpStatus.BAD_REQUEST
      errorResponse = {
        code: 'VALIDATION_ERROR',
        message: exception.message,
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus()
      const res: any = exception.getResponse()
      errorResponse = {
        code: String(status),
        message: typeof res === 'string' ? res : res.message || 'Ошибка',
      }
    }

    response.status(status).json({
      success: false,
      data: undefined,
      error: errorResponse,
    })
  }
}
