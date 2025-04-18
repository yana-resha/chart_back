import { Injectable } from '@nestjs/common'
import { LlmService } from './llm.service'
import { AstroInterpretationDto } from './dto/astro-interpret.dto'
import * as crypto from 'crypto'
import { LlmModel } from './types/llm-model.enum'
import { AstroChartType } from 'src/common/enums/astro-chart-type.enum'
import { ChartTypeDescriptions } from './constants/chart-type-descriptions'

@Injectable()
export class AstroLmService {
  private readonly cache = new Map<string, string>()

  constructor(private readonly llmService: LlmService) {}

  async interpretChart(data: AstroInterpretationDto, chartType: AstroChartType): Promise<string> {
    const cacheKey = this.getCacheKey(data)
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const systemPrompt = ChartTypeDescriptions[chartType]
    const userPrompt = JSON.stringify(data, null, 2)

    const response = await this.llmService.chat(LlmModel.MistralNemo, systemPrompt, userPrompt)
    this.cache.set(cacheKey, response)

    return response
  }

  private getCacheKey(data: AstroInterpretationDto): string {
    const hash = crypto.createHash('md5')
    hash.update(JSON.stringify(data.userData))
    return hash.digest('hex')
  }
}
