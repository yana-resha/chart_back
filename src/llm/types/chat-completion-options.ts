export interface ChatCompletionOptions {
  temperature?: number
  top_p?: number
  max_tokens?: number
  stop?: string[]
  presence_penalty?: number
  frequency_penalty?: number
}
