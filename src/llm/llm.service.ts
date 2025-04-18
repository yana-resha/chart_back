import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { lastValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { ChatCompletionResponse } from './types/chat-completion-response'
import { ChatCompletionOptions } from './types/chat-completion-options'
import { LlmModel } from './types/llm-model.enum'

@Injectable()
export class LlmService {
  private readonly baseUrl = 'http://localhost:1234/v1'

  constructor(private readonly httpService: HttpService) {}

  async chat(
    model: LlmModel = LlmModel.MistralNemo,
    systemPrompt: string,
    userPrompt: string,
    options: ChatCompletionOptions = {},
  ): Promise<string> {
    const payload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.6,
      top_p: options.top_p ?? 1,
      //max_tokens: options.max_tokens ?? 1000,
      presence_penalty: options.presence_penalty ?? 0,
      frequency_penalty: options.frequency_penalty ?? 0,
      ...(options.stop ? { stop: options.stop } : {}),
    }
    const response: AxiosResponse<ChatCompletionResponse> = await lastValueFrom(
      this.httpService.post(`${this.baseUrl}/chat/completions`, payload),
    )

    console.log('Finish reason:', response.data.choices[0].finish_reason)

    return response.data.choices[0].message.content.trim()
  }
}
