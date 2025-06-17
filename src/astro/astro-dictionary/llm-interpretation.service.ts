import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { Injectable } from '@nestjs/common'
import { LlmService } from 'src/llm/llm.service'
import { LlmModel } from 'src/llm/types/llm-model.enum'
import { ChatCompletionOptions } from 'src/llm/types/chat-completion-options'
import { AspectType } from 'src/astro/types/aspect.types'
import { Planet_Variables } from 'src/astro/types/common.types'
import {
  ASPECT_SYSTEM_PROMPT,
  EXAMPLE_ASPECT_INTERPRETATION_CONJUNCTION,
  EXAMPLE_ASPECT_INTERPRETATION_OPPOSITION,
  EXAMPLE_ASPECT_INTERPRETATION_QUINCUNX,
  EXAMPLE_ASPECT_INTERPRETATION_SEXTILE,
  EXAMPLE_ASPECT_INTERPRETATION_SQUARE,
  EXAMPLE_ASPECT_INTERPRETATION_TRINE,
  USER_EXAMPLE_PROMPT,
} from './constants/lm-prompts'
import { PLANET_DESCRIPTION } from '../constants'
import { LLM_CHAT_ROLE } from 'src/common/enums/llm.enum'

const ASTRO_BALANCED_PRESET: ChatCompletionOptions = {
  temperature: 0.4,
  top_p: 0.85,
  presence_penalty: 0.3,
  frequency_penalty: 0.2,
}

const EXAMPLE_BY_ASPECT_TYPE: Record<AspectType, string> = {
  [AspectType.Conjunction]: EXAMPLE_ASPECT_INTERPRETATION_CONJUNCTION,
  [AspectType.Opposition]: EXAMPLE_ASPECT_INTERPRETATION_OPPOSITION,
  [AspectType.Square]: EXAMPLE_ASPECT_INTERPRETATION_SQUARE,
  [AspectType.Trine]: EXAMPLE_ASPECT_INTERPRETATION_TRINE,
  [AspectType.Sextile]: EXAMPLE_ASPECT_INTERPRETATION_SEXTILE,
  [AspectType.Quincunx]: EXAMPLE_ASPECT_INTERPRETATION_QUINCUNX,
}

@Injectable()
export class LlmInterpretationService {
  constructor(private readonly llmService: LlmService) {}

  async generateAspectInterpretationsFromFile(): Promise<void> {
    const path = join(process.cwd(), 'src', 'astro', 'astro-dictionary', 'data', 'natal', 'aspects.json')
    const raw = readFileSync(path, 'utf-8')
    const data = JSON.parse(raw)

    for (const aspectType of Object.keys(data)) {
      for (const source of Object.keys(data[aspectType])) {
        for (const target of Object.keys(data[aspectType][source])) {
          const current = data[aspectType][source][target]
          if (typeof current === 'string' && current.includes('Заглушка')) {
            const aspect = aspectType as AspectType

            const messages = this.buildMessages(
              source as Planet_Variables,
              aspect,
              target as Planet_Variables,
            )
            const { content, finishReason } = await this.llmService.chat(
              LlmModel.MistralNemo,
              messages,
              ASTRO_BALANCED_PRESET,
            )

            if (finishReason !== 'stop') {
              console.warn(`⚠️ Пропущено: ${source}-${aspectType}-${target} → причина: ${finishReason}`)
              continue
            }

            data[aspectType][source][target] = content.trim()
            writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')
            console.log(`✅ ${source}-${aspectType}-${target} сохранено`)
          }
        }
      }
    }

    console.log('✨ Все доступные интерпретации сгенерированы и записаны.')
  }

  private buildMessages(source: Planet_Variables, aspect: AspectType, target: Planet_Variables) {
    const systemMessage = {
      role: LLM_CHAT_ROLE.SYSTEM,
      content: ASPECT_SYSTEM_PROMPT,
    }

    const exampleMessages = Object.entries(EXAMPLE_BY_ASPECT_TYPE).flatMap(([type, example]) => [
      {
        role: LLM_CHAT_ROLE.USER,
        content: USER_EXAMPLE_PROMPT.replace('{{EXAMPLE}}', example.trim()),
      },
      {
        role: LLM_CHAT_ROLE.ASSISTANT,
        content:
          'Понял. Буду писать только о ситуациях, которые реально происходят в жизни, без описания характера, внутреннего мира или эмоций.',
      },
    ])

    const finalUserPrompt = {
      role: LLM_CHAT_ROLE.USER,
      content: this.buildUserPrompt(source, aspect, target),
    }

    return [systemMessage, ...exampleMessages, finalUserPrompt]
  }

  private buildUserPrompt(source: Planet_Variables, aspect: AspectType, target: Planet_Variables): string {
    const sourceName = PLANET_DESCRIPTION[source] ?? source
    const targetName = PLANET_DESCRIPTION[target] ?? target
    const aspectPhrase = this.formatAspectInRussian(aspect)

    const hasProserpina = [source, target].includes(Planet_Variables.Proserpina)
    const proserpinaNote = hasProserpina
      ? '\n\n❗ Примечание: Прозерпина — это самостоятельная планета, не связанная с Плутоном. Не путай их.'
      : ''

    return `Проанализируй аспект ${sourceName}-${targetName} ${aspectPhrase} и сгенерируй интерпретацию.

Пиши строго по правилам:
— Только жизненные сценарии, ситуации, события.
— Никаких эмоций, описания характера, желаний, чувств.
— Не используй фразы "человек чувствует", "обладает", "стремится", "находит силу", "переживает", "испытывает".
— Не используй эзотерические формулировки: "фазы планет", "вдохновение", "личностный рост", "внутренний голос".

Ориентируйся на стиль и структуру примеров выше.${proserpinaNote}`
  }

  private formatAspectInRussian(aspect: AspectType): string {
    switch (aspect) {
      case AspectType.Conjunction:
        return 'в соединении'
      case AspectType.Opposition:
        return 'в оппозиции'
      case AspectType.Square:
        return 'в квадрате'
      case AspectType.Trine:
        return 'в тригоне'
      case AspectType.Sextile:
        return 'в секстиле'
      case AspectType.Quincunx:
        return 'в квинконсе'
      default:
        return `в аспекте (${String(aspect)})`
    }
  }
}
