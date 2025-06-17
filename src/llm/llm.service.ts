import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { lastValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { ChatCompletionResponse } from './types/chat-completion-response'
import { ChatCompletionOptions } from './types/chat-completion-options'
import { LlmModel } from './types/llm-model.enum'
import { ILLMChatMessage } from 'src/common/types/llm-chat.type'

export interface LlmChatResult {
  content: string
  finishReason: string | null
}

@Injectable()
export class LlmService {
  private readonly baseUrl = 'http://localhost:1234/v1'

  constructor(private readonly httpService: HttpService) {}

  async chat(
    model: LlmModel = LlmModel.MistralNemo,
    messages: ILLMChatMessage[],
    options: ChatCompletionOptions = {},
  ): Promise<LlmChatResult> {
    const payload = {
      model,
      messages,
      temperature: options.temperature ?? 0.6,
      top_p: options.top_p ?? 1,
      presence_penalty: options.presence_penalty ?? 0,
      frequency_penalty: options.frequency_penalty ?? 0,
      ...(options.stop ? { stop: options.stop } : {}),
    }

    const response: AxiosResponse<ChatCompletionResponse> = await lastValueFrom(
      this.httpService.post(`${this.baseUrl}/chat/completions`, payload),
    )

    const choice = response.data.choices[0]

    return {
      content: choice.message.content.trim(),
      finishReason: choice.finish_reason,
    }
  }
}
