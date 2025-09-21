import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from './common/pipes/validation.pipe'
import { ResponseInterceptor } from './common/interceptors/response.interceptors'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { SwephHelper } from './astro-chart/helpers/sweph.helper'

async function bootstrap() {
  // Путь до файлов с эфемеридами
  SwephHelper.init('/Users/yana/Desktop/study/natal_datas/ephemeris/ephe')

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log', 'debug'] })

  // Префиксируем все ручки через /api
  app.setGlobalPrefix('api')

  app.enableCors({ origin: true })

  const config = new DocumentBuilder()
    .setTitle('NATAL CHART')
    .setDescription('Документация REST API')
    .setVersion('1.0.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api/docs', app, document)

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new GlobalExceptionFilter())

  const PORT = process.env.PORT || 3000
  await app.listen(PORT, () => console.log(`Server started on port: ${PORT}`))
}
void bootstrap()
