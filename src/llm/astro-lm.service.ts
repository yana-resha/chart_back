import { Injectable } from '@nestjs/common'
import { LlmService } from './llm.service'
import { AstroInterpretationDto } from './dto/astro-interpret.dto'
import * as crypto from 'crypto'
import { LlmModel } from './types/llm-model.enum'
import { AstroChartType } from 'src/common/enums/astro-chart-type.enum'
import { ChartTypeDescriptions } from './constants/chart-type-descriptions'
import { LLM_CHAT_ROLE } from 'src/common/enums/llm.enum'

@Injectable()
export class AstroLmService {
  private readonly cache = new Map<string, string>()

  constructor(private readonly llmService: LlmService) {}

  async interpretChart(data: AstroInterpretationDto, chartType: AstroChartType): Promise<string> {
    const cacheKey = this.getCacheKey(data)
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const systemPrompt = {
      role: LLM_CHAT_ROLE.SYSTEM,
      content: ChartTypeDescriptions[chartType],
    }
    const userPrompt = {
      role: LLM_CHAT_ROLE.USER,
      content: JSON.stringify(data, null, 2),
    }

    const result = await this.llmService.chat(LlmModel.MistralNemo, [systemPrompt, userPrompt])

    if (result.finishReason === 'stop') {
      this.cache.set(cacheKey, result.content)
    } else {
      console.warn(`⚠️ Ответ модели завершился по причине: "${result.finishReason}" — не кэшируем.`)
    }

    return result.content
  }

  private getCacheKey(data: AstroInterpretationDto): string {
    const hash = crypto.createHash('md5')
    hash.update(JSON.stringify(data.userData))
    return hash.digest('hex')
  }
}
