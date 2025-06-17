import { LLM_CHAT_ROLE } from '../enums/llm.enum'

export interface ILLMChatMessage {
  role: LLM_CHAT_ROLE
  content: string
}
