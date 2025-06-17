import { Module } from '@nestjs/common'
import { AstroDictionaryService } from './astro-dictionary.service'
import { AstroDictionaryController } from './astro-dictionary.controller'
import { LlmInterpretationService } from './llm-interpretation.service'
import { LlmModule } from 'src/llm/llm.module' // если LlmService импортируется из отдельного модуля

@Module({
  imports: [LlmModule], // обязательно импортируем модуль, где объявлен LlmService
  controllers: [AstroDictionaryController],
  providers: [AstroDictionaryService, LlmInterpretationService],
  exports: [AstroDictionaryService, LlmInterpretationService],
})
export class AstroDictionaryModule {}
