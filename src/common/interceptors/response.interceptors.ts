import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, map } from 'rxjs'
import { IResponse } from '../types/api.type'
// Interceptors позволяют "перехватывать" поток обработки запроса до или после вызова обработчика (контроллера/сервиса).
// Используются для
// 1. Трансформация данных (например, изменить ответ перед отправкой клиенту)
// 2. Кэширование (сохранить ответ и отдать его из кеша при следующем запросе)
// 3. Логирование (измерять время выполнения запроса, логировать входящие/исходящие данные)
// 4. Обработка ошибок (например, обернуть результат в try-catch централизованно)
// 5. Добавление дополнительной логики (например, автоматически оборачивать ответы в какой-то формат)

// Данный класс используется для 5 варианта, т.e. если ответ сервера успешый он
// приводит ответ к общей структуре ответов api
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      })),
    )
  }
}
